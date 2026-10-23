import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
}

// La URL del servidor y el token del reloj NO viven en el código: se leen de
// local.properties (no versionado) o de variables de entorno (CI).
val propiedadesLocales = Properties().apply {
    val archivo = rootProject.file("local.properties")
    if (archivo.exists()) archivo.inputStream().use { load(it) }
}

fun config(clave: String, variableEntorno: String, defecto: String = ""): String =
    propiedadesLocales.getProperty(clave) ?: System.getenv(variableEntorno) ?: defecto

fun comillas(valor: String) = "\"" + valor.replace("\\", "\\\\").replace("\"", "\\\"") + "\""

android {
    namespace = "ai.asidesimple.reloj"
    compileSdk {
        version = release(37)
    }

    defaultConfig {
        applicationId = "ai.asidesimple.reloj"
        minSdk = 30
        targetSdk = 37
        versionCode = 1
        versionName = "0.1.0"
        buildConfigField("String", "DEVICE_TOKEN", comillas(config("reloj.deviceToken", "RELOJ_DEVICE_TOKEN")))
    }

    flavorDimensions += "servidor"
    productFlavors {
        // Servidor en la PC (emulador: 10.0.2.2). Permite ws:// sin TLS.
        create("local") {
            dimension = "servidor"
            applicationIdSuffix = ".local"
            versionNameSuffix = "-local"
            buildConfigField(
                "String", "WS_URL",
                comillas(config("reloj.wsUrl.local", "RELOJ_WS_URL_LOCAL", "ws://10.0.2.2:3001/ws/reloj")),
            )
        }
        // Servidor desplegado (wss://).
        create("prod") {
            dimension = "servidor"
            buildConfigField("String", "WS_URL", comillas(config("reloj.wsUrl.prod", "RELOJ_WS_URL")))
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.wear.compose.material3)
    implementation(libs.wear.compose.foundation)
    implementation(libs.okhttp)
    debugImplementation(libs.androidx.compose.ui.tooling)
}
