package ai.asidesimple.reloj

import android.content.Context
import org.json.JSONArray

/**
 * Historial de leads y registro de notificacionId ya mostrados, en
 * SharedPreferences, para que un reenvío de pendientes no duplique avisos
 * aunque la app se haya reiniciado.
 */
class Almacen(context: Context) {
    private val prefs = context.getSharedPreferences("reloj_leads", Context.MODE_PRIVATE)

    fun historial(): List<Lead> {
        val arreglo = JSONArray(prefs.getString(CLAVE_HISTORIAL, "[]"))
        return (0 until arreglo.length()).mapNotNull { Lead.desdeJson(arreglo.getString(it)) }
    }

    /** Guarda el lead si es nuevo. Devuelve false si ya se había mostrado. */
    @Synchronized
    fun registrar(lead: Lead): Boolean {
        val vistos = prefs.getString(CLAVE_VISTOS, "")!!.split(',').filter { it.isNotBlank() }
        if (lead.notificacionId.toString() in vistos) return false

        val nuevosVistos = (vistos + lead.notificacionId.toString()).takeLast(MAX_VISTOS)
        val nuevoHistorial = (listOf(lead) + historial()).take(MAX_HISTORIAL)
        val arreglo = JSONArray().apply { nuevoHistorial.forEach { put(it.aJson().toString()) } }
        prefs.edit()
            .putString(CLAVE_VISTOS, nuevosVistos.joinToString(","))
            .putString(CLAVE_HISTORIAL, arreglo.toString())
            .apply()
        return true
    }

    private companion object {
        const val CLAVE_HISTORIAL = "historial"
        const val CLAVE_VISTOS = "vistos"
        const val MAX_HISTORIAL = 20
        const val MAX_VISTOS = 200
    }
}
