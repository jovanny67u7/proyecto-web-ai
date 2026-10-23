package ai.asidesimple.reloj

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import android.widget.Toast

/** Botones de la pantalla de acciones: marcador y WhatsApp. */
object Acciones {
    fun llamar(context: Context, lead: Lead) {
        val telefono = lead.telefono ?: return avisar(context, "Este lead no tiene teléfono")
        Log.i(ClienteReloj.TAG, "Acción Llamar: ACTION_DIAL tel:$telefono")
        abrir(context, Intent(Intent.ACTION_DIAL, Uri.parse("tel:$telefono")), "Marcar $telefono")
    }

    fun whatsapp(context: Context, lead: Lead) {
        val telefono = lead.telefono ?: return avisar(context, "Este lead no tiene teléfono")
        val mensaje = "Hola ${lead.nombre}, te escribo de AsíDeSimple AI por tu solicitud de ${lead.servicio}."
        val url = "https://wa.me/${telefono.trimStart('+')}?text=${Uri.encode(mensaje)}"
        Log.i(ClienteReloj.TAG, "Acción WhatsApp: $url")
        abrir(context, Intent(Intent.ACTION_VIEW, Uri.parse(url)), "WhatsApp a $telefono")
    }

    // El emulador de Wear OS no trae marcador ni navegador: se muestra la
    // acción en un Toast (y en logcat) en lugar de fallar.
    private fun abrir(context: Context, intent: Intent, descripcion: String) {
        try {
            context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        } catch (e: ActivityNotFoundException) {
            Log.w(ClienteReloj.TAG, "Sin app para: $descripcion")
            avisar(context, "$descripcion\n(sin app en este reloj)")
        }
    }

    private fun avisar(context: Context, texto: String) {
        Toast.makeText(context, texto, Toast.LENGTH_LONG).show()
    }
}
