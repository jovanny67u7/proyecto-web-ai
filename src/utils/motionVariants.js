export const contenedorVariants = {
  oculto: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

export const itemVariants = {
  oculto: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};