package ai.asidesimple.reloj

import org.json.JSONObject
import java.time.Instant

/** Un aviso recibido del servidor: {"tipo":..,"payload":{..}}. */
data class Lead(
    val notificacionId: Int,
    val tipo: String,          // "nueva_cotizacion" | "nueva_compra"
    val leadId: Int?,
    val nombre: String,
    val servicio: String,
    val telefono: String?,
    val hora: Instant,
) {
    val etiqueta: String
        get() = if (tipo == TIPO_COMPRA) "Nueva compra" else "Nueva cotización"

    fun aJson(): JSONObject = JSONObject()
        .put("tipo", tipo)
        .put("payload", JSONObject()
            .put("notificacionId", notificacionId)
            .put("leadId", leadId ?: JSONObject.NULL)
            .put("nombre", nombre)
            .put("servicio", servicio)
            .put("telefono", telefono ?: JSONObject.NULL)
            .put("hora", hora.toString()))

    companion object {
        const val TIPO_COTIZACION = "nueva_cotizacion"
        const val TIPO_COMPRA = "nueva_compra"

        /** Devuelve null si el mensaje no es un lead (pong, etc.) o está mal formado. */
        fun desdeJson(texto: String): Lead? = runCatching {
            val raiz = JSONObject(texto)
            val tipo = raiz.getString("tipo")
            if (tipo != TIPO_COTIZACION && tipo != TIPO_COMPRA) return null
            val p = raiz.getJSONObject("payload")
            Lead(
                notificacionId = p.getInt("notificacionId"),
                tipo = tipo,
                leadId = if (p.isNull("leadId")) null else p.getInt("leadId"),
                nombre = p.optString("nombre").ifBlank { "Cliente" },
                servicio = p.optString("servicio").ifBlank { "Sin servicio" },
                telefono = if (p.isNull("telefono")) null else p.optString("telefono").ifBlank { null },
                hora = runCatching { Instant.parse(p.getString("hora")) }.getOrDefault(Instant.now()),
            )
        }.getOrNull()
    }
}
