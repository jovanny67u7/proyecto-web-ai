import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/apiFetch';
import { cardStyles, errorStyles, tableStyles, thStyles, tdStyles } from './adminStyles';

export default function TabUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    apiFetch('/api/usuarios')
      .then(setUsuarios)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p style={{ color: 'var(--text-muted)' }}>Cargando usuarios...</p>;

  return (
    <div style={cardStyles}>
      <h3 style={{ marginBottom: '1rem' }}>Usuarios registrados ({usuarios.length})</h3>
      {error && <div style={errorStyles}>{error}</div>}

      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyles}>
          <thead>
            <tr>
              <th style={thStyles}>Nombre</th>
              <th style={thStyles}>Email</th>
              <th style={thStyles}>Roles</th>
              <th style={thStyles}>Registrado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td style={tdStyles}>{u.nombre}</td>
                <td style={tdStyles}>{u.email}</td>
                <td style={tdStyles}>{u.roles.join(', ')}</td>
                <td style={tdStyles}>{new Date(u.creadoEn).toLocaleDateString('es-MX')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
