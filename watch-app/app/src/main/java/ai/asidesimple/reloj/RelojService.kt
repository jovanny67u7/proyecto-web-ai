package ai.asidesimple.reloj

import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach

/**
 * Servicio en primer plano que mantiene abierto el WebSocket aunque la
 * pantalla se apague, y convierte cada lead en notificación + vibración + ack.
 */
class RelojService : Service() {
    private lateinit var cliente: ClienteReloj
    private lateinit var almacen: Almacen
    private val principal = Handler(Looper.getMainLooper())
    private val alcance = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val red by lazy { getSystemService(ConnectivityManager::class.java) }

    private val callbackRed = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            principal.post {
                Log.i(ClienteReloj.TAG, "Red disponible")
                EstadoReloj.cambiarRed(true)
                cliente.reconectarYa()
            }
        }

        override fun onLost(network: Network) {
            principal.post {
                val hay = red.activeNetwork?.let { red.getNetworkCapabilities(it) }
                    ?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true
                Log.i(ClienteReloj.TAG, "Red perdida (¿queda otra red? $hay)")
                EstadoReloj.cambiarRed(hay)
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        Avisos.crearCanales(this)
        ServiceCompat.startForeground(
            this,
            Avisos.ID_SERVICIO,
            Avisos.notificacionServicio(this, "Conectando…"),
            if (Build.VERSION.SDK_INT >= 34) ServiceInfo.FOREGROUND_SERVICE_TYPE_REMOTE_MESSAGING else 0,
        )

        almacen = Almacen(this)
        EstadoReloj.cargarHistorial(almacen.historial())
        cliente = ClienteReloj(BuildConfig.WS_URL, BuildConfig.DEVICE_TOKEN, ::alRecibirLead)
        red.registerDefaultNetworkCallback(callbackRed)
        cliente.iniciar()

        // La notificación persistente refleja el estado del canal.
        EstadoReloj.canal.combine(EstadoReloj.hayRed) { canal, hayRed -> canal to hayRed }
            .onEach { (canal, hayRed) ->
                val texto = when {
                    !hayRed -> "Sin conexión a internet"
                    canal == EstadoCanal.CONECTADO -> "Canal en vivo: CONECTADO"
                    canal == EstadoCanal.SIN_CONFIG -> "Falta configurar URL/token"
                    else -> "Canal en vivo: DESCONECTADO"
                }
                Avisos.actualizarServicio(this, texto)
            }
            .launchIn(alcance)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACCION_REINTENTAR) cliente.reconectarYa()
        return START_STICKY
    }

    private fun alRecibirLead(lead: Lead) {
        if (almacen.registrar(lead)) {
            Log.i(ClienteReloj.TAG, "Lead recibido #${lead.notificacionId}: ${lead.etiqueta} de ${lead.nombre} (${lead.servicio})")
            EstadoReloj.nuevoLead(lead, almacen.historial())
            Avisos.mostrarLead(this, lead)
            Avisos.vibrar(this)
        } else {
            Log.i(ClienteReloj.TAG, "Duplicado ignorado #${lead.notificacionId}")
        }
        // Siempre se confirma: si el ack anterior se perdió, el servidor lo reenvió.
        cliente.enviarAck(lead.notificacionId)
    }

    override fun onDestroy() {
        runCatching { red.unregisterNetworkCallback(callbackRed) }
        cliente.detener()
        alcance.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        private const val ACCION_REINTENTAR = "ai.asidesimple.reloj.REINTENTAR"

        fun iniciar(context: Context) {
            ContextCompat.startForegroundService(context, Intent(context, RelojService::class.java))
        }

        fun reintentar(context: Context) {
            ContextCompat.startForegroundService(
                context,
                Intent(context, RelojService::class.java).setAction(ACCION_REINTENTAR),
            )
        }
    }
}
