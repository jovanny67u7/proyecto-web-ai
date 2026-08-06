import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const dotStyle = {
  pointerEvents: 'none',
  position: 'fixed',
  zIndex: 999999,
  height: '6px',
  width: '6px',
  borderRadius: '50%',
  background: 'var(--brand-green)',
  transform: 'translate(-50%, -50%)',
};

const ringWrapperStyle = {
  pointerEvents: 'none',
  position: 'fixed',
  zIndex: 999999,
  transform: 'translate(-50%, -50%)',
};

const ringStyle = {
  height: '40px',
  width: '40px',
  borderRadius: '50%',
  border: '1px solid var(--brand-green)',
};

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 350, damping: 28, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 350, damping: 28, mass: 0.5 });

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    setEnabled(true);
    document.body.classList.add('custom-cursor-activo');

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target;
      setHovering(!!el.closest('a, button, [data-cursor-hover]'));
    };

    window.addEventListener('mousemove', move);
    return () => {
      window.removeEventListener('mousemove', move);
      document.body.classList.remove('custom-cursor-activo');
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div style={{ ...dotStyle, left: x, top: y }} />
      <motion.div style={{ ...ringWrapperStyle, left: ringX, top: ringY }}>
        <motion.div
          style={ringStyle}
          animate={{ scale: hovering ? 2.2 : 1, opacity: hovering ? 0.6 : 0.35 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </motion.div>
    </>
  );
}