const express = require('express');
const prisma = require('../db');
const { verificarToken, autorizarRoles } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

// Pública: alimenta la sección "Empresas que confían en nosotros".
router.get('/', async (req, res) => {
  try {
    const clientes = await prisma.clienteConfianza.findMany({ orderBy: { id: 'asc' } });
    return res.json(clientes);
  } catch (error) {
    console.error('Error en GET /api/clientes:', error);
    return res.status(500).json({ error: 'Error al obtener los clientes de confianza.' });
  }
});

router.post('/', verificarToken, autorizarRoles('Administrador'), upload.single('logo'), async (req, res) => {
  try {
    const { nombreEmpresa, websiteUrl } = req.body;
    if (!nombreEmpresa) {
      return res.status(400).json({ error: 'El nombre de la empresa es obligatorio.' });
    }

    const cliente = await prisma.clienteConfianza.create({
      data: {
        nombreEmpresa,
        websiteUrl: websiteUrl || null,
        logoUrl: req.file ? `/uploads/${req.file.filename}` : null,
      },
    });

    return res.status(201).json(cliente);
  } catch (error) {
    console.error('Error en POST /api/clientes:', error);
    return res.status(500).json({ error: 'Error al crear el cliente de confianza.' });
  }
});

router.put('/:id', verificarToken, autorizarRoles('Administrador'), upload.single('logo'), async (req, res) => {
  try {
    const { nombreEmpresa, websiteUrl } = req.body;
    const id = Number(req.params.id);

    const data = {
      ...(nombreEmpresa && { nombreEmpresa }),
      ...(websiteUrl !== undefined && { websiteUrl: websiteUrl || null }),
      ...(req.file && { logoUrl: `/uploads/${req.file.filename}` }),
    };

    const cliente = await prisma.clienteConfianza.update({ where: { id }, data });
    return res.json(cliente);
  } catch (error) {
    console.error('Error en PUT /api/clientes/:id:', error);
    return res.status(500).json({ error: 'Error al actualizar el cliente de confianza.' });
  }
});

router.delete('/:id', verificarToken, autorizarRoles('Administrador'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.clienteConfianza.delete({ where: { id } });
    return res.json({ mensaje: 'Cliente de confianza eliminado correctamente.' });
  } catch (error) {
    console.error('Error en DELETE /api/clientes/:id:', error);
    return res.status(500).json({ error: 'Error al eliminar el cliente de confianza.' });
  }
});

module.exports = router;
