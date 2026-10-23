// Pruebas de integración del canal del reloj y de POST /api/cotizaciones.
// Levantan el servidor real contra una base de datos de PRUEBAS:
//   TEST_DATABASE_URL=postgresql://postgres@localhost:5433/asidesimple_test npm test
// (la base debe tener el schema aplicado: npx prisma db push).
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');

const DATABASE_URL = process.env.TEST_DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Define TEST_DATABASE_URL (nunca uses la base de producción).');
  process.exit(1);
}
process.env.DATABASE_URL = DATABASE_URL;

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PORT = 3999;
const BASE = `http://localhost:${PORT}`;
const WS_URL = `ws://localhost:${PORT}/ws/reloj`;
const JWT_SECRET = 'secreto-de-pruebas';
const DEVICE_TOKEN = 'token-reloj-pruebas';

let servidor;
let tokenUsuario;
let tokenAdmin;
let producto;

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function post(ruta, body, token) {
  return fetch(BASE + ruta, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: JSON.stringify(body),
  });
}

// Conecta un reloj y acumula los mensajes recibidos.
function conectarReloj(headers = { Authorization: `Bearer ${DEVICE_TOKEN}` }) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL, { headers });
    ws.mensajes = [];
    ws.on('message', (d) => ws.mensajes.push(JSON.parse(d.toString())));
    ws.once('open', () => resolve(ws));
    ws.once('unexpected-response', (_req, res) => reject(new Error(`HTTP ${res.statusCode}`)));
    ws.once('error', reject);
  });
}

async function esperarMensaje(ws, filtro, ms = 3000) {
  const limite = Date.now() + ms;
  while (Date.now() < limite) {
    const m = ws.mensajes.find(filtro);
    if (m) return m;
    await esperar(50);
  }
  return null;
}

async function cerrar(ws) {
  if (ws.readyState === WebSocket.CLOSED) return;
  await new Promise((r) => { ws.once('close', r); ws.close(); });
}

// Marca todo como entregado para que cada prueba arranque sin pendientes.
const limpiarPendientes = () =>
  prisma.notificacion.updateMany({ where: { entregadaEn: null }, data: { entregadaEn: new Date() } });

before(async () => {
  const rolUser = await prisma.rol.upsert({ where: { nombre: 'USER' }, update: {}, create: { nombre: 'USER' } });
  const rolAdmin = await prisma.rol.upsert({ where: { nombre: 'ADMIN' }, update: {}, create: { nombre: 'ADMIN' } });
  const categoria = await prisma.categoria.upsert({ where: { nombre: 'Pruebas' }, update: {}, create: { nombre: 'Pruebas' } });
  producto = await prisma.producto.findFirst({ where: { nombre: 'Chatbot IA (pruebas)' } })
    || await prisma.producto.create({
      data: { nombre: 'Chatbot IA (pruebas)', descripcion: 'x', caracteristicas: '[]', categoriaId: categoria.id },
    });

  const usuario = await prisma.usuario.upsert({
    where: { email: 'cliente@pruebas.test' },
    update: {},
    create: { nombre: 'Ana Cliente', email: 'cliente@pruebas.test', password: 'x', roles: { create: [{ rolId: rolUser.id }] } },
  });
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@pruebas.test' },
    update: {},
    create: { nombre: 'Admin', email: 'admin@pruebas.test', password: 'x', roles: { create: [{ rolId: rolAdmin.id }] } },
  });
  tokenUsuario = jwt.sign({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, roles: ['USER'] }, JWT_SECRET);
  tokenAdmin = jwt.sign({ id: admin.id, nombre: admin.nombre, email: admin.email, roles: ['ADMIN'] }, JWT_SECRET);

  servidor = spawn(process.execPath, [path.join(__dirname, '..', 'index.js')], {
    env: { ...process.env, PORT: String(PORT), JWT_SECRET, DEVICE_TOKEN, DATABASE_URL },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  servidor.stdout.on('data', (d) => process.env.DEBUG_SERVER && process.stdout.write(d));
  servidor.stderr.on('data', (d) => process.env.DEBUG_SERVER && process.stderr.write(d));

  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(`${BASE}/api/salud`)).ok) return; } catch { /* aún arrancando */ }
    await esperar(200);
  }
  throw new Error('El servidor no arrancó');
});

after(async () => {
  servidor?.kill();
  await prisma.$disconnect();
});

test('GET /api/salud responde 200 con estado de la base', async () => {
  const res = await fetch(`${BASE}/api/salud`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.baseDeDatos, 'ok');
});

test('el canal rechaza conexiones sin token o con token inválido', async () => {
  await assert.rejects(conectarReloj({}), /401/);
  await assert.rejects(conectarReloj({ Authorization: 'Bearer incorrecto' }), /401/);
});

test('cotización válida: 201, evento emitido al reloj y ack guarda entregadaEn', async () => {
  await limpiarPendientes();
  const reloj = await conectarReloj();
  try {
    const modulos = [`Módulo ${Date.now()}`];
    const res = await post('/api/cotizaciones', { productoId: producto.id, modulosSeleccionados: modulos, telefono: '+52 442 123 4567' }, tokenUsuario);
    assert.equal(res.status, 201);
    const cotizacion = await res.json();

    const msg = await esperarMensaje(reloj, (m) => m.tipo === 'nueva_cotizacion' && m.payload.leadId === cotizacion.id);
    assert.ok(msg, 'el reloj debió recibir nueva_cotizacion');
    assert.equal(msg.payload.nombre, 'Ana Cliente');
    assert.equal(msg.payload.servicio, 'Chatbot IA (pruebas)');
    assert.equal(msg.payload.telefono, '+524421234567');
    assert.ok(Number.isInteger(msg.payload.notificacionId));
    assert.ok(!Number.isNaN(Date.parse(msg.payload.hora)));

    reloj.send(JSON.stringify({ tipo: 'ack', notificacionId: msg.payload.notificacionId }));
    let n;
    for (let i = 0; i < 20; i++) {
      n = await prisma.notificacion.findUnique({ where: { id: msg.payload.notificacionId } });
      if (n.entregadaEn) break;
      await esperar(100);
    }
    assert.ok(n.entregadaEn, 'entregadaEn debió guardarse tras el ack');
  } finally {
    await cerrar(reloj);
  }
});

test('cotización inválida: 400 con lista de errores y NO se emite nada', async () => {
  await limpiarPendientes();
  const antes = await prisma.notificacion.count();
  const reloj = await conectarReloj();
  try {
    const res = await post('/api/cotizaciones', { productoId: 'abc', modulosSeleccionados: [], telefono: '12' }, tokenUsuario);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(Array.isArray(body.errores));
    assert.equal(body.errores.length, 3);
    assert.equal(typeof body.error, 'string'); // la página sigue mostrando `error`

    await esperar(800);
    assert.equal(reloj.mensajes.filter((m) => m.tipo.startsWith('nueva_')).length, 0);
    assert.equal(await prisma.notificacion.count(), antes);
  } finally {
    await cerrar(reloj);
  }
});

test('cotización duplicada: 409 y no se emite un segundo evento', async () => {
  await limpiarPendientes();
  const reloj = await conectarReloj();
  try {
    const body = { productoId: producto.id, modulosSeleccionados: [`Dup ${Date.now()}`] };
    assert.equal((await post('/api/cotizaciones', body, tokenUsuario)).status, 201);
    const segunda = await post('/api/cotizaciones', body, tokenUsuario);
    assert.equal(segunda.status, 409);

    await esperar(800);
    assert.equal(reloj.mensajes.filter((m) => m.tipo === 'nueva_cotizacion').length, 1);
  } finally {
    await cerrar(reloj);
  }
});

test('pendientes: lo emitido sin reloj llega al reconectar, una sola vez', async () => {
  await limpiarPendientes();
  const res = await post('/api/cotizaciones', { productoId: producto.id, modulosSeleccionados: [`Offline ${Date.now()}`] }, tokenUsuario);
  assert.equal(res.status, 201);
  const { id } = await res.json();
  await esperar(500); // deja que se cree la notificación

  const reloj = await conectarReloj();
  const msg = await esperarMensaje(reloj, (m) => m.payload?.leadId === id);
  assert.ok(msg, 'la pendiente debió llegar al conectar');
  await esperar(500);
  assert.equal(reloj.mensajes.filter((m) => m.payload?.leadId === id).length, 1, 'sin duplicados');
  reloj.send(JSON.stringify({ tipo: 'ack', notificacionId: msg.payload.notificacionId }));
  await esperar(300);
  await cerrar(reloj);

  const otra = await conectarReloj();
  await esperar(800);
  assert.equal(otra.mensajes.filter((m) => m.payload?.leadId === id).length, 0, 'ya con ack no se reenvía');
  await cerrar(otra);
});

test('POST /api/dev/notificacion-prueba: 401 sin token, 403 sin rol ADMIN, 202 con admin', async () => {
  await limpiarPendientes();
  assert.equal((await post('/api/dev/notificacion-prueba', {})).status, 401);
  assert.equal((await post('/api/dev/notificacion-prueba', {}, tokenUsuario)).status, 403);

  const reloj = await conectarReloj();
  try {
    const res = await post('/api/dev/notificacion-prueba', { nombre: 'Prueba Admin' }, tokenAdmin);
    assert.equal(res.status, 202);
    const msg = await esperarMensaje(reloj, (m) => m.payload?.nombre === 'Prueba Admin');
    assert.ok(msg);
    assert.equal(msg.payload.leadId, null);
  } finally {
    await cerrar(reloj);
  }
});
