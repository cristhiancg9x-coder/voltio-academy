import os
import sys
import json
import re
from datetime import datetime
from dotenv import load_dotenv
from google import genai

# --- 1. CONFIGURACIÓN ---
ruta_actual = os.path.dirname(os.path.abspath(__file__))
ruta_env = os.path.join(ruta_actual, '..', '.env')
load_dotenv(ruta_env)

API_KEY = os.getenv("PUBLIC_GEMINI_API_KEY")

if not API_KEY:
    print(f"❌ ERROR: No encuentro la clave en: {ruta_env}")
    sys.exit(1)

SEPARADOR_MAGICO = "|||SECCION_MARKETING|||"

def cargar_configuracion():
    archivo_config = os.path.join(ruta_actual, 'config_blog.json')
    try:
        with open(archivo_config, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "output_dir": "../src/content/blog",
            "author": "VoltioBot",
            "hero_image_path": "/social-image.jpg",
            "default_tags": ["Electricidad"]
        }

def determinar_categoria(titulo):
    t = titulo.lower()
    if "solar" in t: return "Energias Renovables"
    if "motor" in t or "industrial" in t or "plc" in t: return "Industrial"
    if "casa" in t or "domicili" in t: return "Residencial"
    if "norma" in t or "cne" in t: return "Normativa"
    if "herramienta" in t: return "Herramientas"
    return "Fundamentos"

def generar_contenido_completo(titulo_tema):
    try:
        cliente = genai.Client(api_key=API_KEY)
        titulo = titulo_tema.replace('\n', ' ').strip()
        
        # --- EL SUPER PROMPT DE MARKETING 2.0 ---
        prompt = (
            f"Actúa como un Ingeniero Eléctrico Senior y Experto en Marketing Digital. "
            f"Tu tarea es crear contenido para: '{titulo}'.\n\n"
            
            f"🛑 REGLA DE IDIOMA: Todo el contenido del artículo y los posts debe estar en **ESPAÑOL**. "
            f"Solo el prompt de la imagen debe estar en Inglés.\n\n"
            
            f"PARTE 1: EL ARTÍCULO TÉCNICO (Markdown)\n"
            f"- Estructura: Intro, Desarrollo (H2, H3), Ejemplos CNE, Conclusión.\n"
            f"- Tono: Profesional pero cercano.\n"
            f"- Sugiere dónde poner imágenes así: ![ALT text](/images/blog/nombre-sugerido.jpg)\n\n"
            
            f"Escribe exactamente este separador aquí: {SEPARADOR_MAGICO}\n\n"
            
            f"PARTE 2: EL KIT DE MARKETING MULTIPLATAFORMA (Texto plano)\n\n"
            
            f"1. 🎨 PROMPT DE IMAGEN (EN INGLÉS): Escribe un prompt detallado para Midjourney/DALL-E. "
            f"Estilo: Cinematic lighting, hyperrealistic, technical drawing style overlay.\n\n"
            
            f"2. 👔 LINKEDIN (Profesional): Redacta un post estructurado. "
            f"Usa viñetas para puntos clave. Tono de autoridad técnica. Incluye hashtags profesionales.\n\n"
            
            f"3. 📘 FACEBOOK (Comunidad): Redacta un post que genere debate o curiosidad. "
            f"Pregunta a la audiencia. Tono cercano y útil.\n\n"
            
            f"4. 📸 INSTAGRAM (Visual): Redacta el 'Caption' (Pie de foto). "
            f"Usa emojis ⚡🔌. Estructura de: Gancho -> Valor -> Llamada a la acción (Link en bio). Incluye 15 hashtags relevantes.\n\n"
            
            f"5. 🐦 X/TWITTER (Hilo): Escribe un hilo de 3 tweets. "
            f"Tweet 1: El problema. Tweet 2: La solución técnica. Tweet 3: Link al artículo.\n\n"
            
            f"6. 🧠 QUIZ RÁPIDO: 3 preguntas de opción múltiple sobre el texto con sus respuestas."
        )
        
        response = cliente.models.generate_content(
            model='gemini-2.0-flash', 
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"ERROR API: {e}"

def procesar_y_guardar(titulo, respuesta_ai, config):
    fecha = datetime.now().strftime('%Y-%m-%d')
    
    # Separar contenido
    partes = respuesta_ai.split(SEPARADOR_MAGICO)
    cuerpo_articulo = partes[0].strip()
    contenido_marketing = partes[1].strip() if len(partes) > 1 else "Error generando marketing."

    # Limpieza de Slug
    slug = re.sub(r'[^a-zA-Z0-9\s]', '', titulo).strip().lower()
    slug = re.sub(r'\s+', '-', slug)
    
    dir_salida = os.path.abspath(os.path.join(ruta_actual, config.get('output_dir', '../src/content/blog')))
    
    # Metadatos
    imagen = config.get('hero_image_path', '/social-image.jpg')
    categoria = determinar_categoria(titulo)
    tags = json.dumps(config.get('default_tags', ["Blog"]), ensure_ascii=False)

    # --- 1. GUARDAR EL ARTÍCULO (.md) ---
    frontmatter = f"""---
title: "{titulo}"
description: "Guía técnica sobre {titulo}."
pubDate: "{fecha}"
author: "{config.get('author', 'VoltioAcademy')}"
image: "{imagen}"
category: "{categoria}"
tags: {tags}
isFeatured: false
---

"""
    archivo_md = os.path.join(dir_salida, f"{slug}.md")
    
    if not os.path.exists(dir_salida):
        os.makedirs(dir_salida)

    with open(archivo_md, 'w', encoding='utf-8') as f:
        f.write(frontmatter + cuerpo_articulo)

    # --- 2. GUARDAR EL KIT DE MARKETING (.txt) ---
    dir_marketing = os.path.join(ruta_actual, 'marketing_generado')
    if not os.path.exists(dir_marketing):
        os.makedirs(dir_marketing)
        
    archivo_txt = os.path.join(dir_marketing, f"{slug}_MARKETING.txt")
    
    with open(archivo_txt, 'w', encoding='utf-8') as f:
        f.write(f"--- 📱 ESTRATEGIA DIGITAL PARA: {titulo} ---\n\n")
        f.write(contenido_marketing)

    print("\n" + "⚡"*30)
    print(f"✅ ¡CONTENIDO GENERADO EN ESPAÑOL!")
    print(f"📄 Artículo Web: {slug}.md")
    print(f"📢 Kit Redes Sociales: {slug}_MARKETING.txt")
    print("⚡"*30 + "\n")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        tema = " ".join(sys.argv[1:])
    else:
        tema = input("Escribe el tema del artículo: ")
        
    config = cargar_configuracion()
    print(f"🤖 AstroBot analizando: '{tema}'...")
    
    contenido = generar_contenido_completo(tema)
    
    if "ERROR API" not in contenido:
        procesar_y_guardar(tema, contenido, config)
    else:
        print(f"❌ Fallo: {contenido}")