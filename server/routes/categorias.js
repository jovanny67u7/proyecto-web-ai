const express = require('express');
const prisma = require('../db');
const { verificarToken, autorizarRoles } = require('../middlewares/auth');

const router = express.Router();

// Pública: usada por el catálogo y por los formularios del panel de administrador.
router.get('/', async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
    return res.json(categorias);
  } catch (error) {
    console.error('Error en GET /api/categorias:', error);
    return res.status(500).json({ error: 'Error al obtener las categorías.' });
  }
});

router.post('/', verificarToken, autorizarRoles('ADMIN'), async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la categoría es obligatorio.' });
    }

    const existente = await prisma.categoria.findUnique({ where: { nombre } });
    if (existente) {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre.' });
    }

    const categoria = await prisma.categoria.create({ data: { nombre } });
    return res.status(201).json(categoria);
  } catch (error) {
    console.error('Error en POST /api/categorias:', error);
    return res.status(500).json({ error: 'Error al crear la categoría.' });
  }
});

router.delete('/:id', verificarToken, autorizarRoles('ADMIN'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const productosAsociados = await prisma.producto.count({ where: { categoriaId: id } });
    if (productosAsociados > 0) {
      return res.status(409).json({ error: 'No se puede eliminar: hay productos asignados a esta categoría.' });
    }

    await prisma.categoria.delete({ where: { id } });
    return res.json({ mensaje: 'Categoría eliminada correctamente.' });
  } catch (error) {
    console.error('Error en DELETE /api/categorias/:id:', error);
    return res.status(500).json({ error: 'Error al eliminar la categoría.' });
  }
});

module.exports = router;
