export const panelStyles = { display: 'flex', flexDirection: 'column', gap: '2rem' };

export const cardStyles = {
  background: 'var(--surface)',
  border: '0.5px solid var(--border)',
  borderRadius: '1rem',
  padding: '1.75rem',
};

export const formGridStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1.25rem',
  marginBottom: '1.25rem',
};

export const labelStyles = {
  display: 'block',
  fontSize: '0.78rem',
  color: 'var(--text-muted)',
  marginBottom: '0.5rem',
  marginTop: '1.1rem',
};

export const inputStyles = {
  width: '100%',
  background: 'var(--surface-2)',
  border: '0.5px solid var(--border)',
  borderRadius: '0.6rem',
  padding: '0.65rem 0.9rem',
  color: 'var(--text)',
  outline: 'none',
  fontSize: '0.88rem',
  fontFamily: 'inherit',
};

export const primaryBtnStyles = {
  background: 'linear-gradient(135deg, var(--brand-green), var(--brand-blue))',
  border: 'none',
  borderRadius: '999px',
  padding: '0.6rem 1.4rem',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

export const secondaryBtnStyles = {
  background: 'transparent',
  border: '0.5px solid var(--border)',
  borderRadius: '999px',
  padding: '0.6rem 1.2rem',
  color: 'var(--text)',
  fontSize: '0.85rem',
  cursor: 'pointer',
};

export const dangerBtnStyles = {
  background: 'transparent',
  border: '0.5px solid rgba(255,60,60,0.4)',
  borderRadius: '999px',
  padding: '0.6rem 1.2rem',
  color: '#ff6b6b',
  fontSize: '0.85rem',
  cursor: 'pointer',
};

export const errorStyles = {
  background: 'rgba(255,60,60,0.1)',
  border: '0.5px solid rgba(255,60,60,0.3)',
  color: '#ff6b6b',
  borderRadius: '0.6rem',
  padding: '0.75rem 1rem',
  fontSize: '0.85rem',
};

export const mensajeStyles = {
  background: 'rgba(132,189,0,0.1)',
  border: '0.5px solid rgba(132,189,0,0.3)',
  color: 'var(--brand-green)',
  borderRadius: '0.6rem',
  padding: '0.75rem 1rem',
  fontSize: '0.85rem',
};

export const tableStyles = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.85rem',
};

export const thStyles = {
  textAlign: 'left',
  padding: '0.6rem 0.75rem',
  borderBottom: '0.5px solid var(--border)',
  color: 'var(--text-muted)',
  fontWeight: 600,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
};

export const tdStyles = {
  padding: '0.6rem 0.75rem',
  borderBottom: '0.5px solid var(--border)',
};
