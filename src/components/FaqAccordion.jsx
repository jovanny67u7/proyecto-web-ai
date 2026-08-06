import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

export default function FaqAccordion({ preguntas }) {
  const [indiceAbierto, setIndiceAbierto] = useState(null);

  const alternar = (indice) => {
    setIndiceAbierto((actual) => (actual === indice ? null : indice));
  };

  return (
    <div style={contenedorStyles}>
      {preguntas.map((item, indice) => {
        const abierto = indiceAbierto === indice;
        return (
          <div key={item.pregunta} style={itemStyles}>
            <button
              type="button"
              onClick={() => alternar(indice)}
              style={botonStyles}
              aria-expanded={abierto}
            >
              <span className="faq-pregunta" style={preguntaStyles}>{item.pregunta}</span>
              <motion.span
                style={chevronStyles}
                animate={{ rotate: abierto ? 180 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <FiChevronDown size={20} />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {abierto && (
                <motion.div
                  key="respuesta"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <p style={respuestaStyles}>{item.respuesta}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

const contenedorStyles = { display: 'flex', flexDirection: 'column', borderTop: '0.5px solid var(--border)' };
const itemStyles = { borderBottom: '0.5px solid var(--border)' };
const botonStyles = {
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem',
  background: 'transparent',
  border: 'none',
  padding: '1.25rem 0',
  cursor: 'pointer',
  textAlign: 'left',
};
const preguntaStyles = {
  fontFamily: "'Poppins', sans-serif",
  fontSize: '1rem',
  fontWeight: 600,
  color: 'var(--text)',
  transition: 'color 0.2s ease',
};
const chevronStyles = { flexShrink: 0, color: 'var(--brand-green)', display: 'flex' };
const respuestaStyles = {
  fontFamily: "'Roboto', sans-serif",
  fontSize: '0.95rem',
  lineHeight: 1.8,
  color: 'var(--text-muted)',
  paddingBottom: '1.5rem',
  paddingRight: '2rem',
};
