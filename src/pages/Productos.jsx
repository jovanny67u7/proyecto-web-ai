import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { contenedorVariants, itemVariants } from '../utils/motionVariants';
import { API_URL } from '../utils/authApi';
import QuoteModal from '../components/QuoteModal';

const ICONOS_POR_CATEGORIA = {
  'Chatbots IA': '🤖',
  'CRM Inteligente': '📊',
  Automatizaciones: '⚡',
};

const ProductCard = ({ producto, onCotizar }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardDynamicStyle = {
    ...productCardStyle,
    transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
    borderColor: isHovered ? 'rgba(132, 189, 0, 0.4)' : 'var(--border)',
    boxShadow: isHovered ? '0 20px 60px rgba(0,0,0,0.5)' : 'none',
  };

  const icono = ICONOS_POR_CATEGORIA[producto.categoria?.nombre] || '🛠️';

  return (
    <motion.div style={cardDynamicStyle} variants={itemVariants} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div style={cardInnerStyle}>
        <span style={badgeStyle}>{producto.categoria?.nombre}</span>
        {producto.imagenUrl ? (
          <img src={`${API_URL}${producto.imagenUrl}`} alt={producto.nombre} style={imagenStyle} />
        ) : (
          <div style={iconWrapStyle}>{icono}</div>
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
    </motion.div>
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
const iconWrapStyle = { width: '52px', height: '52px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.05)' };
const imagenStyle = { width: '52px', height: '52px', borderRadius: '1rem', objectFit: 'cover', marginBottom: '1.25rem' };
