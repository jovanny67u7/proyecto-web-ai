import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { contenedorVariants, itemVariants } from '../utils/motionVariants';
import BannerEstacional from '../components/BannerEstacional';
import ParticulasCanvas from '../components/ParticulasCanvas';

const DIRECCION_OFICINA = 'Circuito Puerta del Sol, Villa la Cañada 15A-Int. G4, Puerta Real Residencial Desarrollo Urbana 08, 76910 Santiago de Querétaro, Qro.';
const MAPA_SRC = `https://www.google.com/maps?q=${encodeURIComponent(DIRECCION_OFICINA)}&output=embed`;

const SERVICIOS = [
  {
    titulo: 'Chatbots IA',
    descripcion: 'Asistentes conversacionales entrenados con tu negocio, disponibles 24/7 en WhatsApp, tu sitio web y redes sociales.',
  },
  {
    titulo: 'CRM Inteligente',
    descripcion: 'Gestiona prospectos y clientes con seguimiento automático impulsado por IA y reportes en tiempo real.',
  },
  {
    titulo: 'Automatizaciones',
    descripcion: 'Elimina tareas repetitivas conectando tus herramientas favoritas, sin escribir una sola línea de código.',
  },
];

const CHAT_INICIAL = [
  { autor: 'bot', texto: '¡Hola! 👋 Soy el asistente de AsíDeSimple AI. ¿En qué puedo ayudarte hoy?' },
];

const PREGUNTAS_DEMO = [
  {
    pregunta: '¿Qué puede hacer un chatbot de IA?',
    respuesta: 'Responder dudas de tus clientes al instante, agendar citas, enviar catálogos y calificar leads — todo sin que tu equipo tenga que estar conectado 24/7.',
  },
  {
    pregunta: '¿Cuánto tarda la implementación?',
    respuesta: 'Un chatbot estándar puede estar funcionando en cuestión de días. Todo depende de los módulos que elijas para tu negocio.',
  },
  {
    pregunta: 'Quiero una cotización',
    respuesta: '¡Perfecto! Ve al catálogo, elige el producto que te interese y selecciona los módulos — te generamos un mensaje directo a nuestro WhatsApp con todo listo.',
  },
];

function TarjetaServicio({ titulo, descripcion }) {
  const manejarMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--mx', `${x}%`);
    e.currentTarget.style.setProperty('--my', `${y}%`);
  };

  return (
    <motion.div className="glow-card" variants={itemVariants} onMouseMove={manejarMouseMove}>
      <h3 style={servicioTituloStyles}>{titulo}</h3>
      <p style={servicioTextoStyles}>{descripcion}</p>
    </motion.div>
  );
}

function DemoChat() {
  const [mensajes, setMensajes] = useState(CHAT_INICIAL);
  const [usadas, setUsadas] = useState([]);
  const pendientes = PREGUNTAS_DEMO.filter((p) => !usadas.includes(p.pregunta));

  const elegirPregunta = (item) => {
    setMensajes((prev) => [...prev, { autor: 'user', texto: item.pregunta }]);
    setUsadas((prev) => [...prev, item.pregunta]);
    setTimeout(() => {
      setMensajes((prev) => [...prev, { autor: 'bot', texto: item.respuesta }]);
    }, 500);
  };

  const reiniciar = () => {
    setMensajes(CHAT_INICIAL);
    setUsadas([]);
  };

  return (
    <div style={demoCardStyles}>
      <div className="demo-chat-padded" style={demoHeaderStyles}>
        <div style={demoAvatarStyles}>AI</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Asistente AsíDeSimple</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--brand-green)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className="eyebrow-dot"></span> En línea (demo)
          </div>
        </div>
      </div>

      <div className="demo-chat-padded" style={demoMensajesStyles}>
        {mensajes.map((m, i) => (
          <div key={i} style={m.autor === 'bot' ? demoBotMsgStyles : demoUserMsgStyles}>{m.texto}</div>
        ))}
      </div>

      <div className="demo-chat-padded" style={demoSugerenciasStyles}>
        {pendientes.length > 0 ? (
          pendientes.map((item) => (
            <button key={item.pregunta} type="button" onClick={() => elegirPregunta(item)} style={demoSugerenciaBtnStyles}>
              {item.pregunta}
            </button>
          ))
        ) : (
          <button type="button" onClick={reiniciar} style={demoSugerenciaBtnStyles}>🔄 Reiniciar demo</button>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* BANNER ESTACIONAL — justo debajo del menú de navegación fijo */}
      <BannerEstacional />

      {/* HERO — fondo oscuro sólido + partículas tipo constelación (canvas) */}
      <section style={heroWrapperStyles}>
        <div style={heroBgStyles} />
        <ParticulasCanvas />

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

      {/* SERVICIOS — tarjetas oscuras con borde que se ilumina siguiendo el cursor */}
      <section className="container" style={serviciosSectionStyles}>
        <motion.div
          variants={contenedorVariants}
          initial="oculto"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div className="eyebrow" style={{ margin: '0 auto 1rem' }} variants={itemVariants}>
            <span className="eyebrow-dot"></span> Servicios
          </motion.div>
          <motion.h2 style={serviciosTituloStyles} variants={itemVariants}>
            Chatbots, CRM y Automatización <span className="gradient-text">en un solo lugar</span>
          </motion.h2>

          <motion.div className="servicios-grid" variants={itemVariants}>
            {SERVICIOS.map((servicio) => (
              <TarjetaServicio key={servicio.titulo} {...servicio} />
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* DEMO — chat estático/maquetado, sin conexión a backend */}
      <section className="container" style={demoSectionStyles}>
        <motion.div
          variants={contenedorVariants}
          initial="oculto"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div className="eyebrow" style={{ margin: '0 auto 1rem' }} variants={itemVariants}>
            <span className="eyebrow-dot"></span> Pruébalo tú mismo
          </motion.div>
          <motion.h2 style={serviciosTituloStyles} variants={itemVariants}>
            Experimenta Nuestra IA <span className="gradient-text">Ahora</span>
          </motion.h2>
          <motion.p style={demoSubtituloStyles} variants={itemVariants}>
            Así se siente conversar con tu propio asistente. Elige una pregunta y mira cómo responde.
          </motion.p>

          <motion.div variants={itemVariants}>
            <DemoChat />
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
  background: 'var(--brand-dark)',
  zIndex: 0,
};
const heroContentStyles = {
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};
const h1Styles = { fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem' };

// --- ESTILOS: SERVICIOS (tarjetas glow) ---
const serviciosSectionStyles = { padding: '5rem 2rem' };
const serviciosTituloStyles = { fontSize: 'clamp(1.9rem, 4.5vw, 2.6rem)', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.25 };
const servicioTituloStyles = { fontSize: '1.25rem', marginBottom: '0.75rem' };
const servicioTextoStyles = { fontFamily: "'Roboto', sans-serif", fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-muted)' };

// --- ESTILOS: DEMO DE CHAT ---
const demoSectionStyles = { padding: '2rem 2rem 5rem' };
const demoSubtituloStyles = { fontFamily: "'Roboto', sans-serif", fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 2.5rem' };
const demoCardStyles = {
  width: '100%',
  maxWidth: '48rem', // equivalente a max-w-3xl: mucho más presencia que los 420px originales
  margin: '0 auto',
  background: 'var(--surface-2)',
  border: '0.5px solid var(--border)',
  borderRadius: '1.5rem',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  textAlign: 'left',
};
const demoHeaderStyles = { display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--brand-dark)', padding: '1.5rem 2rem', borderBottom: '0.5px solid var(--border)' };
const demoAvatarStyles = { width: '44px', height: '44px', borderRadius: '50%', background: 'var(--brand-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '0.9rem', flexShrink: 0 };
const demoMensajesStyles = { display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', minHeight: '260px', background: 'var(--surface)' };
const demoMsgBaseStyles = { padding: '0.9rem 1.25rem', borderRadius: '1.1rem', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '75%' };
const demoBotMsgStyles = { ...demoMsgBaseStyles, background: 'var(--surface-2)', border: '0.5px solid var(--border)', alignSelf: 'flex-start', borderBottomLeftRadius: '4px' };
const demoUserMsgStyles = { ...demoMsgBaseStyles, background: 'rgba(132, 189, 0, 0.15)', border: '0.5px solid rgba(132, 189, 0, 0.3)', color: '#fff', alignSelf: 'flex-end', borderBottomRightRadius: '4px' };
const demoSugerenciasStyles = { display: 'flex', flexWrap: 'wrap', gap: '0.75rem', padding: '1.5rem 2rem', borderTop: '0.5px solid var(--border)' };
const demoSugerenciaBtnStyles = {
  background: 'transparent',
  border: '0.5px solid rgba(132, 189, 0, 0.35)',
  color: 'var(--brand-green)',
  borderRadius: '999px',
  padding: '0.55rem 1rem',
  fontSize: '0.8rem',
  fontFamily: "'Poppins', sans-serif",
  cursor: 'pointer',
  textAlign: 'left',
};

// --- ESTILOS: CONTACTO ---
const contactoSectionStyles = { padding: '2rem 2rem 6rem', textAlign: 'center' };
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
