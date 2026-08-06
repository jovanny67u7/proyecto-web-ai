import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_URL, obtenerUsuario, limpiarSesion } from '../utils/authApi';
import { contenedorVariants, itemVariants } from '../utils/motionVariants';
import AdminPanel from '../components/admin/AdminPanel';

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

  const cerrarSesion = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } finally {
      limpiarSesion();
      navigate('/login');
    }
  };

  const esAdmin = usuario?.roles?.includes('Administrador');
  const esEditor = usuario?.roles?.includes('Editor');

  return (
    <motion.section
      style={{ padding: '2rem 1rem', maxWidth: esAdmin ? '1100px' : '700px', margin: '0 auto' }}
      variants={contenedorVariants}
      initial="oculto"
      animate="visible"
    >
      <motion.div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }} variants={itemVariants}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>
            Hola, <span className="gradient-text">{usuario?.nombre}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>{estadoServidor}</p>
        </div>
        <button onClick={cerrarSesion} className="btn-secondary">Cerrar sesión</button>
      </motion.div>

      {esAdmin ? (
        <motion.div variants={itemVariants}>
          <AdminPanel />
        </motion.div>
      ) : (
        <>
          <motion.div style={cardStyles} variants={itemVariants}>
            <p><strong>Email:</strong> {usuario?.email}</p>
            <p><strong>Roles:</strong> {usuario?.roles?.join(', ')}</p>
          </motion.div>

          {esEditor && (
            <motion.div style={{ ...cardStyles, borderColor: 'var(--brand-blue)' }} variants={itemVariants}>
              ✏️ Módulo de edición visible para <strong>Administrador</strong> y <strong>Editor</strong>.
            </motion.div>
          )}
        </>
      )}
    </motion.section>
  );
}

const cardStyles = { background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: '0.8rem', padding: '1.25rem', marginBottom: '1rem' };
