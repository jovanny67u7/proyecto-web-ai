const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Parte 3/4: valida que exista un JWT vigente antes de dejar pasar la petición.
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No se proporcionó un token de sesión.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = payload; // { id, nombre, email, roles }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'La sesión ha expirado. Inicia sesión nuevamente.' });
    }
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

// Parte 3: control de acceso por rol. Uso: autorizarRoles('Administrador', 'Editor')
function autorizarRoles(...rolesPermitidos) {
  return (req, res, next) => {
    const rolesUsuario = req.usuario?.roles || [];
    const tieneAcceso = rolesUsuario.some((rol) => rolesPermitidos.includes(rol));

    if (!tieneAcceso) {
      return res.status(403).json({ error: 'No tienes permisos para acceder a este recurso.' });
    }
    next();
  };
}

module.exports = { verificarToken, autorizarRoles };