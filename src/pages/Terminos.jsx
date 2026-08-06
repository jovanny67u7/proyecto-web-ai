import React from 'react';
import { motion } from 'framer-motion';
import { contenedorVariants, itemVariants } from '../utils/motionVariants';

const SECCIONES = [
  {
    titulo: '1. Aceptación de los Términos',
    parrafos: [
      'Al acceder, contratar o utilizar cualquiera de los servicios ofrecidos por AsíDeSimple AI ("nosotros", "la empresa"), incluyendo este sitio web, nuestros chatbots, CRMs inteligentes y herramientas de automatización, aceptas quedar obligado por los presentes Términos de Servicio. Si no estás de acuerdo con alguna de estas condiciones, te pedimos no utilizar nuestros servicios.',
    ],
  },
  {
    titulo: '2. Descripción del Servicio',
    parrafos: [
      'AsíDeSimple AI ofrece soluciones de software como servicio (SaaS) basadas en inteligencia artificial, incluyendo, de forma no limitativa: chatbots conversacionales, sistemas de gestión de relación con clientes (CRM) potenciados con IA, y automatizaciones de procesos de negocio. El alcance específico de cada servicio se define en la cotización o contrato particular celebrado con cada cliente.',
    ],
  },
  {
    titulo: '3. Uso de las Herramientas de Inteligencia Artificial',
    parrafos: [
      'Nuestros chatbots y CRMs utilizan modelos de inteligencia artificial para generar respuestas, recomendaciones y flujos de conversación automatizados. El cliente reconoce y acepta que:',
      '(a) Las respuestas generadas por IA se basan en patrones estadísticos y entrenamiento previo, por lo que no podemos garantizar una exactitud del 100% en todo momento.',
      '(b) Es responsabilidad del cliente supervisar, validar y ajustar razonablemente el comportamiento de los chatbots y CRMs en escenarios críticos o de alto impacto para su negocio.',
      '(c) AsíDeSimple AI no será responsable por decisiones comerciales tomadas exclusivamente con base en el resultado de una herramienta de IA sin supervisión humana razonable por parte del cliente.',
    ],
  },
  {
    titulo: '4. Proceso de Solicitud de Cotización y Contratación',
    parrafos: [
      'Las solicitudes de cotización pueden realizarse a través de nuestro sitio web, formulario de contacto o WhatsApp Business. Toda cotización proporcionada es una estimación referencial, no vinculante, sujeta a confirmación por escrito y validez de 15 días naturales salvo que se indique lo contrario.',
      'La relación contractual y el alcance definitivo del servicio (tiempos de entrega, funcionalidades, costos y condiciones de pago) se formalizan mediante un contrato o propuesta de servicio firmada por ambas partes, posterior a la etapa de cotización.',
    ],
  },
  {
    titulo: '5. Propiedad Intelectual',
    parrafos: [
      'El código fuente, arquitectura, metodologías, diseños de interfaz, marca "AsíDeSimple AI" y demás elementos desarrollados por nosotros con carácter genérico o interno son y seguirán siendo propiedad exclusiva de AsíDeSimple AI, salvo acuerdo expreso y por escrito en contrario.',
      'Las soluciones desarrolladas específicamente para un cliente bajo un contrato de desarrollo a medida se rigen por las cláusulas de propiedad intelectual pactadas en dicho contrato particular. Ningún contenido, marca o material proporcionado por el cliente para la configuración de sus chatbots o CRMs (textos, catálogos, imágenes, datos de clientes) será utilizado por AsíDeSimple AI para fines distintos a la prestación del servicio contratado.',
    ],
  },
  {
    titulo: '6. Limitación de Responsabilidad e Interrupciones del Servicio',
    parrafos: [
      'AsíDeSimple AI hace su mejor esfuerzo por mantener sus servicios disponibles de forma continua; sin embargo, no garantizamos que la plataforma, el sitio web o los servicios de chatbot/CRM estarán libres de interrupciones, errores o fallas técnicas.',
      'No seremos responsables por interrupciones derivadas de causas de fuerza mayor, fallas en servicios de terceros (proveedores de hosting, API de WhatsApp Business/Meta, proveedores de conectividad a internet), mantenimiento programado, o eventos fuera de nuestro control razonable.',
      'En ningún caso la responsabilidad total de AsíDeSimple AI frente al cliente, por cualquier reclamación relacionada con el servicio, excederá el monto efectivamente pagado por el cliente durante el mes anterior al hecho que originó la reclamación.',
    ],
  },
  {
    titulo: '7. Obligaciones del Cliente',
    parrafos: [
      'El cliente se obliga a proporcionar información veraz y actualizada, utilizar los servicios conforme a la legislación aplicable, no emplear las herramientas de IA para fines ilícitos, fraudulentos o que infrinjan derechos de terceros, y a mantener la confidencialidad de sus credenciales de acceso.',
    ],
  },
  {
    titulo: '8. Modificaciones a los Términos',
    parrafos: [
      'Nos reservamos el derecho de actualizar estos Términos de Servicio en cualquier momento. Los cambios relevantes serán publicados en esta misma página con su fecha de actualización correspondiente. El uso continuado de nuestros servicios después de dicha publicación constituye la aceptación de los cambios.',
    ],
  },
  {
    titulo: '9. Legislación Aplicable y Jurisdicción',
    parrafos: [
      'Estos Términos de Servicio se rigen por las leyes aplicables en los Estados Unidos Mexicanos. Para cualquier controversia derivada de la interpretación o cumplimiento de los mismos, las partes se someten a los tribunales competentes de la ciudad de Santiago de Querétaro, Querétaro, renunciando a cualquier otro fuero que pudiera corresponderles.',
    ],
  },
  {
    titulo: '10. Contacto',
    parrafos: [
      'Para cualquier duda relacionada con estos Términos de Servicio, puedes escribirnos a contacto@asidesimple.ai o a través de nuestro WhatsApp (+52) 442 615 0681.',
    ],
  },
];

export default function Terminos() {
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
        Términos de Servicio
      </motion.h1>

      <motion.p style={legalUpdateStyles} variants={itemVariants}>
        Última actualización: 6 de agosto de 2026
      </motion.p>

      <motion.p style={legalIntroStyles} variants={itemVariants}>
        Estos Términos de Servicio regulan el uso de los productos y servicios ofrecidos por
        AsíDeSimple AI, empresa de tecnología con sede en Santiago de Querétaro, México, dedicada
        al desarrollo de chatbots, CRMs y automatizaciones impulsadas por inteligencia artificial.
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
