import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { obtenerUsuario } from '../utils/authApi';
import { apiFetch } from '../utils/apiFetch';

const NUMERO_WHATSAPP = '524426150681';

export default function QuoteModal({ producto, onClose }) {
  const usuario = obtenerUsuario();
  const [seleccionados, setSeleccionados] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const alternarModulo = (modulo) => {
    setSeleccionados((prev) =>
      prev.includes(modulo) ? prev.filter((m) => m !== modulo) : [...prev, modulo]
    );
  };

  const enviarCotizacion = async (e) => {
    e.preventDefault();
    if (seleccionados.length === 0) {
      setError('Selecciona al menos un módulo para continuar.');
      return;
    }
    setError('');
    setEnviando(true);

    try {
      await apiFetch('/api/cotizaciones', {
        method: 'POST',
        body: { productoId: producto.id, modulosSeleccionados: seleccionados },
      });

      const mensaje =
        `Hola, mi nombre es ${usuario.nombre}. Me interesa solicitar una cotización para el servicio de ` +
        `${producto.nombre}. He seleccionado los siguientes módulos: ${seleccionados.join(', ')}. ` +
        `Quedo atento a su respuesta.`;

      const urlWhatsapp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
      window.open(urlWhatsapp, '_blank', 'noopener,noreferrer');
      onClose();
    } catch (err) {
      setError(err.message || 'No se pudo registrar la cotización.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={overlayStyles} onClick={onClose}>
      <motion.div
        style={cardStyles}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <button type="button" onClick={onClose} style={cerrarStyles} aria-label="Cerrar">✕</button>

        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>Solicitar cotización</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          {producto.nombre} — selecciona los módulos que te interesan
        </p>

        <form onSubmit={enviarCotizacion}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {producto.caracteristicas.map((modulo) => (
              <label key={modulo} style={checkboxLabelStyles}>
                <input
                  type="checkbox"
                  checked={seleccionados.includes(modulo)}
                  onChange={() => alternarModulo(modulo)}
                  style={{ accentColor: 'var(--brand-green)', width: '18px', height: '18px' }}
                />
                {modulo}
              </label>
            ))}
          </div>

          {error && <div style={errorStyles}>{error}</div>}

          <button type="submit" className="btn-primary" disabled={enviando} style={{ width: '100%', justifyContent: 'center' }}>
            {enviando ? 'Enviando...' : 'Continuar por WhatsApp ↗'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

const overlayStyles = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.7)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  padding: '1rem',
};

const cardStyles = {
  position: 'relative',
  background: 'var(--surface)',
  border: '0.5px solid var(--border)',
  borderRadius: '1rem',
  padding: '2rem',
  width: '100%',
  maxWidth: '420px',
  maxHeight: '85vh',
  overflowY: 'auto',
};

const cerrarStyles = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'transparent',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  fontSize: '1rem',
};

const checkboxLabelStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  fontSize: '0.9rem',
  color: 'var(--text)',
  cursor: 'pointer',
  background: 'var(--surface-2)',
  border: '0.5px solid var(--border)',
  borderRadius: '0.6rem',
  padding: '0.75rem 1rem',
};

const errorStyles = {
  background: 'rgba(255,60,60,0.1)',
  border: '0.5px solid rgba(255,60,60,0.3)',
  color: '#ff6b6b',
  borderRadius: '0.6rem',
  padding: '0.6rem 1rem',
  marginBottom: '1rem',
  fontSize: '0.8rem',
};
