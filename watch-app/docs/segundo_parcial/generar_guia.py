# Genera la guía en PDF de lo implementado en el Segundo Parcial.
# Uso: python generar_guia.py <ruta-salida.pdf>   (requiere reportlab)
import json
import os
import re
import statistics
import sys
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, CondPageBreak, Frame, Image, KeepTogether, PageBreak,
                                PageTemplate, Paragraph, Preformatted, Spacer, Table, TableStyle)

AQUI = os.path.dirname(os.path.abspath(__file__))
CIRC = os.path.join(AQUI, "..", "capturas_circulares")
SALIDA = sys.argv[1]
BITACORA = sys.argv[2] if len(sys.argv) > 2 else os.path.join(AQUI, "bitacora_recepcion_2026-11-05.json")

F = "C:/Windows/Fonts/"
for nombre, archivo in [("Arial", "arial.ttf"), ("Arial-B", "arialbd.ttf"), ("Arial-I", "ariali.ttf"),
                        ("Arial-BI", "arialbi.ttf"), ("Mono", "consola.ttf"), ("Mono-B", "consolab.ttf")]:
    pdfmetrics.registerFont(TTFont(nombre, F + archivo))
registerFontFamily("Arial", normal="Arial", bold="Arial-B", italic="Arial-I", boldItalic="Arial-BI")

VERDE = colors.HexColor("#84BD00")
VERDE_OSC = colors.HexColor("#4E7000")
NEGRO = colors.HexColor("#2D2926")
GRIS = colors.HexColor("#6B6662")
GRIS_CLARO = colors.HexColor("#F3F2EF")
BORDE = colors.HexColor("#D9D6D1")
AZUL = colors.HexColor("#1F5F8B")
ANCHO = 7.3 * inch

st = {
    "titulo": ParagraphStyle("titulo", fontName="Arial-B", fontSize=25, leading=30, textColor=NEGRO),
    "sub": ParagraphStyle("sub", fontName="Arial", fontSize=12, leading=16, textColor=GRIS),
    "h1": ParagraphStyle("h1", fontName="Arial-B", fontSize=16, leading=20, textColor=NEGRO, spaceBefore=10, spaceAfter=6),
    "h2": ParagraphStyle("h2", fontName="Arial-B", fontSize=12, leading=15, textColor=VERDE_OSC, spaceBefore=9, spaceAfter=4),
    "p": ParagraphStyle("p", fontName="Arial", fontSize=9.5, leading=13.5, textColor=NEGRO, spaceAfter=5),
    "li": ParagraphStyle("li", fontName="Arial", fontSize=9.5, leading=13.5, textColor=NEGRO, leftIndent=14, bulletIndent=4, spaceAfter=2),
    "nota": ParagraphStyle("nota", fontName="Arial", fontSize=9, leading=12.5, textColor=NEGRO),
    "celda": ParagraphStyle("celda", fontName="Arial", fontSize=8.5, leading=11, textColor=NEGRO),
    "celda_b": ParagraphStyle("celda_b", fontName="Arial-B", fontSize=8.5, leading=11, textColor=colors.white),
    "codigo": ParagraphStyle("codigo", fontName="Mono", fontSize=7.6, leading=9.6, textColor=NEGRO),
    "archivo": ParagraphStyle("archivo", fontName="Mono-B", fontSize=7.6, leading=10, textColor=AZUL),
    "pie": ParagraphStyle("pie", fontName="Arial", fontSize=8, leading=10, textColor=GRIS, alignment=TA_CENTER),
}

story = []
secciones = []


def md(t):
    t = escape(t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    return re.sub(r"`(.+?)`", r'<font name="Mono" color="#1F5F8B">\1</font>', t)


def h1(t):
    secciones.append(t)
    story.append(CondPageBreak(1.7 * inch))
    story.append(Paragraph(f"{len(secciones)}. {md(t)}", st["h1"]))
    story.append(Table([[""]], colWidths=[ANCHO], rowHeights=[2], style=[("BACKGROUND", (0, 0), (-1, -1), VERDE)]))
    story.append(Spacer(1, 6))


def h2(t):
    story.append(CondPageBreak(1.5 * inch))
    story.append(Paragraph(md(t), st["h2"]))


def p(t):
    story.append(Paragraph(md(t), st["p"]))


def lista(items, numerada=False):
    for i, it in enumerate(items, 1):
        story.append(Paragraph(md(it), st["li"], bulletText=f"{i}." if numerada else "•"))
    story.append(Spacer(1, 4))


def codigo(texto, archivo=None):
    filas = [[Paragraph(escape(archivo), st["archivo"])]] if archivo else []
    filas.append([Preformatted(texto.strip("\n"), st["codigo"])])
    t = Table(filas, colWidths=[ANCHO])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), GRIS_CLARO), ("BOX", (0, 0), (-1, -1), 0.5, BORDE),
                           ("LINEBEFORE", (0, 0), (0, -1), 3, VERDE), ("LEFTPADDING", (0, 0), (-1, -1), 8),
                           ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
    story.append(KeepTogether([t]))
    story.append(Spacer(1, 7))


def tabla(enc, filas, anchos):
    datos = [[Paragraph(md(h), st["celda_b"]) for h in enc]] + [[Paragraph(md(c), st["celda"]) for c in f] for f in filas]
    t = Table(datos, colWidths=[a * inch for a in anchos], repeatRows=1)
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), NEGRO), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, GRIS_CLARO]),
                           ("GRID", (0, 0), (-1, -1), 0.4, BORDE), ("VALIGN", (0, 0), (-1, -1), "TOP"),
                           ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]))
    story.append(t)
    story.append(Spacer(1, 8))


def nota(titulo, texto, aviso=False):
    t = Table([[Paragraph(f"<b>{escape(titulo)}</b><br/>{md(texto)}", st["nota"])]], colWidths=[ANCHO])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FDF1EF" if aviso else "#F4F9E8")),
                           ("LINEBEFORE", (0, 0), (0, -1), 3, colors.HexColor("#C62828") if aviso else VERDE),
                           ("LEFTPADDING", (0, 0), (-1, -1), 9), ("TOPPADDING", (0, 0), (-1, -1), 6),
                           ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]))
    story.append(KeepTogether([t]))
    story.append(Spacer(1, 8))


def imagen(ruta, ancho, alto, pie=None):
    bloque = [Image(ruta, width=ancho, height=alto, mask="auto")]
    if pie:
        bloque += [Spacer(1, 3), Paragraph(escape(pie), st["pie"])]
    story.append(KeepTogether(bloque))
    story.append(Spacer(1, 8))


def pantalla(izq, der, titulo, texto):
    a = 1.75 * inch
    fila = [Image(os.path.join(CIRC, izq), width=a, height=a, mask="auto"),
            Image(os.path.join(CIRC, der), width=a, height=a, mask="auto"),
            [Paragraph(f"<b>{escape(titulo)}</b>", st["p"]), Paragraph(md(texto), st["nota"])]]
    t = Table([fila], colWidths=[1.85 * inch, 1.85 * inch, 3.6 * inch])
    t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 2),
                           ("RIGHTPADDING", (0, 0), (-1, -1), 2), ("LINEBELOW", (0, 0), (-1, -1), 0.4, BORDE),
                           ("BOTTOMPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 6)]))
    story.append(KeepTogether([t]))


# ============================== CONTENIDO ==============================
h1("Qué se construyó")
p("Cuando un cliente pide una cotización en la página de AsíDeSimple AI, el servidor la guarda y **empuja** un aviso a un reloj Wear OS en menos de un segundo. El reloj muestra una tarjeta con el nombre del cliente, vibra con un patrón propio y confirma la entrega. Si el reloj no tiene red, el aviso queda pendiente y llega al reconectar. No hay app de teléfono: el reloj abre su propia conexión al servidor.")
h2("Entregables del Segundo Parcial")
tabla(["Entregable", "Qué se hizo", "Estado"], [
    ["Especificación del payload", "Mensajes, campos, ack y reglas del protocolo.", "Completo"],
    ["Diagrama de comunicación", "Servidor y reloj con las dos rutas de red.", "Completo. No hay app companion: el teléfono solo presta internet."],
    ["Mockup de la notificación básica", "Aviso y vibración, sin botones.", "Completo"],
    ["Recepción de datos", "App Kotlin que decodifica el payload y activa la vibración.", "Completo. Es app de Wear OS, no firmware."],
    ["Bitácora de pruebas de recepción", "10 intentos medidos y 6 escenarios.", "Completo en emulador. Falta el reloj físico."],
], [2.0, 2.9, 2.4])
h2("Dónde está cada cosa")
tabla(["Qué", "Dónde"], [
    ["Código en producción", "Rama `main` del repositorio github.com/jovanny67u7/proyecto-web-ai"],
    ["Documentación, capturas y bitácora", "Rama `feature/reloj-notificaciones`, carpeta `watch-app/docs/`"],
    ["Servidor", "`server/` (Express, Prisma, `realtime/reloj.js`)"],
    ["App del reloj", "`watch-app/` (Kotlin, Jetpack Compose para Wear OS, minSdk 30)"],
    ["Sitio publicado", "https://proyecto-web-ai.onrender.com"],
    ["Canal del reloj", "`wss://proyecto-web-ai.onrender.com/ws/reloj`"],
], [2.6, 4.7])

h1("Cómo funciona")
imagen(os.path.join(AQUI, "diagrama_comunicacion.png"), ANCHO, ANCHO / 2)
h2("El recorrido de una cotización")
lista([
    "Al abrir la app, `RelojService` conecta el WebSocket con el token de dispositivo. Si el token no es válido, el servidor responde 401.",
    "Recién conectado, el servidor le manda las notificaciones que siguen sin confirmar.",
    "El cliente envía el formulario: `POST /api/cotizaciones` con su JWT.",
    "El servidor valida (400 si hay errores), revisa duplicados de los últimos 2 minutos (409) y guarda la cotización.",
    "Responde **201** al navegador. La página no espera al reloj.",
    "Fuera de la petición (`setImmediate` y `EventEmitter`) crea la fila en `notificaciones`.",
    "Envía el JSON a cada reloj conectado.",
    "El reloj lo decodifica. Si el id es nuevo, lo guarda, muestra la tarjeta y vibra.",
    "El reloj responde con el ack y el servidor guarda la hora en `entregadaEn`.",
], numerada=True)
p("Mientras tanto, el servidor manda un ping cada 25 s. Si el reloj no contesta antes del siguiente ping, cierra esa conexión.")
nota("¿Por qué WebSocket y no preguntar cada cierto tiempo?",
     "Si el reloj preguntara cada X segundos, el aviso tardaría hasta X segundos y gastaría batería en peticiones vacías. Con WebSocket la conexión queda abierta y el servidor habla primero. En la bitácora, la mediana del disparo al ack guardado fue de 122 ms.")
h2("Vocabulario")
tabla(["Término", "Qué significa aquí"], [
    ["Lead", "Cliente potencial: cada cotización que entra desde la página."],
    ["Notificación", "Fila de la tabla `notificaciones`: un aviso que debe llegar al reloj. Su id es el `notificacionId`."],
    ["Ack", "Confirmación del reloj: ya procesé la notificación N."],
    ["Pendiente", "Notificación con `entregadaEn` vacío: nadie la ha confirmado."],
    ["Backoff", "Esperar 1, 2, 4 y hasta 60 s entre intentos de reconexión."],
    ["Servicio en primer plano", "Componente de Android que sigue vivo con la pantalla apagada, a cambio de una notificación fija."],
    ["DEVICE_TOKEN", "Secreto compartido entre el servidor y el reloj para autenticar el canal."],
    ["Sabor (flavor)", "Variante de la app: `local` apunta a tu PC y `prod` a Render."],
], [1.8, 5.5])

h1("El protocolo: mensajes JSON")
p("Todos los mensajes son texto JSON con un campo `tipo` y, si aplica, un `payload`. Este mensaje es real, recibido desde producción:")
codigo('''
{
  "tipo": "nueva_cotizacion",
  "payload": {
    "hora": "2026-10-28T01:26:56.795Z",
    "leadId": 4,
    "nombre": "Jovanny Lopez",
    "servicio": "Chatbot IA",
    "telefono": null,
    "notificacionId": 3
  }
}''', "Servidor a reloj")
codigo('{"tipo": "ack", "notificacionId": 3}', "Reloj a servidor")
tabla(["Campo", "Tipo", "De dónde sale", "Para qué lo usa el reloj"], [
    ["`leadId`", "entero o null", "`cotizaciones.id`", "Identifica la cotización. Es null en las pruebas."],
    ["`notificacionId`", "entero", "`notificaciones.id`", "Clave del ack y de la deduplicación."],
    ["`nombre`", "texto", "Usuario autenticado (JWT)", "Dato principal de la tarjeta."],
    ["`servicio`", "texto", "`productos.nombre`", "Subtítulo de la tarjeta."],
    ["`telefono`", "texto o null", "`cotizaciones.telefono`", "Llamar y WhatsApp. La página aún no lo pide."],
    ["`hora`", "texto ISO 8601, UTC", "`cotizaciones.fecha`", "Hora en gris, en la zona del reloj."],
], [1.2, 1.2, 1.9, 3.0])
tabla(["Tipo", "Sentido", "Cuándo se envía"], [
    ["`nueva_cotizacion`", "Servidor a reloj", "Al guardar una cotización válida, y al reconectar si sigue pendiente."],
    ["`nueva_compra`", "Servidor a reloj", "Hoy solo desde el endpoint de prueba: el sistema no tiene ruta de compra."],
    ["`ack`", "Reloj a servidor", "Cada vez que procesa una notificación, aunque sea repetida."],
    ["`ping` y `pong`", "Ambos", "Control de la conexión: 25 s en el servidor y 20 s en OkHttp."],
], [1.6, 1.3, 4.4])

h1("El servidor")
h2("Base de datos")
p("Se agregó una tabla y una columna opcional. Son cambios aditivos: no borran ni renombran nada. Render los aplica en cada deploy con `prisma db push`.")
codigo('''
model Notificacion {
  id           Int         @id @default(autoincrement())
  cotizacionId Int?        // null para notificaciones de prueba
  cotizacion   Cotizacion? @relation(fields: [cotizacionId], references: [id], onDelete: SetNull)
  origen       String      // "cotizacion" | "prueba"
  evento       String      // "nueva_cotizacion" | "nueva_compra"
  payload      Json
  emitidaEn    DateTime    @default(now())
  entregadaEn  DateTime?   // se llena con el ack
  @@index([entregadaEn])
  @@map("notificaciones")
}''', "server/prisma/schema.prisma")
h2("Autenticar al reloj")
p("Un WebSocket empieza como una petición HTTP. El servidor revisa la ruta y el token en ese momento, antes de aceptar la conexión. Si `DEVICE_TOKEN` no está definido, rechaza todo.")
codigo('''
server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname !== RUTA_WS) return socket.destroy();

  if (!tokenValido(extraerToken(req, url))) {
    socket.write('HTTP/1.1 401 Unauthorized\\r\\nConnection: close\\r\\n\\r\\n');
    return socket.destroy();
  }
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
});''', "server/realtime/reloj.js")
h2("Emitir sin bloquear la respuesta")
p("La ruta responde 201 y después llama a `emitirLead`. Si emitir falla o tarda, el cliente de la página ya tiene su respuesta.")
codigo('''
function emitirLead(lead) {
  setImmediate(() => eventos.emit('lead', lead));
}

eventos.on('lead', async ({ evento, origen, cotizacionId = null, ...datos }) => {
  const payload = { leadId: cotizacionId, ...datos };
  const notificacion = await prisma.notificacion.create({ data: { evento, origen, cotizacionId, payload } });
  relojes.forEach((ws) => enviar(ws, notificacion));
});''', "server/realtime/reloj.js (resumido)")
h2("Pendientes y ack")
codigo('''
async function reenviarPendientes(ws) {
  const pendientes = await prisma.notificacion.findMany({
    where: { entregadaEn: null }, orderBy: { emitidaEn: 'asc' }, take: 50,
  });
  pendientes.forEach((n) => enviar(ws, n));
}

// "entregadaEn: null" lo hace idempotente: un ack repetido no cambia la primera hora.
await prisma.notificacion.updateMany({
  where: { id, entregadaEn: null },
  data: { entregadaEn: new Date() },
});''', "server/realtime/reloj.js (resumido)")
h2("Rutas nuevas o modificadas")
tabla(["Ruta", "Protección", "Qué hace"], [
    ["`POST /api/cotizaciones`", "JWT", "Validación con lista de errores (400), duplicado en 2 min (409) y aviso al reloj después del 201."],
    ["`GET /api/salud`", "Pública", "Estado de la base de datos y cuántos relojes hay conectados. Responde 503 si la base no contesta."],
    ["`POST /api/dev/notificacion-prueba`", "JWT con rol ADMIN", "Dispara un aviso falso para probar el canal, con `origen: prueba`."],
    ["`/ws/reloj`", "DEVICE_TOKEN", "Canal WebSocket del reloj."],
], [2.5, 1.3, 3.5])

h1("La app del reloj")
codigo('''
watch-app/app/src/main/java/ai/asidesimple/reloj/
├── MainActivity.kt     Activity y navegación entre pantallas
├── RelojService.kt     servicio en primer plano, escucha de red
├── ClienteReloj.kt     WebSocket con OkHttp, reconexión y ack
├── Lead.kt             modelo y lectura del JSON
├── EstadoReloj.kt      estado compartido entre servicio e interfaz
├── Almacen.kt          historial e ids ya vistos (SharedPreferences)
├── Avisos.kt           canales, notificación y vibración
├── Acciones.kt         Llamar y WhatsApp
└── ui/                 Pantallas.kt y Tema.kt (Compose)''')
p("La URL y el token no están en el código. Gradle los lee de `watch-app/local.properties`, que no se sube a git, y los convierte en `BuildConfig.WS_URL` y `BuildConfig.DEVICE_TOKEN`.")
h2("La cadena de recepción")
codigo('''
override fun onMessage(webSocket: WebSocket, text: String) {
    val lead = Lead.desdeJson(text) ?: return       // ignora lo que no sea un lead
    principal.post { alRecibirLead(lead) }          // pasa al hilo principal
}''', "ClienteReloj.kt: 1. recibe")
codigo('''
fun desdeJson(texto: String): Lead? = runCatching {
    val raiz = JSONObject(texto)
    val tipo = raiz.getString("tipo")
    if (tipo != TIPO_COTIZACION && tipo != TIPO_COMPRA) return null
    val p = raiz.getJSONObject("payload")
    Lead(notificacionId = p.getInt("notificacionId"), tipo = tipo, /* ...resto de campos... */)
}.getOrNull()''', "Lead.kt: 2. decodifica (resumido)")
codigo('''
private fun alRecibirLead(lead: Lead) {
    if (almacen.registrar(lead)) {                  // true solo si el id es nuevo
        EstadoReloj.nuevoLead(lead, almacen.historial())
        Avisos.mostrarLead(this, lead)
        Avisos.vibrar(this)
    }
    // Siempre se confirma: si el ack anterior se perdió, el servidor lo reenvió.
    cliente.enviarAck(lead.notificacionId)
}''', "RelojService.kt: 3. procesa (resumido)")
codigo('''
private val PATRON = longArrayOf(0, 200, 100, 200, 100, 400)   // espera, vibra, pausa, vibra, pausa, vibra

vibrador.vibrate(VibrationEffect.createWaveform(PATRON, -1))   // -1 = no repetir''', "Avisos.kt: 4. vibra (resumido)")
h2("Reconexión")
codigo('''
val espera = min(60_000L, 1_000L shl min(intentos, 6)) + Random.nextLong(0, 1_000)
intentos++
principal.postDelayed(tareaConectar, espera)''', "ClienteReloj.kt")
p("`1_000L shl n` duplica la espera en cada fallo, con tope de 60 s. El sumando aleatorio evita que muchos relojes reconecten al mismo tiempo. Cuando vuelve la red, `reconectarYa()` conecta sin esperar.")
h2("Permisos importantes")
tabla(["Permiso", "Por qué"], [
    ["`FOREGROUND_SERVICE_REMOTE_MESSAGING`", "Servicio en primer plano. Android 14 exige declarar su tipo."],
    ["`USE_FULL_SCREEN_INTENT`", "Enciende la pantalla con la tarjeta. Sin él, la pantalla no se encendía."],
    ["`POST_NOTIFICATIONS`", "Mostrar notificaciones desde Android 13."],
    ["`<queries>` para https", "Saber si alguna app del reloj abre enlaces wa.me (Android 11+)."],
], [3.0, 4.3])

h1("Pantallas y conexión con el backend")
p("Las pantallas no hablan directo con el servidor: leen el estado que el servicio publica en `EstadoReloj`.")
pantalla("01_reposo_conectado_circular.png", "06_reposo_con_historial_circular.png", "Reposo",
         "Muestra el estado del socket: `onOpen` pone CONECTADO; `onClosed` u `onFailure` ponen DESCONECTADO e inician la reconexión. El botón Historial aparece cuando ya hay leads guardados. \"Sin leads nuevos\" es un texto fijo en esta versión.")
pantalla("02_tarjeta_nueva_cotizacion_circular.png", "12_cotizacion_desde_produccion_circular.png", "Tarjeta de cotización",
         "Es el resultado del recorrido de la sección 2. La izquierda usó el servidor local; la derecha es una cotización real desde la página en Render.")
pantalla("03_acciones_circular.png", "04_accion_llamar_marcador_circular.png", "Acciones y Llamar",
         "Ya no usa el servidor: toma el teléfono del payload. Llamar abre el marcador con `ACTION_DIAL`, sin marcar. Sin teléfono, los botones salen deshabilitados. Estas acciones aún no se reportan al servidor.")
pantalla("05_accion_whatsapp_aviso_circular.png", "07_historial_circular.png", "WhatsApp e historial",
         "WhatsApp abre wa.me en el teléfono emparejado con `RemoteActivityHelper`; el emulador no tiene teléfono y muestra un aviso. El historial guarda 20 leads en el reloj y funciona sin conexión.")
pantalla("08_sin_conexion_circular.png", "09_pendiente_entregado_circular.png", "Sin conexión y pendientes",
         "`NetworkCallback` detecta la falta de red. La cotización queda con `entregadaEn` vacío. Al volver la red, el servidor la reenvía y la tarjeta conserva su hora original.")
pantalla("10_prueba_admin_nueva_compra_circular.png", "11_aviso_con_pantalla_apagada_circular.png", "Prueba y pantalla apagada",
         "`POST /api/dev/notificacion-prueba` genera la tarjeta de nueva compra. A la derecha, el servicio recibe con la pantalla apagada y el full-screen intent la enciende.")
story.append(Spacer(1, 8))
h2("Mockup de la notificación básica")
imagen(os.path.join(AQUI, "mockup_notificacion_basica.png"), 5.6 * inch, 5.6 * inch * 760 / 1500,
       "Primera versión de la alerta: solo aviso y vibración. El nombre es ficticio.")

h1("Paso a paso para correrlo")
nota("Antes de empezar", "Con 8 GB de RAM, compila con el emulador cerrado. Con los dos abiertos, la memoria se agota y Gradle se queda colgado. Los comandos son para PowerShell.")
h2("A. Servidor local")
codigo('''
cd asidesimple-ai\\server
npm install
npx prisma db push                    # crea las tablas en la base de DATABASE_URL
node prisma/seed.js                   # catálogo, clientes y administrador
$env:DEVICE_TOKEN = "tu-token"        # el mismo que usará el reloj
npm run dev                           # http://localhost:3001''')
p("Para generar un token: `node -e \"console.log(require('crypto').randomBytes(24).toString('hex'))\"`")
h2("B. App en el emulador")
lista(["Copia `watch-app/local.properties.example` como `local.properties` y llena `sdk.dir` y `reloj.deviceToken`.",
       "En el emulador, `10.0.2.2` es el localhost de tu PC; por eso el sabor `local` apunta ahí."], numerada=True)
codigo('''
cd asidesimple-ai\\watch-app
.\\gradlew.bat assembleLocalDebug assembleProdDebug
.\\gradlew.bat --stop                  # libera memoria

$sdk = "$env:LOCALAPPDATA\\Android\\Sdk"
& "$sdk\\emulator\\emulator.exe" -avd Wear_OS_Small_Round_Ligero -no-snapshot-save -no-audio
& "$sdk\\platform-tools\\adb.exe" install -r app\\build\\outputs\\apk\\local\\debug\\app-local-debug.apk
& "$sdk\\platform-tools\\adb.exe" shell am start -n ai.asidesimple.reloj.local/ai.asidesimple.reloj.MainActivity''')
h2("C. Comprobar que funciona")
codigo('''
curl.exe localhost:3001/api/salud            # debe decir "relojesConectados":1
adb logcat -s RelojLeads                     # eventos del reloj en vivo''')
p("Después registra una cuenta en la página local y pide una cotización. En logcat verás `Lead recibido`, `Vibración` y `Ack enviado`.")
h2("D. Conectar a producción")
lista(["En Render, servicio `proyecto-web-ai`, Environment: define `DEVICE_TOKEN` con el mismo valor (ya está configurado).",
       "En `local.properties` deja `reloj.wsUrl.prod=wss://proyecto-web-ai.onrender.com/ws/reloj`.",
       "Instala `app-prod-debug.apk`. Su paquete es `ai.asidesimple.reloj`, sin `.local`."], numerada=True)
h2("E. Reloj real (Galaxy Watch 6 Classic)")
lista(["En el reloj: Ajustes, Acerca del reloj, Software, y toca 5 veces \"Versión de software\".",
       "En Opciones de desarrollador activa Depuración ADB y Depuración inalámbrica. Reloj y PC deben estar en el mismo Wi-Fi.",
       "En Depuración inalámbrica, elige Vincular nuevo dispositivo y usa la IP, el puerto y el código que muestra."], numerada=True)
codigo('''
adb pair 192.168.1.50:37123        # puerto de vinculación y código de 6 dígitos
adb connect 192.168.1.50:41234     # otro puerto: el de la pantalla principal
adb install -r app-prod-debug.apk''')
p("Las direcciones son de ejemplo. Este paso todavía no se ha probado en el reloj físico.")
h2("F. Pruebas automatizadas del servidor")
codigo('''
cd asidesimple-ai\\server
$env:TEST_DATABASE_URL = "postgresql://postgres@localhost:5433/asidesimple_test?schema=public"
npm test                                     # usa una base de pruebas, nunca la de producción''')

h1("Pruebas y resultados")
h2("Pruebas automatizadas del servidor: 7 de 7")
p("Cubren salud del servicio, rechazo sin token, cotización válida con ack, cotización inválida, duplicado, pendientes y permisos del endpoint de prueba. También corren en GitHub Actions, que además compila los APK.")
h2("Bitácora de recepción: 10 de 10")
p("El 4 de noviembre de 2026 se enviaron 10 cotizaciones reales, una cada 10 segundos, con el servidor en la PC, la app en el emulador y red normal. Las horas están en UTC.")
bat = json.load(open(BITACORA, encoding="utf-8"))
filas = [[str(r["intento"]), r["disparo"][11:19], r["servicio"], str(r["http"]), str(r["msVib"]), str(r["msDisparoAck"])] for r in bat]
tabla(["Intento", "Hora (UTC)", "Servicio", "HTTP", "Recepción a vibración (ms)", "Disparo a ack (ms)"], filas, [0.7, 1.0, 2.0, 0.6, 1.6, 1.4])
med_ack = statistics.median(r["msDisparoAck"] for r in bat)
med_vib = statistics.median(r["msVib"] for r in bat)
lista([f"Mediana de disparo a ack guardado: **{med_ack:.0f} ms** (mínimo {min(r['msDisparoAck'] for r in bat)}, máximo {max(r['msDisparoAck'] for r in bat)}).",
       f"Mediana de recepción a vibración: **{med_vib:.0f} ms**.",
       "Android registró 10 veces el patrón 0, 200, 100, 200, 100, 400.",
       "El reloj del emulador iba cerca de 1 s atrás de la PC, por eso cada tiempo se midió con un solo reloj.",
       "El emulador no tiene motor físico: se comprobó que Android recibió el patrón, no la sensación en la muñeca."])
h2("Escenarios adicionales")
tabla(["Escenario", "Resultado"], [
    ["Servidor publicado", "Cotización desde la página en Render: llegó la tarjeta, vibró y el reloj envió el ack."],
    ["Modo avión", "Quedó pendiente y se entregó una sola vez al reconectar, con su hora original."],
    ["Ack perdido", "El servidor la reenvió; el reloj no volvió a avisar y mandó el ack."],
    ["Pantalla apagada", "El primer intento recibió y vibró, pero no encendió la pantalla. Se corrigió y pasó de Dozing a Awake."],
    ["Notificación de prueba", "Llegó la tarjeta de nueva compra, vibró y mandó el ack."],
], [2.0, 5.3])
h2("Cobertura de caja negra (Práctica 7)")
p("Se ejecutaron 89 casos sobre una copia local: 77 pasaron y 12 revelaron 11 defectos. El dictamen fue aceptar con condiciones.")
tabla(["Área", "Pasan / casos", "Qué falta"], [
    ["Registro e inicio de sesión", "12 / 14", "DEF-01 y DEF-02: correo sin formato y nombre de solo espacios."],
    ["Catálogo público", "4 / 4", "Nada pendiente."],
    ["Cotización", "11 / 11", "La página no captura teléfono."],
    ["Aviso al smartwatch", "2 / 2", "Reloj físico."],
    ["Gestión de catálogo y clientes", "13 / 15", "DEF-04 y DEF-06: responden 500."],
    ["Roles, permisos y sesión", "27 / 27", "Nada pendiente."],
    ["Estadísticas", "2 / 2", "Nada pendiente."],
    ["Navegación y teléfono", "2 / 3", "DEF-11: la búsqueda del menú no hace nada."],
    ["Manejo de errores", "4 / 11", "DEF-03, 05, 07, 08, 09 y 10."],
], [2.8, 1.1, 3.4])
nota("Defecto más importante", "DEF-09, severidad alta: el botón Eliminar borra el producto y sus cotizaciones sin pedir confirmación. Los 11 defectos siguen abiertos.", aviso=True)

h1("Problemas encontrados y lecciones")
tabla(["Problema", "Causa", "Solución"], [
    ["La app se cerraba al tocar WhatsApp", "En Wear, los enlaces https los toma un redirector del sistema que exige un permiso privado.", "Usar `RemoteActivityHelper` y atrapar cualquier excepción."],
    ["\"Sin conexión\" no aparecía", "`onLost` consultaba `activeNetwork`, que aún devolvía la red perdida.", "Con la red por defecto, `onLost` ya significa sin red."],
    ["La pantalla no se encendía", "Faltaba `USE_FULL_SCREEN_INTENT`.", "Declarar el permiso."],
    ["Gradle se colgaba", "Emulador y Gradle agotaron los 8 GB de RAM.", "Cerrar el emulador para compilar."],
    ["Acentos corruptos con curl", "Git Bash mandaba Latin-1.", "Enviar el cuerpo desde un archivo UTF-8."],
    ["El CI fallaba en `prisma generate`", "`prisma.config.ts` exige `DATABASE_URL`.", "Definirla para todo el job."],
    ["El reloj recibía 401 en producción", "Faltaba `DEVICE_TOKEN` en Render.", "Agregar la variable."],
    ["Tiempos negativos en la bitácora", "Los relojes del emulador y de la PC no coinciden.", "Medir cada tiempo con un solo reloj."],
    ["La página daba 500 en productos", "Render borró la base Postgres gratuita al caducar.", "Crear otra base y actualizar `DATABASE_URL`."],
], [2.2, 2.8, 2.3])

h1("Pendientes para el Tercer Parcial")
nota("Fecha límite: 21 de noviembre de 2026", "Ese día caduca la base de datos gratuita de Render. Hay que migrarla antes o la página volverá a fallar.", aviso=True)
lista([
    "**Probar en el Galaxy Watch real:** vibración física, permisos y ruta por Bluetooth.",
    "**Medir contra Render:** la batería de 10 intentos fue local.",
    "**Teléfono en el formulario:** hoy llega null y Llamar y WhatsApp salen deshabilitados.",
    "**Registrar el contacto:** las acciones del vendedor no se reportan al servidor.",
    "**Corregir defectos:** primero DEF-09. Los scripts de la Práctica 7 no están en el repositorio.",
    "**Ruta de compra:** el protocolo la soporta, pero el servidor no la tiene.",
    "**Disponibilidad:** el servicio gratuito de Render se suspende por inactividad.",
])

h1("Preguntas de repaso")
for q, a in [
    ("¿Por qué el servidor responde 201 antes de avisar al reloj?", "Para que la página no dependa del reloj. Si emitir falla o tarda, el cliente ya tiene su respuesta."),
    ("¿Qué campo une el aviso con su confirmación?", "`notificacionId`, que es `notificaciones.id`."),
    ("¿Cómo sabe el servidor qué reenviar?", "Busca las notificaciones con `entregadaEn` vacío."),
    ("Si llega dos veces la misma notificación, ¿vibra dos veces?", "No. `Almacen.registrar` devuelve false para ids ya vistos, pero el reloj igual manda el ack."),
    ("¿Por qué el ack se puede repetir sin problema?", "El update filtra `entregadaEn: null`: el segundo ack no encuentra filas y no cambia la hora."),
    ("¿Para qué sirve el ping cada 25 s?", "Mantiene viva la conexión ante proxies y detecta relojes caídos."),
    ("¿Por qué un servicio en primer plano?", "La Activity muere al salir de la app; el servicio sigue recibiendo con la pantalla apagada."),
    ("¿Dónde vive DEVICE_TOKEN?", "En Render o `.env` para el servidor, en `local.properties` para el reloj y en GitHub Secrets para el CI. Nunca en git."),
    ("¿Qué es 10.0.2.2?", "El localhost de la PC visto desde el emulador."),
    ("¿Por qué no hay app companion?", "El reloj se conecta directo al servidor. El teléfono solo presta internet cuando el reloj no tiene red propia."),
    ("¿Qué significa que la bitácora se hizo en emulador?", "Se comprobó que Android recibió el patrón de vibración, no que alguien la sintiera."),
]:
    story.append(KeepTogether([Paragraph("<b>P.</b> " + md(q), st["p"]),
                               Paragraph('<font color="#4E7000"><b>R.</b></font> ' + md(a), st["li"]), Spacer(1, 3)]))

# ============================== PORTADA E ÍNDICE ==============================
portada = [
    Spacer(1, 1.15 * inch),
    Table([[""]], colWidths=[1.2 * inch], rowHeights=[6], style=[("BACKGROUND", (0, 0), (-1, -1), VERDE)]),
    Spacer(1, 14),
    Paragraph("Guía del Segundo Parcial", st["titulo"]),
    Spacer(1, 6),
    Paragraph("Notificaciones en tiempo real al smartwatch · AsíDeSimple AI", st["sub"]),
    Spacer(1, 4),
    Paragraph("Jovanny Guadalupe López Cebreros · Desarrollo para Dispositivos Inteligentes · IDGS17", st["sub"]),
    Spacer(1, 22),
]
a = 1.65 * inch
fila = [[Image(os.path.join(CIRC, n), width=a, height=a, mask="auto") for n in
         ("01_reposo_conectado_circular.png", "12_cotizacion_desde_produccion_circular.png",
          "03_acciones_circular.png", "08_sin_conexion_circular.png")]]
tp = Table(fila, colWidths=[ANCHO / 4] * 4)
tp.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "CENTER")]))
portada += [tp, Spacer(1, 24), Paragraph("Contenido", st["h2"])]
portada += [Paragraph(f"{i}. {escape(s)}", st["li"]) for i, s in enumerate(secciones, 1)]
portada.append(PageBreak())


def decorar(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        canvas.setFont("Arial", 7.5)
        canvas.setFillColor(GRIS)
        canvas.drawString(0.6 * inch, 0.45 * inch, "Guía del Segundo Parcial · Notificaciones al smartwatch")
        canvas.drawRightString(letter[0] - 0.6 * inch, 0.45 * inch, f"Página {doc.page}")
        canvas.setStrokeColor(BORDE)
        canvas.line(0.6 * inch, 0.6 * inch, letter[0] - 0.6 * inch, 0.6 * inch)
    canvas.restoreState()


doc = BaseDocTemplate(SALIDA, pagesize=letter, leftMargin=0.6 * inch, rightMargin=0.6 * inch, topMargin=0.6 * inch,
                      bottomMargin=0.75 * inch, title="Guía del Segundo Parcial - Notificaciones al smartwatch",
                      author="Jovanny Guadalupe López Cebreros")
doc.addPageTemplates([PageTemplate(id="todas", frames=[Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="n")], onPage=decorar)])
doc.build(portada + story)
print("OK", SALIDA)
