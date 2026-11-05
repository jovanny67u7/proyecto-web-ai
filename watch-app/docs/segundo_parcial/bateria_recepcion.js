// Batería de recepción end-to-end: dispara N cotizaciones reales contra el servidor local
// y registra, por intento, los tiempos de la API y de la base de datos.
const path = require('path');
const fs = require('fs');
const SERVER = 'C:/Users/jovan/Downloads/PROYECTO-WEB-PROFESIONAL/asidesimple-ai/server';
process.env.DATABASE_URL = 'postgresql://postgres@localhost:5433/asidesimple_dev?schema=public';
const { PrismaClient } = require(path.join(SERVER, 'node_modules/@prisma/client'));
const prisma = new PrismaClient();

const BASE = 'http://localhost:3001';
const N = 10;
const ESPERA_MS = 10000;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const post = (ruta, body, token) => fetch(BASE + ruta, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
  body: JSON.stringify(body),
});

(async () => {
  const cuenta = { nombre: 'Laura Martinez', email: 'bitacora@pruebas.test', password: 'bitacora123' };
  await post('/api/auth/registro', cuenta);
  const { token } = await (await post('/api/auth/login', cuenta)).json();

  const productos = await (await fetch(`${BASE}/api/productos`)).json();
  const salida = [];
  for (let i = 1; i <= N; i++) {
    const p = productos[(i - 1) % productos.length];
    const t0 = new Date();
    const res = await post('/api/cotizaciones', {
      productoId: p.id, modulosSeleccionados: [p.caracteristicas[(i - 1) % p.caracteristicas.length], `Intento ${i}`],
      telefono: '4426150681',
    }, token);
    const t1 = new Date();
    const cot = await res.json();

    let n = null;
    for (let k = 0; k < 150; k++) {
      n = await prisma.notificacion.findFirst({ where: { cotizacionId: cot.id } });
      if (n && n.entregadaEn) break;
      await esperar(100);
    }
    salida.push({
      intento: i, servicio: p.nombre, http: res.status, leadId: cot.id, notificacionId: n && n.id,
      disparo: t0.toISOString(), respuesta: t1.toISOString(),
      emitida: n && n.emitidaEn.toISOString(), entregada: n && n.entregadaEn && n.entregadaEn.toISOString(),
      msRespuesta: t1 - t0, msDisparoAck: n && n.entregadaEn ? n.entregadaEn - t0 : null,
    });
    console.log(JSON.stringify(salida[salida.length - 1]));
    await esperar(ESPERA_MS);
  }
  fs.writeFileSync(path.join(__dirname, 'bateria.json'), JSON.stringify(salida, null, 1));
  await prisma.$disconnect();
})();
