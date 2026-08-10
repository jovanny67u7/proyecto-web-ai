import React from 'react';
import { motion } from 'framer-motion';
import { contenedorVariants, itemVariants } from '../utils/motionVariants';
import FaqAccordion from '../components/FaqAccordion';

const PREGUNTAS_FRECUENTES = [
  {
    pregunta: '¿Qué es exactamente un CRM Inteligente y cómo beneficia a mi empresa?',
    respuesta: 'Un CRM Inteligente es un sistema que no solo almacena los datos de tus clientes, sino que utiliza Inteligencia Artificial para analizar comportamientos, predecir tendencias de compra y automatizar el seguimiento, ayudándote a cerrar más ventas con menos esfuerzo manual.',
  },
  {
    pregunta: '¿Los chatbots de AsíDeSimple AI suenan como robots o como humanos?',
    respuesta: 'Nuestros chatbots están entrenados con Modelos de Lenguaje Grande (LLMs) avanzados. Esto les permite entender el contexto, detectar el tono del cliente y responder de manera natural, fluida y empática, alejándose por completo de las clásicas respuestas robotizadas preprogramadas.',
  },
  {
    pregunta: '¿Necesito conocimientos técnicos avanzados para usar sus herramientas?',
    respuesta: '¡Para nada! Nuestro lema es "AsíDeSimple". Nosotros nos encargamos de toda la configuración, programación e integración técnica. A ti te entregamos paneles intuitivos y listos para usar desde el primer minuto.',
  },
  {
    pregunta: '¿Cómo funciona el proceso de cotización?',
    respuesta: 'Desde nuestro catálogo, seleccionas el producto que te interesa, marcas las casillas con los módulos específicos que necesitas (ej. conexión a Instagram, manejo de PDFs, etc.) y el sistema generará un mensaje automático hacia nuestro WhatsApp oficial para brindarte una cotización a la medida.',
  },
  {
    pregunta: '¿Puedo integrar el chatbot con mis redes sociales actuales?',
    respuesta: 'Sí. Desarrollamos integraciones omnicanal. Tu asistente de IA puede vivir en tu sitio web, responder mensajes de WhatsApp, Facebook Messenger e Instagram, unificando toda la comunicación de tu negocio.',
  },
  {
    pregunta: '¿Es seguro conectar mis bases de datos y correos a su Inteligencia Artificial?',
    respuesta: 'Absolutamente. Utilizamos protocolos de cifrado de extremo a extremo, enrutamiento seguro y generación de tokens de sesión JWT. Además, nos apegamos estrictamente a las normativas de protección de datos personales (Derechos ARCO).',
  },
  {
    pregunta: '¿Sus automatizaciones pueden vincularse con herramientas que ya utilizo?',
    respuesta: 'Por supuesto. Mediante flujos de trabajo avanzados, podemos conectar nuestras soluciones de IA con herramientas cotidianas como Google Calendar, Gmail, bases de datos SQL y cualquier software que posea una API abierta.',
  },
  {
    pregunta: '¿Por qué no muestran precios fijos en la página?',
    respuesta: 'Debido a que cada negocio tiene procesos operativos únicos, estructuramos nuestro software de forma modular. Preferimos analizar tus necesidades reales primero y ofrecerte una cotización justa basada exactamente en los recursos y automatizaciones que tu empresa consumirá.',
  },
  {
    pregunta: '¿Cuánto tiempo tarda la implementación del software en mi negocio?',
    respuesta: 'El tiempo varía según la complejidad de los módulos seleccionados. Un chatbot estándar puede estar operativo en cuestión de días, mientras que una integración profunda de un CRM a la medida puede tomar algunas semanas de calibración y pruebas.',
  },
  {
    pregunta: '¿Ofrecen soporte técnico continuo después de la instalación?',
    respuesta: 'Sí. Tu crecimiento es el nuestro. Ofrecemos pólizas de soporte técnico y mantenimiento para asegurar que tus flujos asíncronos y tu IA siempre estén actualizados y operando al máximo rendimiento.',
  },
];

export default function Nosotros() {
  return (
    <>
      <motion.section
        className="container"
        style={{ textAlign: 'center', maxWidth: '800px', padding: '4rem 2rem' }}
        variants={contenedorVariants}
        initial="oculto"
        animate="visible"
      >
        <motion.h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }} variants={itemVariants}>
          ¿Quiénes somos?
        </motion.h2>
        <motion.p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8' }} variants={itemVariants}>
          En <strong style={{ color: 'var(--text)' }}>asídesimple AI</strong> nacimos en Querétaro con una misión clara: democratizar la Inteligencia Artificial. Desarrollamos soluciones ágiles y altamente eficientes que transforman horas de trabajo manual en resultados inmediatos.
        </motion.p>
      </motion.section>

      <motion.section
        className="container"
        style={faqSectionStyles}
        variants={contenedorVariants}
        initial="oculto"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="eyebrow" variants={itemVariants}>
          <span className="eyebrow-dot"></span> Ayuda
        </motion.div>
        <motion.h2 style={faqTitleStyles} variants={itemVariants}>
          Preguntas Frecuentes
        </motion.h2>
        <motion.p style={faqSubtituloStyles} variants={itemVariants}>
          Todo lo que necesitas saber antes de automatizar tu negocio con nosotros.
        </motion.p>

        <motion.div variants={itemVariants}>
          <FaqAccordion preguntas={PREGUNTAS_FRECUENTES} />
        </motion.div>
      </motion.section>
    </>
  );
}

const faqSectionStyles = { maxWidth: '800px', margin: '0 auto', padding: '2rem 2rem 6rem', textAlign: 'center' };
const faqTitleStyles = { fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: 700, marginBottom: '0.75rem' };
const faqSubtituloStyles = {
  fontFamily: "'Roboto', sans-serif",
  fontSize: '1rem',
  color: 'var(--text-muted)',
  marginBottom: '2.5rem',
};
