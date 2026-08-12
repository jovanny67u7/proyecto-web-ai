import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_URL, obtenerUsuario, limpiarSesion } from '../utils/authApi';
import { contenedorVariants, itemVariants } from '../utils/motionVariants';
import AdminPanel from '../components/admin/AdminPanel';

const BADGE_POR_ROL = {
  ADMIN: { texto: 'Administrador', color: 'var(--brand-green)' },
  EDITOR: { texto: 'Editor', color: 'var(--brand-blue)' },
  USER: { texto: 'Cliente', color: 'var(--text-muted)' },
};

export default function Dashboard() {
  const [estadoServidor, setEstadoServidor] = useState('Validando sesión con el servidor...');
  const navigate = useNavigate();
  const usuario = obtenerUsuario();

  // Aunque el token ya se validó en ProtectedRoute, aquí confirmamos contra el
  // backend que la sesión sigue siendo válida (protección real, no solo de UI).
  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch(`${API_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const datos = await res.json();
        if (!res.ok) throw new Error(datos.error);
        setEstadoServidor(datos.mensaje);
      })
      .catch(() => {
        limpiarSesion();
        navigate('/login');
      });
  }, [navigate]);

  const esAdmin = usuario?.roles?.includes('ADMIN');
  const esEditor = usuario?.roles?.includes('EDITOR');
  const tieneAccesoAlPanel = esAdmin || esEditor;
  const rolPrincipal = esAdmin ? 'ADMIN' : esEditor ? 'EDITOR' : 'USER';
  const badge = BADGE_POR_ROL[rolPrincipal];

  return (
    <motion.section
      style={{ padding: '2rem 1rem', maxWidth: tieneAccesoAlPanel ? '1100px' : '700px', margin: '0 auto' }}
      variants={contenedorVariants}
      initial="oculto"
      animate="visible"
    >
      <motion.div style={dashboardHeaderStyles} variants={itemVariants}>
        <Link to="/" style={volverStyles}>← Volver al sitio</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <h1 style={{ marginBottom: 0 }}>
            Hola, <span className="gradient-text">{usuario?.nombre}</span>
          </h1>
          <span style={{ ...rolBadgeStyles, color: badge.color, borderColor: badge.color }}>{badge.texto}</span>
        </div>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{estadoServidor}</p>
      </motion.div>

      {tieneAccesoAlPanel ? (
        <motion.div variants={itemVariants}>
          <AdminPanel rol={esAdmin ? 'ADMIN' : 'EDITOR'} />
        </motion.div>
      ) : (
        <motion.div style={cardStyles} variants={itemVariants}>
          <p><strong>Email:</strong> {usuario?.email}</p>
          <p><strong>Roles:</strong> {usuario?.roles?.join(', ')}</p>
        </motion.div>
      )}
    </motion.section>
  );
}

const cardStyles = { background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: '0.8rem', padding: '1.25rem', marginBottom: '1rem' };
const dashboardHeaderStyles = { marginBottom: '2rem' };
const volverStyles = { display: 'inline-block', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem', marginBottom: '1rem' };
const rolBadgeStyles = {
  display: 'inline-flex',
  alignItems: 'center',
  border: '0.5px solid',
  borderRadius: '999px',
  padding: '0.25rem 0.85rem',
  fontSize: '0.7rem',
  fontWeight: 600,
  fontFamily: "'Poppins', sans-serif",
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};
