import os
import sys
import shutil
from PIL import Image # Librería Pillow para imágenes
from datetime import datetime

# --- CONFIGURACIÓN ---
# Ruta donde quieres que terminen las imágenes (Tu carpeta pública)
RUTA_DESTINO = os.path.join(os.path.dirname(__file__), '..', 'public', 'images', 'blog')
CALIDAD_WEBP = 80  # Calidad de compresión (80 es el punto dulce entre peso y calidad)
ANCHO_MAXIMO = 1200 # Ancho máximo en píxeles (Estándar para blogs)

def optimizar_imagen(ruta_origen, nombre_final):
    """
    Toma una imagen, la redimensiona, la convierte a WebP y la guarda en public/
    """
    try:
        # 1. Verificar si existe la carpeta de destino, si no, crearla
        if not os.path.exists(RUTA_DESTINO):
            os.makedirs(RUTA_DESTINO)
            print(f"📁 Carpeta creada: {RUTA_DESTINO}")

        # 2. Abrir la imagen original
        with Image.open(ruta_origen) as img:
            
            # 3. Calcular nuevas dimensiones (Manteniendo proporción)
            if img.width > ANCHO_MAXIMO:
                ratio = ANCHO_MAXIMO / float(img.width)
                alto_nuevo = int((float(img.height) * float(ratio)))
                img = img.resize((ANCHO_MAXIMO, alto_nuevo), Image.Resampling.LANCZOS)
                print(f"📏 Redimensionada a: {ANCHO_MAXIMO}x{alto_nuevo}px")

            # 4. Construir el nombre del archivo final
            # Limpiamos el nombre para que sea seguro en URL
            nombre_limpio = nombre_final.lower().replace(" ", "-")
            archivo_salida = f"{nombre_limpio}.webp"
            ruta_final = os.path.join(RUTA_DESTINO, archivo_salida)

            # 5. Guardar como WebP optimizado
            img.save(ruta_final, 'webp', quality=CALIDAD_WEBP, optimize=True)
            
            print("\n" + "⚡"*20)
            print(f"✅ ¡IMAGEN LISTA PARA TU BLOG!")
            print(f"📂 Guardada en: public/images/blog/{archivo_salida}")
            print("-" * 40)
            print("COPIA ESTO EN TU ARTÍCULO MARKDOWN:")
            print(f"![Descripción de la imagen](/images/blog/{archivo_salida})")
            print("⚡"*20 + "\n")

    except Exception as e:
        print(f"❌ Error procesando la imagen: {e}")

if __name__ == "__main__":
    print("🖼️  OPTIMIZADOR DE IMÁGENES VOLTIO 🖼️")
    print("---------------------------------------")
    
    # Modo interactivo
    raw_input = input("1. Arrastra aquí la imagen original y pulsa Enter: ")
    
    # LIMPIEZA AGRESIVA PARA POWERSHELL Y WINDOWS
    # 1. Quitamos espacios en blanco al inicio y final
    # 2. Quitamos el '&' que pone PowerShell
    # 3. Quitamos comillas simples y dobles
    ruta_input = raw_input.strip().replace('&', '').replace("'", "").replace('"', "").strip()
    
    if os.path.exists(ruta_input):
        nombre_input = input("2. Escribe el nombre para el archivo (ej: motor trifasico): ")
        if nombre_input:
            optimizar_imagen(ruta_input, nombre_input)
        else:
            print("❌ Debes escribir un nombre.")
    else:
        print(f"❌ El archivo no existe. Ruta detectada: {ruta_input}")
        print("Intenta escribir la ruta manualmente sin comillas si sigue fallando.")