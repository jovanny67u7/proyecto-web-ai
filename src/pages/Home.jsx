import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { contenedorVariants, itemVariants } from '../utils/motionVariants';

import fondoAI from '../../img/FONDO-AI.png';
import chatbotImg from '../../img/CHATBOT-DESCRIPTION.png';
import automatizacionImg from '../../img/AUTOMATIZACION-DESCRIPTION.png';

const DIRECCION_OFICINA = 'Circuito Puerta del Sol, Villa la Cañada 15A-Int. G4, Puerta Real Residencial Desarrollo Urbana 08, 76910 Santiago de Querétaro, Qro.';
const MAPA_SRC = `https://www.google.com/maps?q=${encodeURIComponent(DIRECCION_OFICINA)}&output=embed`;

// Genera la configuración aleatoria (una sola vez) de las partículas del Hero
function generarParticulas(cantidad) {
  return Array.from({ length: cantidad }, (_, i) => {
    const esLinea = i % 3 === 0;
    return {
      id: i,
      tipo: esLinea ? 'linea' : 'punto',
      left: Math.random() * 100,
      top: Math.random() * 100,
      tamano: esLinea ? 18 + Math.random() * 34 : 2 + Math.random() * 4,
      rotacion: Math.random() * 360,
      distancia: 15 + Math.random() * 25,
      duracion: 7 + Math.random() * 10,
      retraso: Math.random() * 6,
      opacidadBase: 0.15 + Math.random() * 0.35,
    };
  });
}

function HeroParticulas() {
  const particulas = useMemo(() => generarParticulas(22), []);

  return (
    <div style={particulasContenedorStyles} aria-hidden="true">
      {particulas.map((p) => (
        <motion.div
          key={p.id}
          style={
            p.tipo === 'linea'
              ? {
                  position: 'absolute',
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  width: '1.5px',
                  height: `${p.tamano}px`,
                  background: 'var(--brand-green)',
                  transform: `rotate(${p.rotacion}deg)`,
                }
              : {
                  position: 'absolute',
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  width: `${p.tamano}px`,
                  height: `${p.tamano}px`,
                  borderRadius: '50%',
                  background: 'var(--brand-green)',
                }
          }
          animate={{
            y: [0, -p.distancia, 0],
            opacity: [p.opacidadBase * 0.4, p.opacidadBase, p.opacidadBase * 0.4],
          }}
          transition={{
            duration: p.duracion,
            delay: p.retraso,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Anillo decorativo que rota lentamente detrás de las imágenes de servicios
function AnilloDecorativo({ tamano = 320, color = 'var(--brand-green)', duracion = 26, inverso = false, opacidad = 0.25, punteado = true }) {
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: tamano,
        height: tamano,
        marginTop: -(tamano / 2),
        marginLeft: -(tamano / 2),
        borderRadius: '50%',
        border: `1.5px ${punteado ? 'dashed' : 'solid'} ${color}`,
        opacity: opacidad,
        zIndex: 0,
        pointerEvents: 'none',
      }}
      animate={{ rotate: inverso ? -360 : 360 }}
      transition={{ duration: duracion, repeat: Infinity, ease: 'linear' }}
    />
  );
}

export default function Home() {
  return (
    <>
      {/* HERO — fondo con imagen, overlay oscuro y partículas animadas */}
      <section style={heroWrapperStyles}>
        <div style={{ ...heroBgStyles, backgroundImage: `url(${fondoAI})` }} />
        <div style={heroOverlayStyles} />
        <HeroParticulas />

        <motion.div
          style={heroContentStyles}
          variants={contenedorVariants}
          initial="oculto"
          animate="visible"
        >
          <motion.div className="eyebrow" variants={itemVariants}>
            <span className="eyebrow-dot"></span> Software con IA · Hecho en México
          </motion.div>

          <motion.h1 style={h1Styles} variants={itemVariants}>
            Automatiza tu negocio<br /><span className="gradient-text">asídesimple.</span>
          </motion.h1>

          <motion.p
            style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}
            variants={itemVariants}
          >
            Chatbots, CRMs y herramientas con inteligencia artificial.
          </motion.p>

          <motion.div variants={itemVariants}>
            <Link to="/productos" className="btn-primary" style={{ textDecoration: 'none' }}>Ver Catálogo ↗</Link>
          </motion.div>
        </motion.div>
      </section>

      {/* SECCIÓN DE SERVICIOS — layout en Z, alternado y responsivo */}
      <section className="container" style={zpatternSectionStyles}>
        <motion.div
          className="zpattern-row"
          variants={contenedorVariants}
          initial="oculto"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={itemVariants}>
            <div className="eyebrow">
              <span className="eyebrow-dot"></span> Chatbots Inteligentes
            </div>
            <h2 style={zpatternTitleStyles}>
              Conversaciones que <span className="gradient-text">venden solas</span>
            </h2>
            <p style={zpatternTextStyles}>
              Diseñamos chatbots entrenados con IA que responden a tus clientes al instante, los 24/7,
              en WhatsApp, tu sitio web o redes sociales. Cada conversación se convierte en una
              oportunidad de venta, sin que tu equipo tenga que estar detrás de una pantalla todo el día.
            </p>
            <Link to="/productos" className="btn-secondary" style={{ textDecoration: 'none', marginTop: '1.5rem', display: 'inline-flex' }}>
              Conoce más ↗
            </Link>
          </motion.div>

          <motion.div style={zpatternImgWrapperStyles} variants={itemVariants}>
            <AnilloDecorativo tamano={340} color="var(--brand-green)" duracion={32} />
            <AnilloDecorativo tamano={250} color="#ffffff" duracion={22} inverso opacidad={0.12} />
            <img src={chatbotImg} alt="Chatbot inteligente asídesimple AI" style={zpatternImgStyles} />
          </motion.div>
        </motion.div>

        <motion.div
          className="zpattern-row"
          variants={contenedorVariants}
          initial="oculto"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div style={zpatternImgWrapperStyles} variants={itemVariants}>
            <AnilloDecorativo tamano={340} color="var(--brand-blue)" duracion={28} inverso />
            <AnilloDecorativo tamano={250} color="var(--brand-green)" duracion={20} opacidad={0.15} />
            <img src={automatizacionImg} alt="Automatización de procesos asídesimple AI" style={zpatternImgStyles} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="eyebrow">
              <span className="eyebrow-dot"></span> Automatizaciones
            </div>
            <h2 style={zpatternTitleStyles}>
              Elimina el <span className="gradient-text">trabajo repetitivo</span>
            </h2>
            <p style={zpatternTextStyles}>
              Conectamos tus herramientas y automatizamos los procesos manuales que le roban tiempo a tu
              equipo: seguimiento de clientes, reportes, cotizaciones y más. Menos errores, más horas
              para lo que realmente importa: hacer crecer tu negocio.
            </p>
            <Link to="/productos" className="btn-secondary" style={{ textDecoration: 'none', marginTop: '1.5rem', display: 'inline-flex' }}>
              Conoce más ↗
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* CONTACTO */}
      <motion.section
        id="contacto"
        className="container"
        style={contactoSectionStyles}
        variants={contenedorVariants}
        initial="oculto"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="eyebrow" variants={itemVariants}>
          <span className="eyebrow-dot"></span> Contacto
        </motion.div>
        <motion.h2 style={contactoTitleStyles} variants={itemVariants}>
          Hablemos de tu proyecto
        </motion.h2>

        <motion.div className="contacto-grid" variants={itemVariants}>
          <div style={contactoInfoStyles}>
            <div>
              <h3 style={contactoSubtitleStyles}>Dirección de la Oficina</h3>
              <p style={contactoTextStyles}>{DIRECCION_OFICINA}</p>
            </div>

            <div>
              <h3 style={contactoSubtitleStyles}>Horario de Atención</h3>
              <p style={contactoTextStyles}>Lunes a Viernes 9:00 am a 17:00</p>
            </div>

            <div>
              <h3 style={contactoSubtitleStyles}>WhatsApp</h3>
              <p style={contactoTextStyles}>
                <a href="https://wa.me/524426150681" target="_blank" rel="noopener noreferrer" style={contactoLinkStyles}>
                  (+52) 442 615 0681
                </a>
              </p>
            </div>

            <div>
              <h3 style={contactoSubtitleStyles}>Correo</h3>
              <p style={contactoTextStyles}>
                <a href="mailto:innovation@massimple.com.mx" style={contactoLinkStyles}>
                  innovation@massimple.com.mx
                </a>
              </p>
            </div>
          </div>

          <div>
            <iframe
              src={MAPA_SRC}
              width="100%"
              height="450"
              style={mapaIframeStyles}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de la oficina de asídesimple AI"
            />
          </div>
        </motion.div>
      </motion.section>
    </>
  );
}

// --- ESTILOS: HERO ---
const heroWrapperStyles = {
  position: 'relative',
  minHeight: '75vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '0 1rem',
  overflow: 'hidden',
  isolation: 'isolate',
};
const heroBgStyles = {
  position: 'absolute',
  inset: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  zIndex: 0,
};
const heroOverlayStyles = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(0,0,0,0.7)',
  zIndex: 1,
};
const particulasContenedorStyles = {
  position: 'absolute',
  inset: 0,
  zIndex: 2,
  overflow: 'hidden',
  pointerEvents: 'none',
};
const heroContentStyles = {
  position: 'relative',
  zIndex: 3,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};
const h1Styles = { fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem' };

// --- ESTILOS: SECCIÓN Z-PATTERN ---
const zpatternSectionStyles = { padding: '2rem 2rem 0' };
const zpatternTitleStyles = { fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 700, margin: '1rem 0 1.2rem', lineHeight: 1.2 };
const zpatternTextStyles = { fontFamily: "'Roboto', sans-serif", fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-muted)' };
const zpatternImgWrapperStyles = { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px' };
const zpatternImgStyles = {
  position: 'relative',
  zIndex: 1,
  width: '100%',
  maxWidth: '380px',
  display: 'block',
  margin: '0 auto',
  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))',
};

// --- ESTILOS: CONTACTO ---
const contactoSectionStyles = { padding: '4rem 2rem 6rem', textAlign: 'center' };
const contactoTitleStyles = { fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 700, marginBottom: '1rem' };
const contactoInfoStyles = { display: 'flex', flexDirection: 'column', gap: '1.8rem', textAlign: 'left' };
const contactoSubtitleStyles = {
  fontFamily: "'Poppins', sans-serif",
  textTransform: 'uppercase',
  fontSize: '0.85rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  color: 'var(--brand-green)',
  marginBottom: '0.5rem',
};
const contactoTextStyles = {
  fontFamily: "'Roboto', sans-serif",
  fontSize: '0.95rem',
  lineHeight: 1.7,
  color: 'var(--text-muted)',
};
const contactoLinkStyles = { color: 'var(--text)', textDecoration: 'none' };
const mapaIframeStyles = { border: 0, borderRadius: '1rem', display: 'block' };
