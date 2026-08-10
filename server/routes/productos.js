const express = require('express');
const prisma = require('../db');
const { verificarToken, autorizarRoles } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

function serializarProducto(producto) {
  return { ...producto, caracteristicas: JSON.parse(producto.caracteristicas) };
}

function moduloTextoAJson(texto) {
  const modulos = (texto || '')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
  return JSON.stringify(modulos);
}

// Pública: catálogo del sitio.
router.get('/', async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      include: { categoria: true },
      orderBy: { creadoEn: 'desc' },
    });
    return res.json(productos.map(serializarProducto));
  } catch (error) {
    console.error('Error en GET /api/productos:', error);
    return res.status(500).json({ error: 'Error al obtener los productos.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const producto = await prisma.producto.findUnique({
      where: { id: Number(req.params.id) },
      include: { categoria: true },
    });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado.' });
    return res.json(serializarProducto(producto));
  } catch (error) {
    console.error('Error en GET /api/productos/:id:', error);
    return res.status(500).json({ error: 'Error al obtener el producto.' });
  }
});

router.post('/', verificarToken, autorizarRoles('ADMIN', 'EDITOR'), upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, descripcion, categoriaId, modulos } = req.body;
    if (!nombre || !descripcion || !categoriaId) {
      return res.status(400).json({ error: 'nombre, descripcion y categoriaId son obligatorios.' });
    }

    const producto = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        categoriaId: Number(categoriaId),
        caracteristicas: moduloTextoAJson(modulos),
        imagenUrl: req.file ? `/uploads/${req.file.filename}` : null,
      },
      include: { categoria: true },
    });

    return res.status(201).json(serializarProducto(producto));
  } catch (error) {
    console.error('Error en POST /api/productos:', error);
    return res.status(500).json({ error: 'Error al crear el producto.' });
  }
});

router.put('/:id', verificarToken, autorizarRoles('ADMIN', 'EDITOR'), upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, descripcion, categoriaId, modulos } = req.body;
    const id = Number(req.params.id);

    const data = {
      ...(nombre && { nombre }),
      ...(descripcion && { descripcion }),
      ...(categoriaId && { categoriaId: Number(categoriaId) }),
      ...(modulos !== undefined && { caracteristicas: moduloTextoAJson(modulos) }),
      ...(req.file && { imagenUrl: `/uploads/${req.file.filename}` }),
    };

    const producto = await prisma.producto.update({ where: { id }, data, include: { categoria: true } });
    return res.json(serializarProducto(producto));
  } catch (error) {
    console.error('Error en PUT /api/productos/:id:', error);
    return res.status(500).json({ error: 'Error al actualizar el producto.' });
  }
});

router.delete('/:id', verificarToken, autorizarRoles('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.cotizacion.deleteMany({ where: { productoId: id } });
    await prisma.producto.delete({ where: { id } });
    return res.json({ mensaje: 'Producto eliminado correctamente.' });
  } catch (error) {
    console.error('Error en DELETE /api/productos/:id:', error);
    return res.status(500).json({ error: 'Error al eliminar el producto.' });
  }
});

module.exports = router;
