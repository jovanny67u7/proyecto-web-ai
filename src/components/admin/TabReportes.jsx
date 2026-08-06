import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/apiFetch';
import { cardStyles, errorStyles } from './adminStyles';

const StatCard = ({ label, value }) => (
  <div style={statCardStyles}>
    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{label}</p>
    <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>{value}</p>
  </div>
);

export default function TabReportes() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/estadisticas')
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div style={errorStyles}>{error}</div>;
  if (!stats) return <p style={{ color: 'var(--text-muted)' }}>Cargando estadísticas...</p>;

  const maxSolicitudes = Math.max(1, ...stats.productosConMasSolicitudes.map((p) => p.totalSolicitudes));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={gridStatsStyles}>
        <StatCard label="Usuarios totales" value={stats.totalUsuarios} />
        <StatCard label="Productos publicados" value={stats.totalProductos} />
        <StatCard label="Clientes de confianza" value={stats.totalClientes} />
        <StatCard label="Cotizaciones solicitadas" value={stats.totalCotizaciones} />
      </div>

      <div style={cardStyles}>
        <h3 style={{ marginBottom: '1rem' }}>Productos con más solicitudes de cotización</h3>
        {stats.productosConMasSolicitudes.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aún no hay cotizaciones registradas.</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {stats.productosConMasSolicitudes.map((p) => (
            <div key={p.productoId}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <span>{p.nombre}</span>
                <span style={{ color: 'var(--text-muted)' }}>{p.totalSolicitudes}</span>
              </div>
              <div style={barraFondoStyles}>
                <div style={{ ...barraRellenoStyles, width: `${(p.totalSolicitudes / maxSolicitudes) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const gridStatsStyles = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' };
const statCardStyles = { background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: '1rem', padding: '1.5rem' };
const barraFondoStyles = { height: '8px', borderRadius: '999px', background: 'var(--surface-2)', overflow: 'hidden' };
const barraRellenoStyles = { height: '100%', borderRadius: '999px', background: 'linear-gradient(135deg, var(--brand-green), var(--brand-blue))' };
