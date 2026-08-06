# Contexto de UI/UX: "AsíDeSimple AI"
Nuestro proyecto está en React + Vite y utilizamos variables CSS personalizadas (ej. `var(--brand-green)`) y estilos en línea. Queremos llevar el diseño al siguiente nivel integrando animaciones fluidas y un cursor personalizado.

## Objetivos del Asistente (Cloud Code / Gemini)
Debes ayudarme a implementar la librería `framer-motion` para lograr dos cosas principales:

### 1. Cursor Personalizado (Custom Cursor)
Tengo este código base para un cursor interactivo. Tu tarea es adaptarlo a nuestro proyecto:
*   Elimina la directiva `"use client";` ya que usamos Vite (todo es cliente).
*   **Importante:** El código usa Tailwind CSS (`bg-gold`, `z-[100]`, `h-1.5`, etc.). Debes traducir todas esas clases a **estilos en línea estándar de React**, utilizando `var(--brand-green)` en lugar de gold para mantener nuestra identidad visual.
*   Crea el componente `CustomCursor.jsx` listo para ser importado en `App.jsx`.

**Código Base del Cursor:**
```tsx
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 350, damping: 28, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 350, damping: 28, mass: 0.5 });

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement;
      setHovering(!!el.closest("a, button, [data-cursor-hover]"));
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div style={{ left: x, top: y }} className="pointer-events-none fixed z-[100] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />
      <motion.div style={{ left: ringX, top: ringY }} className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-1/2">
        <motion.div animate={{ scale: hovering ? 2.2 : 1, opacity: hovering ? 0.6 : 0.35 }} transition={{ duration: 0.3, ease: "easeOut" }} className="h-10 w-10 rounded-full border border-gold" />
      </motion.div>
    </>
  );
}