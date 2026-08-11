import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/apiFetch';
import { obtenerUsuario } from '../../utils/authApi';
import { cardStyles, errorStyles, inputStyles, tableStyles, thStyles, tdStyles, secondaryBtnStyles, dangerBtnStyles } from './adminStyles';

const ROLES_DISPONIBLES = ['ADMIN', 'EDITOR', 'USER'];

export default function TabUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [actualizandoId, setActualizandoId] = useState(null);
  const usuarioActual = obtenerUsuario();

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

  const cambiarRol = async (usuario, nuevoRol) => {
    setError('');
    setActualizandoId(usuario.id);
    try {
      const actualizado = await apiFetch(`/api/usuarios/${usuario.id}/rol`, {
        method: 'PATCH',
        body: { rol: nuevoRol },
      });
      setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? { ...u, roles: actualizado.roles } : u)));
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
                <td style={tdStyles}>
                  {u.id === usuarioActual?.id ? (
                    u.roles.join(', ')
                  ) : (
                    <select
                      value={u.roles[0] || 'USER'}
                      onChange={(e) => cambiarRol(u, e.target.value)}
                      disabled={actualizandoId === u.id}
                      style={rolSelectStyles}
                    >
                      {ROLES_DISPONIBLES.map((rol) => (
                        <option key={rol} value={rol}>{rol}</option>
                      ))}
                    </select>
                  )}
                </td>
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

const rolSelectStyles = { ...inputStyles, width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.8rem' };
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
