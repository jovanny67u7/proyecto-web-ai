import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Lee la fecha/hora real del dispositivo para decidir qué mensaje mostrar.
// Prioriza campañas de temporada (Buen Fin, Navidad); fuera de esos meses,
// cae en un saludo dinámico según la hora del día.
function calcularContenido() {
  const ahora = new Date();
  const mes = ahora.getMonth(); // 0 = enero ... 11 = diciembre
  const hora = ahora.getHours();

  if (mes === 10) {
    return { icono: '🛍️', texto: 'Buen Fin con IA: implementa tu chatbot o CRM con condiciones especiales de temporada.' };
  }
  if (mes === 11) {
    return { icono: '🎄', texto: 'Impulsa tus ventas navideñas: deja que tu asistente de IA atienda a tus clientes 24/7 estas fiestas.' };
  }
  if (hora < 12) {
    return { icono: '☀️', texto: 'Buenos días — automatiza hoy y recupera horas de trabajo manual.' };
  }
  if (hora < 19) {
    return { icono: '🌤️', texto: 'Buenas tardes — dale a tu negocio un impulso de inteligencia artificial.' };
  }
  return { icono: '🌙', texto: 'Buenas noches — tu chatbot puede seguir vendiendo mientras descansas.' };
}

export default function BannerEstacional() {
  const [visible, setVisible] = useState(true);
  const contenido = useMemo(calcularContenido, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          style={bannerStyles}
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <motion.span
            style={{ fontSize: '1.1rem', lineHeight: 1 }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {contenido.icono}
          </motion.span>
          <p style={textoStyles}>{contenido.texto}</p>
          <button type="button" onClick={() => setVisible(false)} style={cerrarStyles} aria-label="Cerrar aviso">✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const bannerStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  maxWidth: '640px',
  margin: '1.5rem auto 0',
  background: 'rgba(132, 189, 0, 0.08)',
  border: '0.5px solid rgba(132, 189, 0, 0.3)',
  borderRadius: '999px',
  padding: '0.6rem 1rem 0.6rem 1.25rem',
};
const textoStyles = { flex: 1, fontSize: '0.82rem', color: 'var(--text)', margin: 0 };
const cerrarStyles = { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0 };
