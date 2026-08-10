import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/apiFetch';
import { API_URL } from '../../utils/authApi';
import {
  panelStyles,
  cardStyles,
  inputStyles,
  labelStyles,
  formGridStyles,
  primaryBtnStyles,
  dangerBtnStyles,
  secondaryBtnStyles,
  errorStyles,
  mensajeStyles,
} from './adminStyles';

export default function TabClientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nombreEmpresa: '', websiteUrl: '' });
  const [logo, setLogo] = useState(null);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargarClientes = async () => {
    try {
      setClientes(await apiFetch('/api/clientes'));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const resetMensajes = () => {
    setError('');
    setMensaje('');
  };

  const iniciarEdicion = (cliente) => {
    setClienteEditando(cliente.id);
    setForm({ nombreEmpresa: cliente.nombreEmpresa, websiteUrl: cliente.websiteUrl || '' });
    setLogo(null);
  };

  const cancelarEdicion = () => {
    setClienteEditando(null);
    setForm({ nombreEmpresa: '', websiteUrl: '' });
    setLogo(null);
  };

  const guardarCliente = async (e) => {
    e.preventDefault();
    resetMensajes();

    if (!form.nombreEmpresa) {
      setError('El nombre de la empresa es obligatorio.');
      return;
    }

    const datos = new FormData();
    datos.append('nombreEmpresa', form.nombreEmpresa);
    datos.append('websiteUrl', form.websiteUrl);
    if (logo) datos.append('logo', logo);

    try {
      if (clienteEditando) {
        await apiFetch(`/api/clientes/${clienteEditando}`, { method: 'PUT', body: datos, isFormData: true });
        setMensaje('Cliente actualizado.');
      } else {
        await apiFetch('/api/clientes', { method: 'POST', body: datos, isFormData: true });
        setMensaje('Cliente creado.');
      }
      cancelarEdicion();
      cargarClientes();
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminarCliente = async (id) => {
    resetMensajes();
    try {
      await apiFetch(`/api/clientes/${id}`, { method: 'DELETE' });
      cargarClientes();
    } catch (err) {
      setError(err.message);
    }
  };

  if (cargando) return <p style={{ color: 'var(--text-muted)' }}>Cargando clientes...</p>;

  return (
    <div style={panelStyles}>
      {error && <div style={errorStyles}>{error}</div>}
      {mensaje && <div style={mensajeStyles}>{mensaje}</div>}

      <div style={cardStyles}>
        <h3 style={{ marginBottom: '1rem' }}>{clienteEditando ? 'Editar cliente de confianza' : 'Nuevo cliente de confianza'}</h3>
        <form onSubmit={guardarCliente}>
          <div style={formGridStyles}>
            <div>
              <label style={labelStyles}>Nombre de la empresa</label>
              <input
                type="text"
                value={form.nombreEmpresa}
                onChange={(e) => setForm({ ...form, nombreEmpresa: e.target.value })}
                style={inputStyles}
                required
              />
            </div>
            <div>
              <label style={labelStyles}>Sitio web (opcional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.websiteUrl}
                onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                style={inputStyles}
              />
            </div>
          </div>

          <label style={labelStyles}>Logo {clienteEditando && '(opcional, deja vacío para conservar el actual)'}</label>
          <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} style={inputStyles} />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="submit" style={primaryBtnStyles}>{clienteEditando ? 'Guardar cambios' : 'Agregar cliente'}</button>
            {clienteEditando && <button type="button" onClick={cancelarEdicion} style={secondaryBtnStyles}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div style={cardStyles}>
        <h3 style={{ marginBottom: '1rem' }}>Clientes ({clientes.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {clientes.map((cliente) => (
            <div key={cliente.id} className="admin-fila" style={filaStyles}>
              {cliente.logoUrl ? (
                <img src={`${API_URL}${cliente.logoUrl}`} alt={cliente.nombreEmpresa} style={miniaturaStyles} />
              ) : (
                <div style={{ ...miniaturaStyles, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>🏢</div>
              )}
              <div className="admin-fila-info">
                <strong>{cliente.nombreEmpresa}</strong>
                {cliente.websiteUrl && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cliente.websiteUrl}</p>
                )}
              </div>
              <div className="admin-fila-acciones">
                <button type="button" onClick={() => iniciarEdicion(cliente)} style={secondaryBtnStyles}>Editar</button>
                <button type="button" onClick={() => eliminarCliente(cliente.id)} style={dangerBtnStyles}>Eliminar</button>
              </div>
            </div>
          ))}
          {clientes.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sin clientes registrados.</span>}
        </div>
      </div>
    </div>
  );
}

const filaStyles = { background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: '0.6rem', padding: '0.75rem 1rem' };
const miniaturaStyles = { width: '44px', height: '44px', borderRadius: '0.5rem', objectFit: 'cover', flexShrink: 0 };
