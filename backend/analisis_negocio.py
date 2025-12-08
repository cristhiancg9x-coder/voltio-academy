import os
import pandas as pd
import matplotlib.pyplot as plt
from sqlalchemy import create_engine
from dotenv import load_dotenv
from datetime import datetime

# 1. Configuración Visual
plt.style.use('ggplot') 

# 2. Conexión a Base de Datos
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

def generar_reporte():
    print("🔄 Conectando a Supabase y descargando datos...")

    # --- NUEVO: CREAR CARPETA DE REPORTES ---
    # Obtenemos la fecha de hoy para organizar mejor (opcional, pero recomendado)
    fecha_hoy = datetime.now().strftime('%Y-%m-%d')
    directorio_reportes = os.path.join(os.path.dirname(__file__), 'reportes')
    
    if not os.path.exists(directorio_reportes):
        os.makedirs(directorio_reportes)
        print(f"📁 Carpeta creada: {directorio_reportes}")

    # --- ANÁLISIS 1: ESTUDIANTES APROBADOS VS REPROBADOS ---
    try:
        query_examen = "SELECT nota FROM examenresultado"
        df_examen = pd.read_sql(query_examen, engine)
        
        if not df_examen.empty:
            aprobados = df_examen[df_examen['nota'] >= 13].shape[0]
            reprobados = df_examen[df_examen['nota'] < 13].shape[0]

            plt.figure(figsize=(6, 6))
            plt.pie([aprobados, reprobados], labels=['Aprobados', 'Reprobados'], autopct='%1.1f%%', colors=['#4ade80', '#f87171'])
            plt.title(f'Rendimiento Exámenes - {fecha_hoy}')
            
            # Guardar en la carpeta reportes
            ruta_imagen = os.path.join(directorio_reportes, 'rendimiento_global.png')
            plt.savefig(ruta_imagen)
            plt.close() # Importante cerrar para liberar memoria
            print(f"✅ Gráfico generado: {ruta_imagen}")
        else:
            print("⚠️ No hay datos de exámenes aún.")

    except Exception as e:
        print(f"❌ Error en análisis de exámenes: {e}")

    # --- ANÁLISIS 2: VENTAS POR CURSO ---
    try:
        query_ventas = "SELECT curso_id, monto FROM compra"
        df_ventas = pd.read_sql(query_ventas, engine)

        if not df_ventas.empty:
            ventas_por_curso = df_ventas.groupby('curso_id')['monto'].sum()

            plt.figure(figsize=(10, 6))
            ventas_por_curso.plot(kind='bar', color='#00f0ff')
            plt.title(f'Ingresos por Curso (Soles) - {fecha_hoy}')
            plt.xlabel('Curso')
            plt.ylabel('Monto (S/)')
            plt.xticks(rotation=45)
            plt.tight_layout()
            
            # Guardar en la carpeta reportes
            ruta_imagen = os.path.join(directorio_reportes, 'ventas_totales.png')
            plt.savefig(ruta_imagen)
            plt.close()
            print(f"✅ Gráfico generado: {ruta_imagen}")
        else:
            print("⚠️ No hay ventas registradas aún.")

    except Exception as e:
        print(f"❌ Error en análisis de ventas: {e}")

if __name__ == "__main__":
    generar_reporte()