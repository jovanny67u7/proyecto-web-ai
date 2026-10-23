package ai.asidesimple.reloj

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.wear.remote.interactions.RemoteActivityHelper

/** Botones de la pantalla de acciones: marcador y WhatsApp. */
object Acciones {
    fun llamar(context: Context, lead: Lead) {
        val telefono = lead.telefono ?: return avisar(context, "Este lead no tiene teléfono")
        Log.i(ClienteReloj.TAG, "Acción Llamar: ACTION_DIAL tel:$telefono")
        val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$telefono"))
        if (!abrirLocal(context, intent)) avisar(context, "Marcar $telefono\n(sin marcador en este reloj)")
    }

    /**
     * Primero intenta una app del reloj que abra wa.me (p. ej. WhatsApp para
     * Wear OS); si no hay, abre el enlace en el teléfono emparejado con
     * RemoteActivityHelper. En el emulador sin teléfono solo muestra el aviso.
     */
    fun whatsapp(context: Context, lead: Lead) {
        val telefono = lead.telefono ?: return avisar(context, "Este lead no tiene teléfono")
        val mensaje = "Hola ${lead.nombre}, te escribo de AsíDeSimple AI por tu solicitud de ${lead.servicio}."
        val uri = Uri.parse("https://wa.me/${telefono.trimStart('+')}?text=${Uri.encode(mensaje)}")
        Log.i(ClienteReloj.TAG, "Acción WhatsApp: $uri")

        val intent = Intent(Intent.ACTION_VIEW, uri).addCategory(Intent.CATEGORY_BROWSABLE)
        if (hayAppLocal(context, intent) && abrirLocal(context, intent)) return

        val futuro = RemoteActivityHelper(context).startRemoteActivity(intent)
        futuro.addListener({
            try {
                futuro.get()
                Log.i(ClienteReloj.TAG, "WhatsApp abierto en el teléfono")
                avisar(context, "Abierto en tu teléfono")
            } catch (e: Exception) {
                Log.w(ClienteReloj.TAG, "No se pudo abrir en el teléfono: ${e.cause?.message ?: e.message}")
                avisar(context, "WhatsApp a $telefono\n(sin teléfono emparejado)")
            }
        }, ContextCompat.getMainExecutor(context))
    }

    // En Wear, wa.me lo "resuelve" el redirector del sistema hacia el teléfono,
    // que exige un permiso privado: hay que ignorarlo y usar RemoteActivityHelper.
    private fun hayAppLocal(context: Context, intent: Intent): Boolean =
        context.packageManager.queryIntentActivities(intent, 0)
            .any { it.activityInfo.packageName != "com.google.android.wearable.app" }

    private fun abrirLocal(context: Context, intent: Intent): Boolean = try {
        context.startActivity(Intent(intent).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        true
    } catch (e: Exception) { // ActivityNotFoundException, SecurityException
        Log.w(ClienteReloj.TAG, "No se pudo abrir ${intent.data}: ${e.javaClass.simpleName}")
        false
    }

    private fun avisar(context: Context, texto: String) {
        Toast.makeText(context, texto, Toast.LENGTH_LONG).show()
    }
}
