const express = require('express');
const prisma = require('../db');
const { verificarToken, autorizarRoles } = require('../middlewares/auth');

const router = express.Router();

// Admin: métricas básicas para el módulo de Reportes/Estadísticas.
router.get('/', verificarToken, autorizarRoles('Administrador'), async (req, res) => {
  try {
    const [totalUsuarios, totalProductos, totalClientes, totalCotizaciones, agrupadoPorProducto] =
      await Promise.all([
        prisma.usuario.count(),
        prisma.producto.count(),
        prisma.clienteConfianza.count(),
        prisma.cotizacion.count(),
        prisma.cotizacion.groupBy({
          by: ['productoId'],
          _count: { productoId: true },
          orderBy: { _count: { productoId: 'desc' } },
          take: 5,
        }),
      ]);

    const productos = await prisma.producto.findMany({
      where: { id: { in: agrupadoPorProducto.map((g) => g.productoId) } },
      select: { id: true, nombre: true },
    });
    const nombrePorId = Object.fromEntries(productos.map((p) => [p.id, p.nombre]));

    const productosConMasSolicitudes = agrupadoPorProducto.map((g) => ({
      productoId: g.productoId,
      nombre: nombrePorId[g.productoId] || 'Producto eliminado',
      totalSolicitudes: g._count.productoId,
    }));

    return res.json({
      totalUsuarios,
      totalProductos,
      totalClientes,
      totalCotizaciones,
      productosConMasSolicitudes,
    });
  } catch (error) {
    console.error('Error en GET /api/estadisticas:', error);
    return res.status(500).json({ error: 'Error al obtener las estadísticas.' });
  }
});

module.exports = router;
