import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { API_URL } from '../utils/authApi';
import { contenedorVariants, itemVariants } from '../utils/motionVariants';
import QuoteModal from '../components/QuoteModal';

const ProductCard = ({ producto, onCotizar }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardDynamicStyle = {
    ...productCardStyle,
    transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
    borderColor: isHovered ? 'rgba(132, 189, 0, 0.5)' : 'var(--border)',
    boxShadow: isHovered ? '0 20px 50px rgba(132, 189, 0, 0.35)' : 'none',
  };

  // Monograma con la inicial del producto: fallback limpio mientras no se
  // suba una imagen real desde el panel de administración.
  const inicial = producto.nombre?.charAt(0)?.toUpperCase() || '?';

  return (
    <motion.article
      style={{ position: 'relative', ...cardDynamicStyle }}
      variants={itemVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip que aparece al pasar el puntero: adelanta los módulos incluidos */}
      <AnimatePresence>
        {isHovered && producto.caracteristicas?.length > 0 && (
          <motion.div
            style={tooltipStyle}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <strong style={tooltipTituloStyle}>Incluye</strong>
            <ul style={tooltipListaStyle}>
              {producto.caracteristicas.slice(0, 4).map((modulo) => (
                <li key={modulo}>{modulo}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={cardInnerStyle}>
        <span style={badgeStyle}>{producto.categoria?.nombre}</span>
        {producto.imagenUrl ? (
          <img src={`${API_URL}${producto.imagenUrl}`} alt={producto.nombre} style={imagenStyle} />
        ) : (
          <div style={iconWrapStyle}>{inicial}</div>
        )}
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{producto.nombre}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{producto.descripcion}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Precio bajo cotización personalizada
        </p>
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onCotizar(producto)}>
          Solicitar cotización ↗
        </button>
      </div>
    </motion.article>
  );
};

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/productos`)
      .then(async (res) => {
        if (!res.ok) throw new Error('No se pudieron cargar los productos.');
        return res.json();
      })
      .then(setProductos)
      .catch(() => setError('No se pudieron cargar los productos. Intenta más tarde.'))
      .finally(() => setCargando(false));
  }, []);

  const manejarCotizar = (producto) => {
    const autenticado = !!localStorage.getItem('token');
    if (!autenticado) {
      navigate('/login');
      return;
    }
    setProductoSeleccionado(producto);
  };

  return (
    <motion.section
      className="container"
      style={{ padding: '2rem' }}
      variants={contenedorVariants}
      initial="oculto"
      animate="visible"
    >
      <motion.div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }} variants={itemVariants}>
        <Link to="/" style={{ color: 'var(--brand-green)', textDecoration: 'none' }}>Inicio</Link> &gt;
        <span style={{ color: 'var(--text)' }}> Productos</span>
      </motion.div>
      <motion.h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }} variants={itemVariants}>
        Nuestros productos
      </motion.h2>

      {cargando && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Cargando productos...</p>}
      {error && <p style={{ textAlign: 'center', color: '#ff6b6b' }}>{error}</p>}
      {!cargando && !error && productos.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Aún no hay productos publicados.</p>
      )}

      <div style={gridStyle}>
        {productos.map((producto) => (
          <ProductCard key={producto.id} producto={producto} onCotizar={manejarCotizar} />
        ))}
      </div>

      {productoSeleccionado && (
        <QuoteModal producto={productoSeleccionado} onClose={() => setProductoSeleccionado(null)} />
      )}
    </motion.section>
  );
}

const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' };
const productCardStyle = { background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', borderRadius: '1.8rem', padding: '0.18rem', transition: 'all 0.3s ease' };
const cardInnerStyle = { background: 'var(--surface-2)', borderRadius: 'calc(1.8rem - 3px)', padding: '2rem', height: '100%' };
const badgeStyle = { display: 'inline-block', background: 'rgba(132, 189, 0, 0.15)', color: 'var(--brand-green)', border: '0.5px solid rgba(132, 189, 0, 0.3)', borderRadius: '999px', padding: '0.25rem 0.75rem', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1.5rem' };
const iconWrapStyle = {
  width: '52px',
  height: '52px',
  borderRadius: '1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.3rem',
  fontWeight: 700,
  fontFamily: "'Poppins', sans-serif",
  color: 'var(--brand-green)',
  marginBottom: '1.25rem',
  background: 'rgba(132, 189, 0, 0.1)',
};
const imagenStyle = { width: '52px', height: '52px', borderRadius: '1rem', objectFit: 'cover', marginBottom: '1.25rem' };
const tooltipStyle = {
  position: 'absolute',
  bottom: 'calc(100% + 10px)',
  left: 0,
  right: 0,
  background: 'var(--brand-dark)',
  border: '0.5px solid rgba(132, 189, 0, 0.4)',
  borderRadius: '0.8rem',
  padding: '0.9rem 1.1rem',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  zIndex: 10,
};
const tooltipTituloStyle = { color: 'var(--brand-green)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Poppins', sans-serif" };
const tooltipListaStyle = { margin: '0.5rem 0 0', paddingLeft: '1.1rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 };
