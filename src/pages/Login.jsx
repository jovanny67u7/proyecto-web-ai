import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_URL, guardarSesion } from '../utils/authApi';
import { contenedorVariants, itemVariants } from '../utils/motionVariants';

export default function Login() {
  const [modo, setModo] = useState('login'); // 'login' | 'registro'
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const resetMensajes = () => {
    setError('');
    setMensaje('');
  };

  const manejarLogin = async (e) => {
    e.preventDefault();
    resetMensajes();
    setCargando(true);

    try {
      const respuesta = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error || 'No se pudo iniciar sesión.');
        return;
      }

      guardarSesion(datos.token, datos.usuario);
      navigate('/dashboard');
    } catch {
      setError('No se pudo conectar con el servidor. ¿Está corriendo en el puerto 3001?');
    } finally {
      setCargando(false);
    }
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    resetMensajes();
    setCargando(true);

    try {
      const respuesta = await fetch(`${API_URL}/api/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error || 'No se pudo completar el registro.');
        return;
      }

      setMensaje('Cuenta creada correctamente. Ahora inicia sesión.');
      setModo('login');
      setPassword('');
    } catch {
      setError('No se pudo conectar con el servidor. ¿Está corriendo en el puerto 3001?');
    } finally {
      setCargando(false);
    }
  };

  return (
    <motion.section style={contenedorStyles} variants={contenedorVariants} initial="oculto" animate="visible">
      <motion.div style={cardStyles} variants={itemVariants}>
        <div style={tabsStyles}>
          <button
            type="button"
            onClick={() => { setModo('login'); resetMensajes(); }}
            style={modo === 'login' ? tabActivaStyles : tabStyles}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => { setModo('registro'); resetMensajes(); }}
            style={modo === 'registro' ? tabActivaStyles : tabStyles}
          >
            Registrarse
          </button>
        </div>

        {error && <div style={errorStyles}>{error}</div>}
        {mensaje && <div style={mensajeStyles}>{mensaje}</div>}

        {modo === 'login' ? (
          <form onSubmit={manejarLogin} style={formStyles}>
            <input
              type="email"
              placeholder="tu@correo.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyles}
            />
            <input
              type="password"
              placeholder="Contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyles}
            />
            <button type="submit" className="btn-primary" disabled={cargando} style={{ justifyContent: 'center' }}>
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        ) : (
          <form onSubmit={manejarRegistro} style={formStyles}>
            <input
              type="text"
              placeholder="Nombre completo"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={inputStyles}
            />
            <input
              type="email"
              placeholder="tu@correo.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyles}
            />
            <input
              type="password"
              placeholder="Contraseña (mín. 6 caracteres)"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyles}
            />
            <button type="submit" className="btn-primary" disabled={cargando} style={{ justifyContent: 'center' }}>
              {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        )}
      </motion.div>
    </motion.section>
  );
}

const contenedorStyles = { minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' };
const cardStyles = { background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '380px' };
const tabsStyles = { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' };
const tabStyles = { flex: 1, background: 'transparent', border: '0.5px solid var(--border)', borderRadius: '999px', padding: '0.6rem', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontSize: '0.85rem' };
const tabActivaStyles = { ...tabStyles, background: 'linear-gradient(135deg, var(--brand-green), var(--brand-blue))', color: '#fff', border: 'none' };
const formStyles = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const inputStyles = { background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: '0.6rem', padding: '0.75rem 1rem', color: 'var(--text)', outline: 'none', fontSize: '0.9rem' };
const errorStyles = { background: 'rgba(255,60,60,0.1)', border: '0.5px solid rgba(255,60,60,0.3)', color: '#ff6b6b', borderRadius: '0.6rem', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' };
const mensajeStyles = { background: 'rgba(132,189,0,0.1)', border: '0.5px solid rgba(132,189,0,0.3)', color: 'var(--brand-green)', borderRadius: '0.6rem', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' };