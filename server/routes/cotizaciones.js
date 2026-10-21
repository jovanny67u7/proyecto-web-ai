const express = require('express');
const prisma = require('../db');
const { verificarToken, autorizarRoles } = require('../middlewares/auth');
const { emitirLead } = require('../realtime/reloj');

const router = express.Router();

// Ventana en la que una misma solicitud (usuario + producto + módulos) se
// considera un doble envío y no se vuelve a guardar ni a notificar.
const VENTANA_DUPLICADO_MS = 2 * 60 * 1000;

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONO = /^\+?[0-9]{10,15}$/;

// Devuelve la lista de errores (vacía si todo es válido). nombre/correo vienen
// del usuario autenticado; teléfono es opcional porque la página no lo envía.
function validarCotizacion({ productoId, modulosSeleccionados, telefono }, usuario) {
  const errores = [];
  if (!Number.isInteger(Number(productoId)) || Number(productoId) <= 0) {
    errores.push('productoId debe ser un entero positivo.');
  }
  if (!Array.isArray(modulosSeleccionados) || modulosSeleccionados.length === 0) {
    errores.push('modulosSeleccionados debe ser un arreglo con al menos un módulo.');
  } else if (modulosSeleccionados.some((m) => typeof m !== 'string' || !m.trim())) {
    errores.push('Cada módulo debe ser un texto no vacío.');
  }
  if (telefono !== undefined && telefono !== null && telefono !== '') {
    if (!REGEX_TELEFONO.test(String(telefono).replace(/[\s()-]/g, ''))) {
      errores.push('telefono debe tener de 10 a 15 dígitos (puede iniciar con +).');
    }
  }
  if (!usuario?.nombre || String(usuario.nombre).trim().length < 2) {
    errores.push('El nombre del usuario es obligatorio (mínimo 2 caracteres).');
  }
  if (!usuario?.email || !REGEX_CORREO.test(usuario.email)) {
    errores.push('El correo del usuario no es válido.');
  }
  return errores;
}

// Cualquier usuario autenticado puede registrar una solicitud de cotización.
router.post('/', verificarToken, async (req, res) => {
  try {
    const { productoId, modulosSeleccionados, telefono } = req.body || {};

    const errores = validarCotizacion(req.body || {}, req.usuario);
    if (errores.length) {
      // `error` se conserva porque la página muestra ese campo tal cual.
      return res.status(400).json({ error: errores.join(' '), errores });
    }

    const producto = await prisma.producto.findUnique({ where: { id: Number(productoId) } });
    if (!producto) {
      return res.status(400).json({ error: 'El producto no existe.', errores: ['El producto no existe.'] });
    }

    const modulosJson = JSON.stringify(modulosSeleccionados);
    const duplicada = await prisma.cotizacion.findFirst({
      where: {
        usuarioId: req.usuario.id,
        productoId: producto.id,
        modulosSeleccionados: modulosJson,
        fecha: { gte: new Date(Date.now() - VENTANA_DUPLICADO_MS) },
      },
    });
    if (duplicada) {
      return res.status(409).json({
        error: 'Ya registramos esta misma solicitud hace un momento.',
        cotizacionId: duplicada.id,
      });
    }

    const telefonoLimpio = telefono ? String(telefono).replace(/[\s()-]/g, '') : null;
    const cotizacion = await prisma.cotizacion.create({
      data: {
        usuarioId: req.usuario.id,
        productoId: producto.id,
        modulosSeleccionados: modulosJson,
        telefono: telefonoLimpio,
      },
    });

    res.status(201).json({ ...cotizacion, modulosSeleccionados });

    // Después de responder: no bloquea ni puede tumbar la respuesta al cliente.
    emitirLead({
      evento: 'nueva_cotizacion',
      origen: 'cotizacion',
      cotizacionId: cotizacion.id,
      nombre: req.usuario.nombre,
      servicio: producto.nombre,
      telefono: telefonoLimpio,
      hora: cotizacion.fecha.toISOString(),
    });
  } catch (error) {
    console.error('Error en POST /api/cotizaciones:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Error al registrar la cotización.' });
    }
  }
});

// Admin: listado de solicitudes de cotización.
router.get('/', verificarToken, autorizarRoles('ADMIN'), async (req, res) => {
  try {
    const cotizaciones = await prisma.cotizacion.findMany({
      include: {
        usuario: { select: { id: true, nombre: true, email: true } },
        producto: { select: { id: true, nombre: true } },
      },
      orderBy: { fecha: 'desc' },
    });

    return res.json(
      cotizaciones.map((c) => ({ ...c, modulosSeleccionados: JSON.parse(c.modulosSeleccionados) }))
    );
  } catch (error) {
    console.error('Error en GET /api/cotizaciones:', error);
    return res.status(500).json({ error: 'Error al obtener las cotizaciones.' });
  }
});

module.exports = router;
