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
          className="banner-estacional"
          style={bannerStyles}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div style={contenidoStyles}>
            <motion.span
              style={{ fontSize: '1.1rem', lineHeight: 1 }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {contenido.icono}
            </motion.span>
            <p style={textoStyles}>{contenido.texto}</p>
          </div>
          <button type="button" onClick={() => setVisible(false)} style={cerrarStyles} aria-label="Cerrar aviso">✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Barra de cristal a todo el ancho de la pantalla, pegada justo debajo del
// navbar fijo. Se sale del <main>/.container con el truco 100vw + translateX
// para no quedar acotada por el max-width del resto del contenido; el
// body ya tiene overflow-x:hidden (index.css), así que no genera scroll
// horizontal.
const bannerStyles = {
  position: 'relative',
  width: '100vw',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.75rem',
  padding: '0.85rem 3rem',
  background: 'rgba(13, 13, 13, 0.55)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  borderBottom: '0.5px solid rgba(132, 189, 0, 0.25)',
  overflow: 'hidden',
};
const contenidoStyles = { display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' };
const textoStyles = { fontSize: '0.82rem', color: 'var(--text)', margin: 0, textAlign: 'center' };
const cerrarStyles = {
  position: 'absolute',
  right: '1.25rem',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'transparent',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  fontSize: '0.85rem',
};
