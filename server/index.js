require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = require('./db');
const { verificarToken, autorizarRoles } = require('./middlewares/auth');

const categoriasRouter = require('./routes/categorias');
const productosRouter = require('./routes/productos');
const clientesRouter = require('./routes/clientes');
const usuariosRouter = require('./routes/usuarios');
const cotizacionesRouter = require('./routes/cotizaciones');
const estadisticasRouter = require('./routes/estadisticas');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Sirve el build de producción de React (Vite) generado en la raíz del proyecto.
app.use(express.static(path.join(__dirname, '../dist')));

// -------------------- REGISTRO --------------------
app.post('/api/auth/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y password son obligatorios.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'El password debe tener al menos 6 caracteres.' });
    }

    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) {
      return res.status(409).json({ error: 'Ya existe un usuario registrado con ese email.' });
    }

    const rolUsuario = await prisma.rol.findUnique({ where: { nombre: 'Usuario' } });
    if (!rolUsuario) {
      return res.status(500).json({ error: 'El rol "Usuario" no existe. Ejecuta el seed de roles.' });
    }

    // Parte 4: hash de contraseña con bcrypt antes de guardar.
    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: passwordHash,
        roles: {
          create: [{ rolId: rolUsuario.id }],
        },
      },
    });

    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente.',
      usuario: { id: nuevoUsuario.id, nombre: nuevoUsuario.nombre, email: nuevoUsuario.email },
    });
  } catch (error) {
    console.error('Error en /api/auth/registro:', error);
    return res.status(500).json({ error: 'Error interno al registrar el usuario.' });
  }
});

// -------------------- LOGIN --------------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son obligatorios.' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { roles: { include: { rol: true } } },
    });

    // Mensaje genérico: no revelar si fue el email o el password lo incorrecto.
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const roles = usuario.roles.map((ur) => ur.rol.nombre);

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, email: usuario.email, roles },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.json({
      mensaje: 'Inicio de sesión exitoso.',
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, roles },
    });
  } catch (error) {
    console.error('Error en /api/auth/login:', error);
    return res.status(500).json({ error: 'Error interno al iniciar sesión.' });
  }
});

// -------------------- LOGOUT --------------------

app.post('/api/auth/logout', verificarToken, (req, res) => {
  return res.json({ mensaje: 'Sesión cerrada correctamente.' });
});

// -------------------- VALIDACIÓN DE SESIÓN --------------------

app.get('/api/auth/me', verificarToken, (req, res) => {
  return res.json({ usuario: req.usuario });
});

// -------------------- RUTAS PROTEGIDAS DE EJEMPLO (Parte 3) --------------------
app.get('/api/dashboard', verificarToken, (req, res) => {
  return res.json({ mensaje: `Bienvenido ${req.usuario.nombre}`, roles: req.usuario.roles });
});

// Solo Administrador.
app.get('/api/admin', verificarToken, autorizarRoles('Administrador'), (req, res) => {
  return res.json({ mensaje: 'Panel de administración: acceso concedido.' });
});

// Administrador o Editor.
app.get('/api/editor', verificarToken, autorizarRoles('Administrador', 'Editor'), (req, res) => {
  return res.json({ mensaje: 'Panel de edición: acceso concedido.' });
});

// -------------------- CATÁLOGO, CLIENTES DE CONFIANZA Y COTIZACIONES --------------------
app.use('/api/categorias', categoriasRouter);
app.use('/api/productos', productosRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/cotizaciones', cotizacionesRouter);
app.use('/api/estadisticas', estadisticasRouter);

// Catch-all: cualquier ruta que no sea de la API ni un archivo estático
// (por ejemplo /privacidad, /productos, etc.) devuelve el index.html de React
// para que React Router resuelva la navegación en el cliente.
// Nota: Express 5 (path-to-regexp v8) ya no acepta el patrón literal '*' en
// app.get('*', ...) — lanza "Missing parameter name". Por eso se usa
// app.use(...) sin patrón de ruta al final, que cumple la misma función.
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor de autenticación corriendo en http://localhost:${PORT}`);
});