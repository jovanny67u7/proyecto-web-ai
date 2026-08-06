import { API_URL } from './authApi';

// Wrapper de fetch que adjunta el JWT (si existe) y normaliza el manejo de errores.
export async function apiFetch(path, { method = 'GET', body, isFormData = false, headers = {} } = {}) {
  const token = localStorage.getItem('token');
  const finalHeaders = { ...headers };
  if (token) finalHeaders.Authorization = `Bearer ${token}`;
  if (!isFormData && body !== undefined) finalHeaders['Content-Type'] = 'application/json';

  const respuesta = await fetch(`${API_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(datos.error || 'Ocurrió un error al comunicarse con el servidor.');
  }

  return datos;
}
