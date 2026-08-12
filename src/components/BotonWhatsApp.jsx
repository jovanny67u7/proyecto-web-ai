import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const NUMERO_DEMO = '524425533706';
const MENSAJE = 'Hola, quiero probar su demo';

// Botón flotante independiente del Chatbot (que ya vive en la esquina
// inferior derecha): este apunta directo a WhatsApp con el número que tiene
// la demo real de los chatbots, así que va en la esquina opuesta para no
// encimarse.
export default function BotonWhatsApp() {
  const url = `https://wa.me/${NUMERO_DEMO}?text=${encodeURIComponent(MENSAJE)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="boton-whatsapp"
      style={btnStyle}
      aria-label="Escríbenos por WhatsApp para probar la demo"
    >
      <FaWhatsapp size={30} />
    </a>
  );
}

const btnStyle = {
  position: 'fixed',
  bottom: '2rem',
  left: '2rem',
  zIndex: 9999,
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  background: '#25D366',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 15px rgba(37, 211, 102, 0.45)',
  textDecoration: 'none',
  transition: 'transform 0.2s ease',
};
