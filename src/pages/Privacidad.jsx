import React from 'react';
import { motion } from 'framer-motion';
import { contenedorVariants, itemVariants } from '../utils/motionVariants';

const SECCIONES = [
  {
    titulo: '1. Responsable del Tratamiento de Datos Personales',
    parrafos: [
      'AsíDeSimple AI, con domicilio en Circuito Puerta del Sol, Villa la Cañada 15A-Int. G4, Puerta Real Residencial Desarrollo Urbana 08, 76910 Santiago de Querétaro, Qro., es responsable del tratamiento de los datos personales que recabamos, en cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.',
    ],
  },
  {
    titulo: '2. Datos Personales que Recabamos',
    parrafos: [
      'Podemos recabar los siguientes datos personales, según el servicio que utilices:',
      '(a) Datos de identificación y contacto: nombre, correo electrónico, número telefónico y nombre de tu empresa, proporcionados a través de nuestro formulario web, chatbot o WhatsApp.',
      '(b) Datos de navegación: dirección IP, tipo de navegador, páginas visitadas y tiempo de permanencia en el sitio, mediante cookies y tecnologías similares.',
      '(c) Contenido de conversaciones: mensajes intercambiados con nuestros chatbots o a través de WhatsApp Business con fines de cotización, soporte o atención comercial.',
      'No recabamos datos personales sensibles (origen étnico, salud, creencias religiosas, etc.) y te pedimos evitar compartir este tipo de información en tus conversaciones con nosotros.',
    ],
  },
  {
    titulo: '3. Finalidades del Tratamiento',
    parrafos: [
      'Finalidades primarias (necesarias para la relación con AsíDeSimple AI): elaborar cotizaciones, dar seguimiento a solicitudes de contratación, prestar soporte técnico, implementar y dar mantenimiento a los chatbots, CRMs y automatizaciones contratadas, y cumplir obligaciones legales y contractuales.',
      'Finalidades secundarias (no indispensables, pero que nos permiten ofrecerte un mejor servicio): enviarte información sobre nuevos productos, promociones o contenido relacionado con nuestros servicios. Puedes oponerte a estas finalidades secundarias en cualquier momento sin que ello afecte la relación contractual, escribiendo a contacto@asidesimple.ai.',
    ],
  },
  {
    titulo: '4. Uso de Datos Recabados vía WhatsApp para Cotizaciones',
    parrafos: [
      'Cuando nos contactas a través de WhatsApp Business para solicitar una cotización o información sobre nuestros servicios, los datos que nos compartes (nombre, número telefónico, giro de tu negocio y detalles de tu solicitud) se utilizan exclusivamente para elaborar tu propuesta comercial, dar seguimiento a la conversación y, en caso de contratación, iniciar el proceso de implementación de tu chatbot, CRM o automatización.',
      'Estas conversaciones se procesan a través de la plataforma de WhatsApp Business API de Meta, por lo que su tratamiento también está sujeto a las políticas de privacidad de dicho proveedor. No compartimos el contenido de tus conversaciones de WhatsApp con terceros ajenos a la prestación del servicio, salvo requerimiento de autoridad competente.',
    ],
  },
  {
    titulo: '5. Uso de Cookies y Tecnologías de Rastreo',
    parrafos: [
      'Nuestro sitio web utiliza cookies propias y de terceros para mejorar tu experiencia de navegación, recordar tus preferencias y analizar el uso del sitio con fines estadísticos. Puedes deshabilitar el uso de cookies desde la configuración de tu navegador; sin embargo, algunas funcionalidades del sitio podrían verse limitadas.',
    ],
  },
  {
    titulo: '6. Transferencia de Datos Personales',
    parrafos: [
      'Para operar nuestros servicios, tus datos pueden ser transferidos a proveedores de infraestructura tecnológica (hosting, almacenamiento en la nube) y proveedores de mensajería (WhatsApp Business API/Meta), únicamente en la medida necesaria para la prestación del servicio contratado y bajo obligaciones de confidencialidad. No vendemos ni rentamos tus datos personales a terceros con fines publicitarios ajenos a AsíDeSimple AI.',
    ],
  },
  {
    titulo: '7. Derechos ARCO',
    parrafos: [
      'De conformidad con la LFPDPPP, tienes en todo momento derecho a:',
      '• Acceso: conocer qué datos personales tuyos tenemos y para qué los utilizamos.',
      '• Rectificación: solicitar la corrección de tus datos personales cuando sean inexactos o estén incompletos.',
      '• Cancelación: solicitar que eliminemos tus datos de nuestros registros cuando consideres que no son tratados conforme a los principios y obligaciones previstos en la normativa aplicable.',
      '• Oposición: oponerte al tratamiento de tus datos personales para fines específicos, o revocar el consentimiento que en su caso nos hayas otorgado.',
      'Para ejercer cualquiera de estos derechos ARCO, envía tu solicitud a contacto@asidesimple.ai indicando tu nombre completo, el derecho que deseas ejercer y documentación que permita acreditar tu identidad. Daremos respuesta a tu solicitud dentro de un plazo máximo de 20 días hábiles, conforme a lo establecido por la ley.',
    ],
  },
  {
    titulo: '8. Medidas de Seguridad',
    parrafos: [
      'Implementamos medidas de seguridad administrativas, técnicas y físicas razonables para proteger tus datos personales contra daño, pérdida, alteración, destrucción o uso, acceso o tratamiento no autorizado.',
    ],
  },
  {
    titulo: '9. Cambios al Presente Aviso de Privacidad',
    parrafos: [
      'Nos reservamos el derecho de efectuar en cualquier momento modificaciones o actualizaciones al presente aviso de privacidad. Estas modificaciones estarán disponibles al público a través de esta misma página, indicando la fecha de su última actualización.',
    ],
  },
  {
    titulo: '10. Contacto',
    parrafos: [
      'Si tienes dudas sobre el tratamiento de tus datos personales o deseas ejercer tus derechos ARCO, contáctanos en contacto@asidesimple.ai o al WhatsApp (+52) 442 615 0681.',
    ],
  },
];

export default function Privacidad() {
  return (
    <motion.section
      className="container"
      style={legalSectionStyles}
      variants={contenedorVariants}
      initial="oculto"
      animate="visible"
    >
      <motion.div className="eyebrow" variants={itemVariants}>
        <span className="eyebrow-dot"></span> Marco Legal
      </motion.div>

      <motion.h1 style={legalTitleStyles} variants={itemVariants}>
        Política de Privacidad
      </motion.h1>

      <motion.p style={legalUpdateStyles} variants={itemVariants}>
        Última actualización: 6 de agosto de 2026
      </motion.p>

      <motion.p style={legalIntroStyles} variants={itemVariants}>
        En AsíDeSimple AI valoramos tu privacidad. Este Aviso de Privacidad describe cómo
        recabamos, usamos y protegemos tus datos personales al utilizar nuestro sitio web,
        chatbots, CRMs y demás servicios de automatización con inteligencia artificial.
      </motion.p>

      {SECCIONES.map((seccion) => (
        <motion.div key={seccion.titulo} style={legalBloqueStyles} variants={itemVariants}>
          <h2 style={legalSubtituloStyles}>{seccion.titulo}</h2>
          {seccion.parrafos.map((parrafo, idx) => (
            <p key={idx} style={legalParrafoStyles}>{parrafo}</p>
          ))}
        </motion.div>
      ))}
    </motion.section>
  );
}

const legalSectionStyles = { maxWidth: '800px', margin: '0 auto', padding: '2rem 2rem 6rem' };
const legalTitleStyles = { fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' };
const legalUpdateStyles = { fontFamily: "'Roboto', sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' };
const legalIntroStyles = { fontFamily: "'Roboto', sans-serif", fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-muted)', marginBottom: '3rem' };
const legalBloqueStyles = { marginBottom: '2.2rem' };
const legalSubtituloStyles = { fontFamily: "'Poppins', sans-serif", fontSize: '1.2rem', fontWeight: 600, color: 'var(--brand-green)', marginBottom: '0.8rem' };
const legalParrafoStyles = { fontFamily: "'Roboto', sans-serif", fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-muted)', marginBottom: '0.8rem' };
