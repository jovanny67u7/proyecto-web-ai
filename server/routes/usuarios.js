const express = require('express');
const prisma = require('../db');
const { verificarToken, autorizarRoles } = require('../middlewares/auth');

const router = express.Router();

// ADMIN: tabla de usuarios registrados. El hash de la contraseña NUNCA se incluye en el select.
// Solo ADMIN puede ver este listado — EDITOR no tiene acceso (ni ve ni gestiona usuarios).
router.get('/', verificarToken, autorizarRoles('ADMIN'), async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        activo: true,
        creadoEn: true,
        roles: { select: { rol: { select: { nombre: true } } } },
      },
      orderBy: { creadoEn: 'desc' },
    });

    const usuariosFormateados = usuarios.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      activo: u.activo,
      creadoEn: u.creadoEn,
      roles: u.roles.map((ur) => ur.rol.nombre),
    }));

    return res.json(usuariosFormateados);
  } catch (error) {
    console.error('Error en GET /api/usuarios:', error);
    return res.status(500).json({ error: 'Error al obtener los usuarios.' });
  }
});

// ADMIN: habilita/deshabilita una cuenta. Un usuario deshabilitado no puede
// iniciar sesión y, si ya tenía una sesión activa, la pierde en su siguiente
// petición (ver verificarToken en middlewares/auth.js).
router.patch('/:id/activo', verificarToken, autorizarRoles('ADMIN'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
      return res.status(400).json({ error: 'El campo "activo" debe ser true o false.' });
    }
    if (id === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes deshabilitar tu propia cuenta.' });
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: { activo },
      select: { id: true, nombre: true, email: true, activo: true },
    });

    return res.json(usuario);
  } catch (error) {
    console.error('Error en PATCH /api/usuarios/:id/activo:', error);
    return res.status(500).json({ error: 'Error al actualizar el estado de la cuenta.' });
  }
});

module.exports = router;
