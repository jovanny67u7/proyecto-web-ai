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

export default function TabProductos() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [nombreCategoria, setNombreCategoria] = useState('');
  const [productoEditando, setProductoEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', categoriaId: '', modulos: '' });
  const [imagen, setImagen] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    try {
      const [cats, prods] = await Promise.all([
        apiFetch('/api/categorias'),
        apiFetch('/api/productos'),
      ]);
      setCategorias(cats);
      setProductos(prods);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const resetMensajes = () => {
    setError('');
    setMensaje('');
  };

  const crearCategoria = async (e) => {
    e.preventDefault();
    resetMensajes();
    try {
      await apiFetch('/api/categorias', { method: 'POST', body: { nombre: nombreCategoria } });
      setNombreCategoria('');
      setMensaje('Categoría creada.');
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminarCategoria = async (id) => {
    resetMensajes();
    try {
      await apiFetch(`/api/categorias/${id}`, { method: 'DELETE' });
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const iniciarEdicion = (producto) => {
    setProductoEditando(producto.id);
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoriaId: String(producto.categoriaId),
      modulos: producto.caracteristicas.join(', '),
    });
    setImagen(null);
  };

  const cancelarEdicion = () => {
    setProductoEditando(null);
    setForm({ nombre: '', descripcion: '', categoriaId: '', modulos: '' });
    setImagen(null);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    resetMensajes();

    if (!form.nombre || !form.descripcion || !form.categoriaId) {
      setError('Nombre, descripción y categoría son obligatorios.');
      return;
    }

    const datos = new FormData();
    datos.append('nombre', form.nombre);
    datos.append('descripcion', form.descripcion);
    datos.append('categoriaId', form.categoriaId);
    datos.append('modulos', form.modulos);
    if (imagen) datos.append('imagen', imagen);

    try {
      if (productoEditando) {
        await apiFetch(`/api/productos/${productoEditando}`, { method: 'PUT', body: datos, isFormData: true });
        setMensaje('Producto actualizado.');
      } else {
        await apiFetch('/api/productos', { method: 'POST', body: datos, isFormData: true });
        setMensaje('Producto creado.');
      }
      cancelarEdicion();
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminarProducto = async (id) => {
    resetMensajes();
    try {
      await apiFetch(`/api/productos/${id}`, { method: 'DELETE' });
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  if (cargando) return <p style={{ color: 'var(--text-muted)' }}>Cargando catálogo...</p>;

  return (
    <div style={panelStyles}>
      {error && <div style={errorStyles}>{error}</div>}
      {mensaje && <div style={mensajeStyles}>{mensaje}</div>}

      {/* Categorías */}
      <div style={cardStyles}>
        <h3 style={{ marginBottom: '1rem' }}>Categorías</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {categorias.map((cat) => (
            <span key={cat.id} style={chipStyles}>
              {cat.nombre}
              <button type="button" onClick={() => eliminarCategoria(cat.id)} style={chipCerrarStyles}>✕</button>
            </span>
          ))}
          {categorias.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sin categorías.</span>}
        </div>
        <form onSubmit={crearCategoria} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Nueva categoría"
            value={nombreCategoria}
            onChange={(e) => setNombreCategoria(e.target.value)}
            style={{ ...inputStyles, flex: 1 }}
            required
          />
          <button type="submit" style={secondaryBtnStyles}>Agregar</button>
        </form>
      </div>

      {/* Formulario de producto */}
      <div style={cardStyles}>
        <h3 style={{ marginBottom: '1rem' }}>{productoEditando ? 'Editar producto' : 'Nuevo producto'}</h3>
        <form onSubmit={guardarProducto}>
          <div style={formGridStyles}>
            <div>
              <label style={labelStyles}>Nombre</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                style={inputStyles}
                required
              />
            </div>
            <div>
              <label style={labelStyles}>Categoría</label>
              <select
                value={form.categoriaId}
                onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                style={inputStyles}
                required
              >
                <option value="">Selecciona...</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <label style={labelStyles}>Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            style={{ ...inputStyles, minHeight: '70px', resize: 'vertical' }}
            required
          />

          <label style={labelStyles}>Módulos disponibles (separados por coma)</label>
          <input
            type="text"
            placeholder="Ej. Respuestas en IG/Messenger, Agenda en Google Calendar"
            value={form.modulos}
            onChange={(e) => setForm({ ...form, modulos: e.target.value })}
            style={inputStyles}
          />

          <label style={labelStyles}>Imagen {productoEditando && '(opcional, deja vacío para conservar la actual)'}</label>
          <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} style={inputStyles} />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="submit" style={primaryBtnStyles}>{productoEditando ? 'Guardar cambios' : 'Crear producto'}</button>
            {productoEditando && <button type="button" onClick={cancelarEdicion} style={secondaryBtnStyles}>Cancelar</button>}
          </div>
        </form>
      </div>

      {/* Listado de productos */}
      <div style={cardStyles}>
        <h3 style={{ marginBottom: '1rem' }}>Productos ({productos.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {productos.map((producto) => (
            <div key={producto.id} className="admin-fila" style={filaProductoStyles}>
              {producto.imagenUrl ? (
                <img src={`${API_URL}${producto.imagenUrl}`} alt={producto.nombre} style={miniaturaStyles} />
              ) : (
                <div style={monogramaStyles}>{producto.nombre?.charAt(0)?.toUpperCase() || '?'}</div>
              )}
              <div className="admin-fila-info">
                <strong>{producto.nombre}</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{producto.categoria?.nombre}</p>
              </div>
              <div className="admin-fila-acciones">
                <button type="button" onClick={() => iniciarEdicion(producto)} style={secondaryBtnStyles}>Editar</button>
                <button type="button" onClick={() => eliminarProducto(producto.id)} style={dangerBtnStyles}>Eliminar</button>
              </div>
            </div>
          ))}
          {productos.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sin productos.</span>}
        </div>
      </div>
    </div>
  );
}

const chipStyles = { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(132,189,0,0.12)', border: '0.5px solid rgba(132,189,0,0.3)', color: 'var(--brand-green)', borderRadius: '999px', padding: '0.3rem 0.4rem 0.3rem 0.9rem', fontSize: '0.8rem' };
const chipCerrarStyles = { background: 'transparent', border: 'none', color: 'var(--brand-green)', cursor: 'pointer', fontSize: '0.75rem', padding: '0.2rem 0.4rem' };
const filaProductoStyles = { background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: '0.6rem', padding: '0.75rem 1rem' };
const miniaturaStyles = { width: '44px', height: '44px', borderRadius: '0.5rem', objectFit: 'cover', flexShrink: 0 };
const monogramaStyles = { ...miniaturaStyles, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(132, 189, 0, 0.1)', color: 'var(--brand-green)', fontFamily: "'Poppins', sans-serif", fontWeight: 700 };
