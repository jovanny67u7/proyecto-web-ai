package ai.asidesimple.reloj

import android.os.Handler
import android.os.Looper
import android.util.Log
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONObject
import java.util.concurrent.TimeUnit
import kotlin.math.min
import kotlin.random.Random

/**
 * WebSocket hacia /ws/reloj con reconexión automática (backoff exponencial
 * 1 s, 2 s, 4 s… hasta 60 s, con jitter). El estado se maneja en el hilo
 * principal; OkHttp solo entrega los eventos.
 */
class ClienteReloj(
    private val url: String,
    private val token: String,
    private val alRecibirLead: (Lead) -> Unit,
) {
    private val http = OkHttpClient.Builder()
        .pingInterval(20, TimeUnit.SECONDS) // además del ping de 25 s del servidor
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .build()
    private val principal = Handler(Looper.getMainLooper())
    private val tareaConectar = Runnable { conectar() }

    private var socket: WebSocket? = null
    private var intentos = 0
    private var activo = false

    fun iniciar() {
        activo = true
        conectar()
    }

    fun detener() {
        activo = false
        principal.removeCallbacks(tareaConectar)
        socket?.close(1000, "detenido")
        socket = null
        EstadoReloj.cambiarCanal(EstadoCanal.DESCONECTADO)
    }

    /** Volvió la red o se tocó Reintentar: no esperar al backoff. */
    fun reconectarYa() {
        if (!activo) return
        principal.removeCallbacks(tareaConectar)
        intentos = 0
        if (socket == null) conectar()
    }

    fun enviarAck(notificacionId: Int): Boolean {
        val enviado = socket?.send(
            JSONObject().put("tipo", "ack").put("notificacionId", notificacionId).toString()
        ) ?: false
        Log.i(TAG, if (enviado) "Ack enviado #$notificacionId" else "Ack no enviado #$notificacionId (sin socket)")
        return enviado
    }

    private fun conectar() {
        if (!activo || socket != null) return
        if (url.isBlank() || token.isBlank()) {
            Log.e(TAG, "Falta reloj.wsUrl o reloj.deviceToken en local.properties")
            EstadoReloj.cambiarCanal(EstadoCanal.SIN_CONFIG)
            return
        }
        EstadoReloj.cambiarCanal(EstadoCanal.CONECTANDO)
        Log.i(TAG, "Conectando a $url (intento ${intentos + 1})")
        val peticion = Request.Builder().url(url).header("Authorization", "Bearer $token").build()
        socket = http.newWebSocket(peticion, oyente)
    }

    private val oyente = object : WebSocketListener() {
        override fun onOpen(webSocket: WebSocket, response: Response) {
            principal.post {
                if (socket !== webSocket) return@post
                intentos = 0
                EstadoReloj.cambiarCanal(EstadoCanal.CONECTADO)
                Log.i(TAG, "Canal en vivo: CONECTADO")
            }
        }

        override fun onMessage(webSocket: WebSocket, text: String) {
            val lead = Lead.desdeJson(text) ?: return
            principal.post { alRecibirLead(lead) }
        }

        override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
            webSocket.close(1000, null)
        }

        override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
            alCaer(webSocket, "cerrado ($code)")
        }

        override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
            alCaer(webSocket, response?.let { "HTTP ${it.code}" } ?: "${t.javaClass.simpleName}: ${t.message}")
        }
    }

    private fun alCaer(webSocket: WebSocket, motivo: String) {
        principal.post {
            if (socket !== webSocket) return@post
            socket = null
            EstadoReloj.cambiarCanal(EstadoCanal.DESCONECTADO)
            if (!activo) return@post
            val espera = min(60_000L, 1_000L shl min(intentos, 6)) + Random.nextLong(0, 1_000)
            intentos++
            Log.w(TAG, "Canal en vivo: DESCONECTADO ($motivo). Reintento en ${espera / 1000} s")
            principal.postDelayed(tareaConectar, espera)
        }
    }

    companion object {
        const val TAG = "RelojLeads"
    }
}
