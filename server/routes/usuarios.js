const express = require('express');
const prisma = require('../db');
const { verificarToken, autorizarRoles } = require('../middlewares/auth');

const router = express.Router();

// Admin: tabla de usuarios registrados. El hash de la contraseña NUNCA se incluye en el select.
router.get('/', verificarToken, autorizarRoles('Administrador'), async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        creadoEn: true,
        roles: { select: { rol: { select: { nombre: true } } } },
      },
      orderBy: { creadoEn: 'desc' },
    });

    const usuariosFormateados = usuarios.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      creadoEn: u.creadoEn,
      roles: u.roles.map((ur) => ur.rol.nombre),
    }));

    return res.json(usuariosFormateados);
  } catch (error) {
    console.error('Error en GET /api/usuarios:', error);
    return res.status(500).json({ error: 'Error al obtener los usuarios.' });
  }
});

module.exports = router;
