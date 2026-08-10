import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/apiFetch';
import { cardStyles, errorStyles, tableStyles, thStyles, tdStyles, secondaryBtnStyles, dangerBtnStyles } from './adminStyles';

export default function TabUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [actualizandoId, setActualizandoId] = useState(null);

  useEffect(() => {
    apiFetch('/api/usuarios')
      .then(setUsuarios)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  const alternarActivo = async (usuario) => {
    setError('');
    setActualizandoId(usuario.id);
    try {
      const actualizado = await apiFetch(`/api/usuarios/${usuario.id}/activo`, {
        method: 'PATCH',
        body: { activo: !usuario.activo },
      });
      setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? { ...u, activo: actualizado.activo } : u)));
    } catch (err) {
      setError(err.message);
    } finally {
      setActualizandoId(null);
    }
  };

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
              <th style={thStyles}>Estado</th>
              <th style={thStyles}>Registrado</th>
              <th style={thStyles}></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td style={tdStyles}>{u.nombre}</td>
                <td style={tdStyles}>{u.email}</td>
                <td style={tdStyles}>{u.roles.join(', ')}</td>
                <td style={tdStyles}>
                  <span style={u.activo ? estadoActivoStyles : estadoInactivoStyles}>
                    <span style={{ ...puntoEstadoStyles, background: u.activo ? 'var(--brand-green)' : '#ff6b6b' }} />
                    {u.activo ? 'Activo' : 'Deshabilitado'}
                  </span>
                </td>
                <td style={tdStyles}>{new Date(u.creadoEn).toLocaleDateString('es-MX')}</td>
                <td style={tdStyles}>
                  <button
                    type="button"
                    onClick={() => alternarActivo(u)}
                    disabled={actualizandoId === u.id}
                    style={u.activo ? dangerBtnStyles : secondaryBtnStyles}
                  >
                    {actualizandoId === u.id ? 'Guardando...' : u.activo ? 'Deshabilitar' : 'Habilitar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const estadoBaseStyles = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: '0.78rem',
  fontWeight: 600,
};
const estadoActivoStyles = { ...estadoBaseStyles, color: 'var(--brand-green)' };
const estadoInactivoStyles = { ...estadoBaseStyles, color: '#ff6b6b' };
const puntoEstadoStyles = { width: '7px', height: '7px', borderRadius: '50%', display: 'inline-block' };
