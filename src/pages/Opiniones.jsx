import React from 'react';
import { motion } from 'framer-motion';
import { contenedorVariants, itemVariants } from '../utils/motionVariants';

const TestimonialCard = ({ client, company, text }) => (
  <motion.div style={testimonialStyle} variants={itemVariants}>
    <div style={{ color: 'var(--brand-green)', fontSize: '1.2rem', marginBottom: '1rem' }}>★★★★★</div>
    <p style={{ fontSize: '0.9rem', color: 'var(--text)', marginBottom: '1.5rem', fontStyle: 'italic' }}>"{text}"</p>
    <div>
      <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{client}</h4>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{company}</p>
    </div>
  </motion.div>
);

export default function Opiniones() {
  return (
    <motion.section
      className="container"
      style={{ padding: '4rem 2rem' }}
      variants={contenedorVariants}
      initial="oculto"
      animate="visible"
    >
      <motion.h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }} variants={itemVariants}>
        Lo que dicen nuestros clientes
      </motion.h2>
      <div style={gridStyle}>
        <TestimonialCard client="María F. López" company="TechCorp" text="Nuestras conversiones aumentaron un 40%. La interfaz es intuitiva." />
        <TestimonialCard client="Roberto Sánchez" company="EcoRetail" text="El Chatbot IA nos salvó en temporada alta. Responde el 80% de las dudas." />
        <TestimonialCard client="Elena Gómez" company="Gerente de Operaciones" text="Automatizamos todo en dos semanas. Literalmente, fue así de simple." />
      </div>
    </motion.section>
  );
}

const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' };
const testimonialStyle = { background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: '1.2rem', padding: '2rem' };