package ai.asidesimple.reloj.ui

import ai.asidesimple.reloj.EstadoCanal
import ai.asidesimple.reloj.Lead
import ai.asidesimple.reloj.R
import androidx.annotation.DrawableRes
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.Image
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.material3.Text
import kotlinx.coroutines.delay
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

/** Mínimo 64 dp: ~128 px en el emulador y ~140 px en el Galaxy Watch 6 (≥ 92 px). */
private val TAMANO_BOTON = 64.dp

private val formatoHora = DateTimeFormatter.ofPattern("HH:mm").withZone(ZoneId.systemDefault())
private val formatoFecha = DateTimeFormatter.ofPattern("EEE d MMM", Locale.forLanguageTag("es-MX")).withZone(ZoneId.systemDefault())

fun horaCorta(instante: Instant): String = formatoHora.format(instante)

/** Contenedor redondo: fondo Pantone Black C y márgenes que respetan el círculo. */
@Composable
private fun Redondo(
    modifier: Modifier = Modifier,
    contenido: @Composable () -> Unit,
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Negro)
            .padding(horizontal = 22.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center,
    ) { contenido() }
}

// -------------------- REPOSO --------------------

@Composable
fun PantallaReposo(canal: EstadoCanal, historial: List<Lead>, alVerHistorial: () -> Unit) {
    var ahora by remember { mutableStateOf(Instant.now()) }
    LaunchedEffect(Unit) {
        while (true) { ahora = Instant.now(); delay(1_000) }
    }
    val (colorEstado, textoEstado) = when (canal) {
        EstadoCanal.CONECTADO -> Verde to "CONECTADO"
        EstadoCanal.CONECTANDO -> Color(0xFFE0B000) to "CONECTANDO…"
        EstadoCanal.SIN_CONFIG -> Rojo to "SIN CONFIGURAR"
        EstadoCanal.DESCONECTADO -> Rojo to "DESCONECTADO"
    }

    Redondo {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(horaCorta(ahora), color = Blanco, fontSize = 38.sp, fontWeight = FontWeight.Light)
            Text(formatoFecha.format(ahora), color = Gris, fontSize = 11.sp)
            Spacer(Modifier.height(6.dp))
            // Dos líneas fijas para que "DESCONECTADO" no desplace el resto.
            Text("Canal en vivo", color = Gris, fontSize = 10.sp)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(8.dp).clip(CircleShape).background(colorEstado))
                Spacer(Modifier.width(5.dp))
                Text(textoEstado, color = Blanco, fontSize = 12.sp, fontWeight = FontWeight.Bold, maxLines = 1)
            }
            Spacer(Modifier.height(4.dp))
            Text("Sin leads nuevos", color = Gris, fontSize = 12.sp)
            if (historial.isNotEmpty()) {
                Spacer(Modifier.height(6.dp))
                Text(
                    "Historial (${historial.size})",
                    color = Verde,
                    fontSize = 12.sp,
                    modifier = Modifier
                        .clip(RoundedCornerShape(50))
                        .background(GrisOscuro)
                        .clickable(role = Role.Button, onClick = alVerHistorial)
                        .padding(horizontal = 14.dp, vertical = 6.dp),
                )
            }
        }
    }
}

// -------------------- TARJETA DE NOTIFICACIÓN --------------------

@Composable
fun PantallaTarjeta(lead: Lead, alTocar: () -> Unit) {
    Redondo(Modifier.clickable(role = Role.Button, onClick = alTocar)) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                lead.etiqueta.uppercase(),
                color = Negro,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .clip(RoundedCornerShape(50))
                    .background(Verde)
                    .padding(horizontal = 10.dp, vertical = 3.dp),
            )
            Spacer(Modifier.height(8.dp))
            Text(
                lead.nombre,
                color = Blanco,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                lead.servicio,
                color = Blanco.copy(alpha = 0.85f),
                fontSize = 14.sp,
                textAlign = TextAlign.Center,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Spacer(Modifier.height(4.dp))
            Text(horaCorta(lead.hora), color = Gris, fontSize = 12.sp)
            Spacer(Modifier.height(8.dp))
            Text("Toca para responder", color = Verde, fontSize = 12.sp)
        }
    }
}

// -------------------- ACCIONES --------------------

@Composable
fun PantallaAcciones(lead: Lead, alLlamar: () -> Unit, alWhatsapp: () -> Unit, alDescartar: () -> Unit) {
    Redondo {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(lead.nombre, color = Gris, fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                BotonCircular("Llamar", R.drawable.ic_llamar, Verde, Negro, habilitado = lead.telefono != null, alTocar = alLlamar)
                BotonCircular("WhatsApp", R.drawable.ic_whatsapp, Verde, Negro, habilitado = lead.telefono != null, alTocar = alWhatsapp)
            }
            BotonCircular("Ahora no", R.drawable.ic_cerrar, GrisOscuro, Blanco, alTocar = alDescartar)
        }
    }
}

@Composable
fun BotonCircular(
    etiqueta: String,
    @DrawableRes icono: Int,
    fondo: Color,
    frente: Color,
    habilitado: Boolean = true,
    alTocar: () -> Unit,
) {
    Column(
        modifier = Modifier
            .size(TAMANO_BOTON)
            .clip(CircleShape)
            .background(if (habilitado) fondo else GrisOscuro)
            .clickable(enabled = habilitado, role = Role.Button, onClick = alTocar),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        val color = if (habilitado) frente else Gris
        Image(
            painter = painterResource(icono),
            contentDescription = null,
            colorFilter = ColorFilter.tint(color),
            modifier = Modifier.size(24.dp),
        )
        Text(etiqueta, color = color, fontSize = 10.sp, fontWeight = FontWeight.Medium)
    }
}

// -------------------- HISTORIAL --------------------

@Composable
fun PantallaHistorial(historial: List<Lead>, alElegir: (Lead) -> Unit) {
    ScalingLazyColumn(
        modifier = Modifier.fillMaxSize().background(Negro),
        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 28.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        item {
            Text("Últimos leads", color = Verde, fontSize = 14.sp, fontWeight = FontWeight.Bold)
        }
        if (historial.isEmpty()) {
            item { Text("Sin leads todavía", color = Gris, fontSize = 13.sp) }
        }
        items(historial) { lead ->
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(GrisOscuro)
                    .clickable(role = Role.Button) { alElegir(lead) }
                    .padding(horizontal = 14.dp, vertical = 8.dp),
            ) {
                Text(lead.nombre, color = Blanco, fontSize = 14.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(
                    "${lead.servicio} · ${horaCorta(lead.hora)}",
                    color = Gris,
                    fontSize = 11.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }
}

// -------------------- SIN CONEXIÓN --------------------

@Composable
fun PantallaSinConexion(alReintentar: () -> Unit) {
    Redondo {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("Sin conexión", color = Rojo, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(4.dp))
            Text(
                "Los leads pendientes llegarán al reconectar",
                color = Gris,
                fontSize = 12.sp,
                textAlign = TextAlign.Center,
            )
            Spacer(Modifier.height(10.dp))
            BotonCircular("Reintentar", R.drawable.ic_reintentar, Verde, Negro, alTocar = alReintentar)
        }
    }
}
