import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { contenedorVariants, itemVariants } from '../utils/motionVariants';
import { API_URL } from '../utils/authApi';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/clientes`)
      .then((res) => res.json())
      .then(setClientes)
      .catch(() => setClientes([]))
      .finally(() => setCargando(false));
  }, []);

  const ClienteItem = ({ cliente }) => {
    // Los logos reales vienen diseñados para fondo claro (texto en negro/azul
    // marino); sobre el fondo oscuro del sitio se volvían casi invisibles.
    // La tarjeta blanca es el patrón estándar para "muros de logos" en sitios
    // con tema oscuro: conserva el logo tal cual lo entregó cada empresa.
    const contenido = cliente.logoUrl ? (
      <div style={logoCardStyle}>
        <img src={`${API_URL}${cliente.logoUrl}`} alt={cliente.nombreEmpresa} style={logoImgStyle} />
      </div>
    ) : (
      <h3 style={clientLogoStyle}>{cliente.nombreEmpresa}</h3>
    );

    return cliente.websiteUrl ? (
      <a href={cliente.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
        {contenido}
      </a>
    ) : (
      contenido
    );
  };

  return (
    <motion.section
      className="container"
      style={{ padding: '4rem 2rem', textAlign: 'center' }}
      variants={contenedorVariants}
      initial="oculto"
      animate="visible"
    >
      <motion.h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }} variants={itemVariants}>
        Empresas que confían en nosotros
      </motion.h2>

      {cargando && <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>}
      {!cargando && clientes.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>Aún no hay clientes registrados.</p>
      )}

      <motion.div
        style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem' }}
        variants={itemVariants}
      >
        {clientes.map((cliente) => (
          <ClienteItem key={cliente.id} cliente={cliente} />
        ))}
      </motion.div>
    </motion.section>
  );
}

const clientLogoStyle = { fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Poppins, sans-serif' };
const logoCardStyle = {
  background: '#ffffff',
  borderRadius: '1rem',
  padding: '1.25rem 2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const logoImgStyle = { height: '40px', maxWidth: '160px', objectFit: 'contain', display: 'block' };
