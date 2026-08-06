import React, { useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);

  const manejarEnvio = (e) => {
    e.preventDefault();
    setEnviado(true);
    setForm({ nombre: '', email: '', mensaje: '' });
  };

  if (enviado) {
    return (
      <p style={{ color: 'var(--brand-green)', fontSize: '0.85rem' }}>
        ¡Gracias, {form.nombre || 'gracias por escribirnos'}! Recibimos tu mensaje y te contactaremos pronto.
      </p>
    );
  }

  return (
    <form onSubmit={manejarEnvio} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <input
        type="text"
        placeholder="Tu nombre"
        required
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        style={inputStyles}
      />
      <input
        type="email"
        placeholder="tu@correo.com"
        required
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        style={inputStyles}
      />
      <textarea
        placeholder="¿En qué podemos ayudarte?"
        required
        rows={3}
        value={form.mensaje}
        onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
        style={{ ...inputStyles, resize: 'vertical' }}
      />
      <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1rem', justifyContent: 'center' }}>
        Enviar mensaje
      </button>
    </form>
  );
}

const inputStyles = {
  background: 'var(--surface)',
  border: '0.5px solid var(--border)',
  borderRadius: '0.6rem',
  padding: '0.6rem 0.9rem',
  color: 'var(--text)',
  outline: 'none',
  fontSize: '0.82rem',
  fontFamily: 'inherit',
};
