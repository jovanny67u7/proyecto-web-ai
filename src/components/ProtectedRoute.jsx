import React from 'react';
import { Navigate } from 'react-router-dom';
import { decodeToken, isTokenValido, limpiarSesion } from '../utils/authApi';

// Protección contra acceso directo por URL: si alguien escribe /dashboard
// en la barra de direcciones sin sesión válida, se le redirige a /login.
export default function ProtectedRoute({ children, rolesPermitidos = [] }) {
  const token = localStorage.getItem('token');

  if (!token || !isTokenValido(token)) {
    limpiarSesion();
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos.length > 0) {
    const payload = decodeToken(token);
    const rolesUsuario = payload?.roles || [];
    const tieneAcceso = rolesUsuario.some((rol) => rolesPermitidos.includes(rol));

    if (!tieneAcceso) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}