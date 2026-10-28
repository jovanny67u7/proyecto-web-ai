# Convierte las capturas cuadradas del emulador en "pantallas de reloj" circulares
# con bisel, sobre fondo transparente.
import sys, os
from PIL import Image, ImageDraw

origen, destino = sys.argv[1], sys.argv[2]
os.makedirs(destino, exist_ok=True)
ESCALA = 4  # supermuestreo para bordes suaves

for nombre in sorted(os.listdir(origen)):
    if not nombre.endswith(".png"):
        continue
    img = Image.open(os.path.join(origen, nombre)).convert("RGBA")
    lado = img.width  # capturas de 384x384
    bisel = int(lado * 0.07)
    total = lado + 2 * bisel

    # Máscara circular de la pantalla
    mask = Image.new("L", (lado * ESCALA, lado * ESCALA), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, lado * ESCALA - 1, lado * ESCALA - 1), fill=255)
    mask = mask.resize((lado, lado), Image.LANCZOS)

    lienzo = Image.new("RGBA", (total * ESCALA, total * ESCALA), (0, 0, 0, 0))
    d = ImageDraw.Draw(lienzo)
    # Bisel exterior (gris metálico) e interior (negro)
    d.ellipse((0, 0, total * ESCALA - 1, total * ESCALA - 1), fill=(58, 55, 52, 255))
    m = int(bisel * 0.45) * ESCALA
    d.ellipse((m, m, total * ESCALA - 1 - m, total * ESCALA - 1 - m), fill=(18, 17, 16, 255))
    lienzo = lienzo.resize((total, total), Image.LANCZOS)

    pantalla = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    pantalla.paste(img, (0, 0), mask)
    lienzo.alpha_composite(pantalla, (bisel, bisel))
    lienzo.save(os.path.join(destino, nombre.replace(".png", "_circular.png")))
    print("ok", nombre)
