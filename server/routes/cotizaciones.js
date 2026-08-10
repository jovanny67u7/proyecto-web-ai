const express = require('express');
const prisma = require('../db');
const { verificarToken, autorizarRoles } = require('../middlewares/auth');

const router = express.Router();

// Cualquier usuario autenticado puede registrar una solicitud de cotización.
router.post('/', verificarToken, async (req, res) => {
  try {
    const { productoId, modulosSeleccionados } = req.body;
    if (!productoId || !Array.isArray(modulosSeleccionados)) {
      return res.status(400).json({ error: 'productoId y modulosSeleccionados (arreglo) son obligatorios.' });
    }

    const cotizacion = await prisma.cotizacion.create({
      data: {
        usuarioId: req.usuario.id,
        productoId: Number(productoId),
        modulosSeleccionados: JSON.stringify(modulosSeleccionados),
      },
    });

    return res.status(201).json({ ...cotizacion, modulosSeleccionados });
  } catch (error) {
    console.error('Error en POST /api/cotizaciones:', error);
    return res.status(500).json({ error: 'Error al registrar la cotización.' });
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
