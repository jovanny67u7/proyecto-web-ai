const jwt = require('jsonwebtoken');
const prisma = require('../db');

const JWT_SECRET = process.env.JWT_SECRET;

// Parte 3/4: valida que exista un JWT vigente antes de dejar pasar la petición.
// Además de validar la firma/expiración, revisa en vivo contra la base de
// datos que la cuenta siga activa: si un Administrador deshabilita a un
// usuario a mitad de sesión, el acceso se corta de inmediato en la siguiente
// petición en vez de esperar a que expire el token (hasta 2h).
async function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No se proporcionó un token de sesión.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.id },
      select: { activo: true },
    });

    if (!usuario || !usuario.activo) {
      return res.status(403).json({ error: 'Tu cuenta ha sido deshabilitada. Contacta a un administrador.' });
    }

    req.usuario = payload; // { id, nombre, email, roles }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'La sesión ha expirado. Inicia sesión nuevamente.' });
    }
    // No lo silenciamos: si JWT_SECRET falta o cambió, todo token válido
    // empieza a fallar aquí y sin este log no queda ningún rastro en Render.
    console.error('Error al verificar el JWT (revisa JWT_SECRET):', err);
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

// Parte 3: control de acceso por rol. Uso: autorizarRoles('ADMIN', 'EDITOR')
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