// En producción, Express sirve el frontend y la API desde el mismo dominio (Render),
// así que las rutas deben ser relativas. En desarrollo, Vite corre en otro puerto,
// por lo que seguimos apuntando explícitamente al servidor Express local.
export const API_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

// Decodifica el payload de un JWT sin verificar la firma
// (la verificación real de la firma la hace siempre el backend).
export function decodeToken(token) {
  try {
    const payloadBase64 = token.split('.')[1];
    const normalizado = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalizado));
  } catch {
    return null;
  }
}

export function isTokenValido(token) {
  if (!token) return false;
  const payload = decodeToken(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now();
}

export function guardarSesion(token, usuario) {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

export function limpiarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

export function obtenerUsuario() {
  try {
    return JSON.parse(localStorage.getItem('usuario'));
  } catch {
    return null;
  }
}