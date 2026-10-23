package ai.asidesimple.reloj

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

/** Canales, notificación persistente del servicio, aviso de lead y vibración. */
object Avisos {
    private const val CANAL_SERVICIO = "canal_en_vivo"
    private const val CANAL_LEADS = "leads"
    const val ID_SERVICIO = 1
    const val EXTRA_NOTIFICACION_ID = "notificacionId"

    /** Corto, corto, largo: 200 ms, pausa 100, 200 ms, pausa 100, 400 ms. */
    private val PATRON = longArrayOf(0, 200, 100, 200, 100, 400)

    fun crearCanales(context: Context) {
        val gestor = context.getSystemService(NotificationManager::class.java)
        gestor.createNotificationChannel(
            NotificationChannel(CANAL_SERVICIO, "Canal en vivo", NotificationManager.IMPORTANCE_LOW).apply {
                description = "Mantiene la conexión con el servidor"
                setShowBadge(false)
            }
        )
        gestor.createNotificationChannel(
            NotificationChannel(CANAL_LEADS, "Leads nuevos", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "Cotizaciones y compras desde la página"
                // La vibración se hace a mano (vibrar()) para garantizar el patrón exacto.
                enableVibration(false)
            }
        )
    }

    fun notificacionServicio(context: Context, texto: String): Notification =
        NotificationCompat.Builder(context, CANAL_SERVICIO)
            .setSmallIcon(R.drawable.ic_notificacion)
            .setContentTitle("Leads AsíDeSimple")
            .setContentText(texto)
            .setOngoing(true)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setContentIntent(abrirApp(context, null))
            .build()

    fun actualizarServicio(context: Context, texto: String) {
        if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) return
        context.getSystemService(NotificationManager::class.java)
            .notify(ID_SERVICIO, notificacionServicio(context, texto))
    }

    fun mostrarLead(context: Context, lead: Lead) {
        val toque = abrirApp(context, lead.notificacionId)
        val notificacion = NotificationCompat.Builder(context, CANAL_LEADS)
            .setSmallIcon(R.drawable.ic_notificacion)
            .setContentTitle("${lead.etiqueta}: ${lead.nombre}")
            .setContentText(lead.servicio)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
            .setAutoCancel(true)
            .setContentIntent(toque)
            .setFullScreenIntent(toque, true) // en Wear abre la tarjeta sobre la esfera
            .build()
        if (NotificationManagerCompat.from(context).areNotificationsEnabled()) {
            context.getSystemService(NotificationManager::class.java)
                .notify(ID_SERVICIO + lead.notificacionId, notificacion)
        } else {
            Log.w(ClienteReloj.TAG, "Notificaciones deshabilitadas: solo vibración y tarjeta en pantalla")
        }
    }

    fun vibrar(context: Context) {
        val vibrador = context.getSystemService(VibratorManager::class.java)?.defaultVibrator
            ?: @Suppress("DEPRECATION") context.getSystemService(Vibrator::class.java)
        if (vibrador == null || !vibrador.hasVibrator()) {
            Log.w(ClienteReloj.TAG, "Este dispositivo no tiene vibrador")
            return
        }
        vibrador.vibrate(VibrationEffect.createWaveform(PATRON, -1))
        Log.i(ClienteReloj.TAG, "Vibración: patrón ${PATRON.joinToString()}")
    }

    private fun abrirApp(context: Context, notificacionId: Int?): PendingIntent {
        val intent = Intent(context, MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        if (notificacionId != null) intent.putExtra(EXTRA_NOTIFICACION_ID, notificacionId)
        return PendingIntent.getActivity(
            context,
            notificacionId ?: 0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }
}
