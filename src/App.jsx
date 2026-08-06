import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';
import Chatbot from './Chatbot';
import CustomCursor from './components/CustomCursor';
import ContactForm from './components/ContactForm';
import ScrollToTop from './components/ScrollToTop';

// Importación de las Páginas Complementarias
import Home from './pages/Home';
import Productos from './pages/Productos';
import Nosotros from './pages/Nosotros';
import Clientes from './pages/Clientes';
import Opiniones from './pages/Opiniones';
import Terminos from './pages/Terminos';
import Privacidad from './pages/Privacidad';

// Autenticación y Autorización (RBAC)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { obtenerUsuario, limpiarSesion } from './utils/authApi';

function BarraNavegacionAuth() {
  const navigate = useNavigate();
  const usuario = obtenerUsuario();
  const sesionActiva = !!localStorage.getItem('token') && !!usuario;

  if (sesionActiva) {
    return (
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/dashboard" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '0.85rem' }}>
          Hola, {usuario.nombre}
        </Link>
        <button
          style={btnGhostStyle}
          onClick={() => { limpiarSesion(); navigate('/login'); }}
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <button style={btnGhostStyle} onClick={() => navigate('/login')}>Iniciar sesión</button>
      <button className="btn-primary" style={{ padding: '0.5rem 1.2rem' }} onClick={() => navigate('/login')}>Registrar</button>
    </div>
  );
}

function App() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isSummerPromo, setIsSummerPromo] = useState(false);

  useEffect(() => {
    const currentMonth = new Date().getMonth();
    if (currentMonth === 5 || currentMonth === 6) {
      setIsSummerPromo(true);
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />

      {isSummerPromo && (
        <div style={promoBannerStyle}>
          ☀️ ¡Campaña de Verano Activa! Obtén 20% de descuento en la implementación de tu CRM Inteligente este mes.
        </div>
      )}

      {/* CABECERA FIJA (Header) */}
      <nav id="navbar" style={{ ...navStyles, top: isSummerPromo ? '3.5rem' : '1.5rem' }}>
        <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>asídesimple</span><span style={aiTextStyles}>AI</span>
          </Link>
        </div>
        
        {/* MENÚ DE NAVEGACIÓN Y COMPONENTES BASADOS EN EVENTOS */}
        <div className="desktop-only" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          
          <div 
            style={{ position: 'relative', padding: '0.5rem 0' }}
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <span style={{ ...linkStyles, cursor: 'pointer', color: isDropdownOpen ? 'var(--brand-green)' : 'var(--text-muted)' }}>
              Servicios {isDropdownOpen ? '▲' : '▼'}
            </span>
            
            {/* Renderizado condicional del submenú al tocar la zona sensible con el mouse */}
            {isDropdownOpen && (
              <div style={dropdownStyle}>
                <Link to="/productos" style={dropdownItemStyle} onClick={() => setIsDropdownOpen(false)}>🤖Chatbots IA</Link>
                <Link to="/productos" style={dropdownItemStyle} onClick={() => setIsDropdownOpen(false)}>📊CRM Inteligente</Link>
                <Link to="/productos" style={dropdownItemStyle} onClick={() => setIsDropdownOpen(false)}>⚡Automatizaciones</Link>
              </div>
            )}
          </div>

          <Link to="/nosotros" style={linkStyles}>Nosotros</Link>
          <Link to="/clientes" style={linkStyles}>Clientes</Link>
          <Link to="/opiniones" style={linkStyles}>Opiniones</Link>
          <input type="text" placeholder="Búsqueda avanzada..." style={searchInputStyle} />
        </div>
        
        <BarraNavegacionAuth />
      </nav>

      {/* CONTENEDOR DINÁMICO */}
      <main style={{ paddingTop: isSummerPromo ? '10rem' : '8rem', minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/opiniones" element={<Opiniones />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* PIE DE PÁGINA FIJO */}
      <footer style={footerStyle}>
        <div className="container" style={footerInnerStyle}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h4 style={{ marginBottom: '1rem' }}>asídesimple <span style={aiTextStyles}>AI</span></h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Innovación y desarrollo tecnológico desde Querétaro, México. #asidesimple
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="https://www.facebook.com/massimplemx" target="_blank" rel="noopener noreferrer" style={socialIconStyle}>
                <FaFacebookF size={14} />
              </a>
              <a href="https://www.instagram.com/massimplemx/" target="_blank" rel="noopener noreferrer" style={socialIconStyle}>
                <FaInstagram size={16} />
              </a>
              <a href="https://www.tiktok.com/@massimple_mx" target="_blank" rel="noopener noreferrer" style={socialIconStyle}>
                <FaTiktok size={15} />
              </a>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h4 style={{ marginBottom: '1rem' }}>Marco Legal</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li><Link to="/terminos" style={linkStyles}>Términos de Servicio</Link></li>
              <li><Link to="/privacidad" style={linkStyles}>Políticas de Privacidad</Link></li>
            </ul>
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h4 style={{ marginBottom: '1rem' }}>Datos de Contacto</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <li>📍 Querétaro, México</li>
              <li>✉️ <a href="mailto:contacto@asidesimple.ai" style={linkStyles}>contacto@asidesimple.ai</a></li>
              <li>
                💬 <a href="https://wa.me/524426150681" target="_blank" rel="noopener noreferrer" style={linkStyles}>
                  +52 442 615 0681
                </a>
              </li>
            </ul>
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h4 style={{ marginBottom: '1rem' }}>Contáctanos</h4>
            <ContactForm />
          </div>
        </div>

        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '3rem' }}>
          © 2026 asídesimple AI · Todos los derechos reservados.
        </div>
      </footer>

      {/* CHATBOT ASÍNCRONO PERSISTENTE */}
      <Chatbot />

      {/* CURSOR PERSONALIZADO */}
      <CustomCursor />
    </Router>
  );
}

// --- CONSTANTES DE ESTILOS EN LÍNEA ---
const navStyles = { position: 'fixed', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '2rem', background: 'rgba(13,13,13,0.7)', backdropFilter: 'blur(20px)', border: '0.5px solid var(--border)', borderRadius: '999px', padding: '0.75rem 1.5rem', width: '90%', transition: 'top 0.3s ease' };
const aiTextStyles = { background: 'linear-gradient(135deg, var(--brand-green), var(--brand-blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 };
const linkStyles = { color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s ease' };
const searchInputStyle = { background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: '999px', padding: '0.4rem 1rem', color: 'var(--text)', outline: 'none', fontSize: '0.8rem' };
const btnGhostStyle = { background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '0.85rem' };
const footerStyle = { borderTop: '0.5px solid var(--border)', padding: '4rem 2rem 2rem', background: 'var(--brand-dark)' };
const footerInnerStyle = { display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between' };
const dropdownStyle = { position: 'absolute', top: '100%', left: '0', background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: '0.8rem', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: '180px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 1001 };
const dropdownItemStyle = { color: 'var(--text)', textDecoration: 'none', fontSize: '0.85rem', padding: '0.6rem 1rem', borderRadius: '0.5rem', transition: 'background 0.2s' };
const promoBannerStyle = { position: 'fixed', top: 0, left: 0, width: '100%', background: 'linear-gradient(135deg, var(--brand-green), var(--brand-blue))', color: '#fff', textAlign: 'center', padding: '0.6rem', fontSize: '0.85rem', fontWeight: 600, zIndex: 10000 };
const socialIconStyle = { 
  width: '32px', 
  height: '32px', 
  borderRadius: '50%', 
  background: 'var(--surface)', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  cursor: 'pointer',
  color: 'var(--text)', 
  textDecoration: 'none', 
  transition: 'background 0.2s, color 0.2s'
};

export default App;