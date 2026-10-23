package ai.asidesimple.reloj.ui

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.wear.compose.material3.ColorScheme
import androidx.wear.compose.material3.MaterialTheme

/** Pantone Black C. */
val Negro = Color(0xFF2D2926)
/** Verde de acción de la marca. */
val Verde = Color(0xFF84BD00)
val Gris = Color(0xFF9A9693)
val GrisOscuro = Color(0xFF3E3A37)
val Rojo = Color(0xFFE5534B)
val Blanco = Color(0xFFFFFFFF)

private val esquema = ColorScheme(
    primary = Verde,
    onPrimary = Negro,
    background = Negro,
    onBackground = Blanco,
    onSurface = Blanco,
    onSurfaceVariant = Gris,
)

@Composable
fun TemaReloj(contenido: @Composable () -> Unit) {
    MaterialTheme(colorScheme = esquema, content = contenido)
}
