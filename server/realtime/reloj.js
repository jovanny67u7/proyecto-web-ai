const crypto = require('crypto');
const { EventEmitter } = require('events');
const { WebSocketServer, WebSocket } = require('ws');
const prisma = require('../db');

// Canal en tiempo real hacia el smartwatch (Wear OS).
//
// Flujo: una ruta guarda el lead y responde al cliente; después llama a
// emitirLead(). Fuera del ciclo de la petición (setImmediate) se crea la fila
// en `notificaciones` y se reenvía a todos los relojes conectados. El reloj
// contesta {"tipo":"ack","notificacionId":N} y aquí se marca entregadaEn.
// Al reconectarse, cada reloj recibe las notificaciones que siguen sin ack.

const RUTA_WS = '/ws/reloj';
const INTERVALO_PING_MS = 25_000;

const eventos = new EventEmitter();
const relojes = new Set(); // sockets autenticados y vivos

function tokenValido(recibido) {
  const esperado = process.env.DEVICE_TOKEN;
  if (!esperado || !recibido) return false;
  const a = Buffer.from(String(recibido));
  const b = Buffer.from(esperado);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// El reloj puede mandar el token como header (preferido) o como ?token=.
function extraerToken(req, url) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return req.headers['x-device-token'] || url.searchParams.get('token');
}

function enviar(ws, notificacion) {
  if (ws.readyState !== WebSocket.OPEN) return;
  // Evita mandar dos veces la misma notificación al mismo socket (p. ej. si
  // llega un lead nuevo justo mientras se reenvían los pendientes).
  if (ws.enviadas.has(notificacion.id)) return;
  ws.enviadas.add(notificacion.id);
  ws.send(JSON.stringify({
    tipo: notificacion.evento,
    payload: { ...notificacion.payload, notificacionId: notificacion.id },
  }));
}

async function reenviarPendientes(ws) {
  const pendientes = await prisma.notificacion.findMany({
    where: { entregadaEn: null },
    orderBy: { emitidaEn: 'asc' },
    take: 50,
  });
  pendientes.forEach((n) => enviar(ws, n));
  if (pendientes.length) console.log(`[reloj] ${pendientes.length} pendiente(s) reenviada(s)`);
}

async function registrarAck(notificacionId) {
  const id = Number(notificacionId);
  if (!Number.isInteger(id) || id <= 0) return;
  // updateMany con entregadaEn: null => idempotente: un ack repetido no
  // sobrescribe la primera hora de entrega.
  const { count } = await prisma.notificacion.updateMany({
    where: { id, entregadaEn: null },
    data: { entregadaEn: new Date() },
  });
  if (count) console.log(`[reloj] ack notificacion ${id}`);
}

function adjuntarCanalReloj(server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname !== RUTA_WS) return socket.destroy();

    if (!tokenValido(extraerToken(req, url))) {
      socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');
      return socket.destroy();
    }

    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  });

  wss.on('connection', (ws) => {
    ws.vivo = true;
    ws.enviadas = new Set();
    relojes.add(ws);
    console.log(`[reloj] conectado (${relojes.size} en línea)`);

    ws.on('pong', () => { ws.vivo = true; });

    ws.on('message', (data) => {
      let msg;
      try { msg = JSON.parse(data.toString()); } catch { return; }
      if (msg.tipo === 'ack') {
        registrarAck(msg.notificacionId).catch((e) => console.error('[reloj] error en ack:', e));
      } else if (msg.tipo === 'ping') {
        ws.send(JSON.stringify({ tipo: 'pong' }));
      }
    });

    ws.on('close', () => {
      relojes.delete(ws);
      console.log(`[reloj] desconectado (${relojes.size} en línea)`);
    });
    ws.on('error', (e) => console.error('[reloj] error de socket:', e.message));

    reenviarPendientes(ws).catch((e) => console.error('[reloj] error reenviando pendientes:', e));
  });

  // Render (y casi cualquier proxy) corta conexiones inactivas: un ping cada
  // 25 s las mantiene abiertas y además detecta relojes caídos sin "close".
  const intervalo = setInterval(() => {
    for (const ws of relojes) {
      if (!ws.vivo) { relojes.delete(ws); ws.terminate(); continue; }
      ws.vivo = false;
      ws.ping();
    }
  }, INTERVALO_PING_MS);
  wss.on('close', () => clearInterval(intervalo));

  if (!process.env.DEVICE_TOKEN) {
    console.warn('⚠️  DEVICE_TOKEN no está definido: el canal /ws/reloj rechazará todas las conexiones.');
  }
  return wss;
}

// API para las rutas: se llama DESPUÉS de responder al cliente.
// lead = { evento, origen, cotizacionId?, nombre, servicio, telefono, hora }
function emitirLead(lead) {
  setImmediate(() => eventos.emit('lead', lead));
}

eventos.on('lead', async ({ evento, origen, cotizacionId = null, ...datos }) => {
  try {
    const payload = { leadId: cotizacionId, ...datos };
    const notificacion = await prisma.notificacion.create({
      data: { evento, origen, cotizacionId, payload },
    });
    relojes.forEach((ws) => enviar(ws, notificacion));
    console.log(`[reloj] ${evento} #${notificacion.id} emitida a ${relojes.size} reloj(es)`);
    eventos.emit('emitida', notificacion);
  } catch (e) {
    console.error('[reloj] no se pudo emitir la notificación:', e);
  }
});

module.exports = { adjuntarCanalReloj, emitirLead, eventos, relojesConectados: () => relojes.size, RUTA_WS };
