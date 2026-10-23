package ai.asidesimple.reloj

import ai.asidesimple.reloj.ui.PantallaAcciones
import ai.asidesimple.reloj.ui.PantallaHistorial
import ai.asidesimple.reloj.ui.PantallaReposo
import ai.asidesimple.reloj.ui.PantallaSinConexion
import ai.asidesimple.reloj.ui.PantallaTarjeta
import ai.asidesimple.reloj.ui.TemaReloj
import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat

enum class Pantalla { REPOSO, TARJETA, ACCIONES, HISTORIAL }

class MainActivity : ComponentActivity() {
    private val pedirPermiso = registerForActivityResult(ActivityResultContracts.RequestPermission()) { ok ->
        Log.i(ClienteReloj.TAG, "Permiso de notificaciones: $ok")
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Build.VERSION.SDK_INT >= 33 &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            pedirPermiso.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
        RelojService.iniciar(this)
        abrirDesdeNotificacion(intent)
        setContent { TemaReloj { AppReloj() } }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        abrirDesdeNotificacion(intent)
    }

    /** Al tocar el aviso del sistema, se abre directo la tarjeta de ese lead. */
    private fun abrirDesdeNotificacion(intent: Intent?) {
        val id = intent?.getIntExtra(Avisos.EXTRA_NOTIFICACION_ID, -1) ?: -1
        if (id <= 0) return
        val lead = EstadoReloj.historial.value.find { it.notificacionId == id }
            ?: Almacen(this).historial().find { it.notificacionId == id }
        if (lead != null) EstadoReloj.mostrar(lead)
    }
}

@Composable
fun AppReloj() {
    val contexto = LocalContext.current
    val canal by EstadoReloj.canal.collectAsState()
    val hayRed by EstadoReloj.hayRed.collectAsState()
    val historial by EstadoReloj.historial.collectAsState()
    val leadActivo by EstadoReloj.leadActivo.collectAsState()
    var pantalla by remember { mutableStateOf(Pantalla.REPOSO) }

    // Un lead nuevo (o elegido del historial) abre su tarjeta; null vuelve a reposo.
    LaunchedEffect(leadActivo) {
        pantalla = if (leadActivo != null) Pantalla.TARJETA else Pantalla.REPOSO
    }

    BackHandler(enabled = pantalla != Pantalla.REPOSO) {
        when (pantalla) {
            Pantalla.ACCIONES -> pantalla = Pantalla.TARJETA
            Pantalla.TARJETA -> EstadoReloj.mostrar(null)
            else -> pantalla = Pantalla.REPOSO
        }
    }

    val lead = leadActivo
    when {
        pantalla == Pantalla.TARJETA && lead != null ->
            PantallaTarjeta(lead) { pantalla = Pantalla.ACCIONES }

        pantalla == Pantalla.ACCIONES && lead != null ->
            PantallaAcciones(
                lead,
                alLlamar = { Acciones.llamar(contexto, lead) },
                alWhatsapp = { Acciones.whatsapp(contexto, lead) },
                alDescartar = { EstadoReloj.mostrar(null) },
            )

        pantalla == Pantalla.HISTORIAL ->
            PantallaHistorial(historial) { EstadoReloj.mostrar(it) }

        !hayRed ->
            PantallaSinConexion { RelojService.reintentar(contexto) }

        else ->
            PantallaReposo(canal, historial) { pantalla = Pantalla.HISTORIAL }
    }
}
