import React, { useState, useEffect, useRef } from 'react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '¡Hola! Soy el agente de AsíDeSimple AI 👋 ¿En qué te puedo asesorar hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  
  const messagesEndRef = useRef(null);

  // 1. Generar o recuperar el ID temporal al cargar el componente
  useEffect(() => {
    let currentSession = sessionStorage.getItem('asidesimple_session');
    if (!currentSession) {
      currentSession = 'guest_' + Math.random().toString(36).substring(2, 10);
      sessionStorage.setItem('asidesimple_session', currentSession);
    }
    setSessionId(currentSession);
  }, []);

  // 2. Hacer scroll automático hacia el último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 3. Función asíncrona para interactuar con n8n
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsLoading(true); 

    const payload = {
      sessionId: sessionId,
      message: userText
    };
    console.log("Datos de entrada limpios listos para envío:", payload);

    try {
      const WEBHOOK_URL = 'https://159.65.111.84.sslip.io/webhook/asidesimple-chat';

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      // AQUÍ ESTÁ LA MAGIA: Leemos la estructura [ { "output": "texto" } ]
      let botResponseText = 'Mensaje recibido, pero el formato no es legible.';
      
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        botResponseText = data[0].output;
      } else if (data.output) {
        botResponseText = data.output; // Respaldo por si n8n manda un objeto directo
      }
      
      setMessages(prev => [...prev, { sender: 'bot', text: botResponseText }]);
      
    } catch (error) {
      console.error("Error en la comunicación asíncrona:", error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Ocurrió un error de red. Verifica la consola.' }]);
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div style={containerStyle}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={floatingBtnStyle}
        aria-label="Abrir chat de soporte"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div style={chatWindowStyle}>
          <div style={chatHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={avatarStyle}>AI</div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Agente AsíDeSimple</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--brand-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={onlineDotStyle}></span> En línea
                </div>
              </div>
            </div>
          </div>

          <div style={messagesAreaStyle}>
            {messages.map((msg, index) => (
              <div key={index} style={msg.sender === 'user' ? userMsgStyle : botMsgStyle}>
                {msg.text}
              </div>
            ))}
            
            {isLoading && (
              <div style={botMsgStyle}>
                <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>El agente está procesando...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} style={inputAreaStyle}>
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Escribe tu duda..." 
              style={inputStyle}
              disabled={isLoading}
            />
            <button type="submit" style={sendBtnStyle} disabled={isLoading || !input.trim()}>
              →
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// --- ESTILOS EN LÍNEA ---
const containerStyle = { position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' };
const floatingBtnStyle = { width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-green), var(--brand-blue))', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(132, 189, 0, 0.4)', transition: 'transform 0.2s' };
const chatWindowStyle = { width: '350px', height: '500px', background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: '1.2rem', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', animation: 'slideUp 0.3s ease-out' };
const chatHeaderStyle = { background: 'var(--brand-dark)', padding: '1rem', borderBottom: '0.5px solid var(--border)' };
const avatarStyle = { width: '35px', height: '35px', borderRadius: '50%', background: 'var(--brand-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '0.8rem' };
const onlineDotStyle = { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-green)', display: 'inline-block' };
const messagesAreaStyle = { flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--surface)' };
const baseMsgStyle = { padding: '0.8rem 1rem', borderRadius: '1rem', fontSize: '0.85rem', lineHeight: '1.4', maxWidth: '85%' };
const botMsgStyle = { ...baseMsgStyle, background: 'var(--surface-2)', border: '0.5px solid var(--border)', alignSelf: 'flex-start', borderBottomLeftRadius: '4px' };
const userMsgStyle = { ...baseMsgStyle, background: 'rgba(132, 189, 0, 0.15)', border: '0.5px solid rgba(132, 189, 0, 0.3)', color: '#fff', alignSelf: 'flex-end', borderBottomRightRadius: '4px' };
const inputAreaStyle = { display: 'flex', gap: '10px', padding: '1rem', background: 'var(--surface-2)', borderTop: '0.5px solid var(--border)' };
const inputStyle = { flex: 1, background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: '999px', padding: '0.6rem 1rem', color: 'var(--text)', outline: 'none' };
const sendBtnStyle = { width: '40px', height: '40px', borderRadius: '50%', background: 'var(--brand-green)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' };

export default Chatbot;