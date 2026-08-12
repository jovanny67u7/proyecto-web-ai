import React, { useEffect, useRef } from 'react';

// Fondo de partículas tipo constelación: puntos que flotan lentamente y se
// conectan con líneas tenues cuando quedan cerca entre sí. Implementado con
// <canvas> puro (sin librerías extra) para mantener el bundle liviano —
// el proyecto ya tiene suficiente peso en imágenes.
export default function ParticulasCanvas({ cantidad = 70, colorRGB = '132, 189, 0', distanciaConexion = 130 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let ancho = 0;
    let alto = 0;
    let particulas = [];
    let animationId;

    function redimensionar() {
      ancho = canvas.offsetWidth;
      alto = canvas.offsetHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = ancho * dpr;
      canvas.height = alto * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function crearParticulas() {
      particulas = Array.from({ length: cantidad }, () => ({
        x: Math.random() * ancho,
        y: Math.random() * alto,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 1 + Math.random() * 1.5,
      }));
    }

    function paso() {
      ctx.clearRect(0, 0, ancho, alto);

      for (const p of particulas) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > ancho) p.vx *= -1;
        if (p.y < 0 || p.y > alto) p.vy *= -1;
      }

      for (let i = 0; i < particulas.length; i++) {
        for (let j = i + 1; j < particulas.length; j++) {
          const a = particulas[i];
          const b = particulas[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < distanciaConexion) {
            const opacidad = (1 - dist / distanciaConexion) * 0.25;
            ctx.strokeStyle = `rgba(${colorRGB}, ${opacidad})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particulas) {
        ctx.fillStyle = `rgba(${colorRGB}, 0.6)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(paso);
    }

    redimensionar();
    crearParticulas();
    paso();

    const alRedimensionar = () => {
      redimensionar();
      crearParticulas();
    };
    window.addEventListener('resize', alRedimensionar);

    return () => {
      window.removeEventListener('resize', alRedimensionar);
      cancelAnimationFrame(animationId);
    };
  }, [cantidad, colorRGB, distanciaConexion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  );
}
