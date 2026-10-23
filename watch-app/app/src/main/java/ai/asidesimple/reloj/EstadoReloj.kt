package ai.asidesimple.reloj

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class EstadoCanal { CONECTANDO, CONECTADO, DESCONECTADO, SIN_CONFIG }

/** Estado compartido entre el servicio (que lo escribe) y la interfaz (que lo observa). */
object EstadoReloj {
    private val _canal = MutableStateFlow(EstadoCanal.DESCONECTADO)
    val canal: StateFlow<EstadoCanal> = _canal.asStateFlow()

    private val _hayRed = MutableStateFlow(true)
    val hayRed: StateFlow<Boolean> = _hayRed.asStateFlow()

    private val _historial = MutableStateFlow<List<Lead>>(emptyList())
    val historial: StateFlow<List<Lead>> = _historial.asStateFlow()

    /** Lead que la interfaz debe mostrar como tarjeta (null = reposo). */
    private val _leadActivo = MutableStateFlow<Lead?>(null)
    val leadActivo: StateFlow<Lead?> = _leadActivo.asStateFlow()

    fun cambiarCanal(estado: EstadoCanal) { _canal.value = estado }
    fun cambiarRed(hay: Boolean) { _hayRed.value = hay }
    fun cargarHistorial(leads: List<Lead>) { _historial.value = leads }

    fun nuevoLead(lead: Lead, historial: List<Lead>) {
        _historial.value = historial
        _leadActivo.value = lead
    }

    fun mostrar(lead: Lead?) { _leadActivo.value = lead }
}
