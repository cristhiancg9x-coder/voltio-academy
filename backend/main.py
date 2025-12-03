import os
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Field, SQLModel, create_engine, Session, select
from dotenv import load_dotenv
from pydantic import BaseModel
# NUEVAS IMPORTACIONES PARA PDF
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, landscape
from fastapi.responses import StreamingResponse
import io
from datetime import date

# 1. CONFIGURACIÓN
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

# --- MODELOS (TABLAS) ---

# Tabla de Suscriptores (Ya la tenías)
class Suscriptor(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str

# NUEVA TABLA: Resultados de Examen
class ExamenResultado(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str
    nota: int
    fecha: str # Guardaremos la fecha como texto por simplicidad ahora

# Modelo para recibir las respuestas desde el Frontend (No es tabla, es un esquema)
class RespuestasExamen(BaseModel):
    email: str
    respuestas: List[str] # Lista de opciones ["A", "B", "C"]

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# --- APP ---
app = FastAPI()

origins = [
    "http://localhost:4321",
    "https://voltioacademy.lat",
    "https://www.voltioacademy.lat"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# --- RUTAS ---

@app.get("/")
def read_root():
    return {"mensaje": "Backend VoltioAcademy Activo ⚡"}

@app.get("/api/status")
def check_status():
    return {"sistema": "API Real", "db": "PostgreSQL", "estado": "OK"}

@app.post("/api/subscribe")
def suscribir_usuario(suscriptor: Suscriptor):
    with Session(engine) as session:
        statement = select(Suscriptor).where(Suscriptor.email == suscriptor.email)
        if session.exec(statement).first():
            return {"mensaje": "Ya estás registrado."}
        
        session.add(suscriptor)
        session.commit()
        return {"mensaje": "Suscripción exitosa."}

# --- NUEVA RUTA: CORREGIR EXAMEN ---
@app.post("/api/examen/submit")
def corregir_examen(datos: RespuestasExamen):
    # 1. LA HOJA DE RESPUESTAS CORRECTAS (Lógica de Python)
    # Digamos que el examen tiene 3 preguntas y estas son las claves:
    claves_correctas = ["A", "B", "A"] 
    
    puntaje = 0
    total_preguntas = len(claves_correctas)

    # 2. Algoritmo de corrección
    # Comparamos lo que envió el alumno con la clave
    for i, respuesta_alumno in enumerate(datos.respuestas):
        if i < total_preguntas and respuesta_alumno == claves_correctas[i]:
            puntaje += 1
    
    # Calculamos nota sobre 20
    nota_final = int((puntaje / total_preguntas) * 20)
    
    # 3. Guardar en Base de Datos
    import datetime
    nuevo_resultado = ExamenResultado(
        email=datos.email,
        nota=nota_final,
        fecha=str(datetime.date.today())
    )
    
    with Session(engine) as session:
        session.add(nuevo_resultado)
        session.commit()
        
    # 4. Responder al Frontend
    aprobado = nota_final >= 13
    return {
        "nota": nota_final,
        "aciertos": puntaje,
        "mensaje": "¡Aprobaste, Felicidades!" if aprobado else "Sigue estudiando, inténtalo de nuevo."
    }

# --- RUTA GENERAR CERTIFICADO ---
@app.get("/api/certificado/{nombre_alumno}")
def generar_certificado(nombre_alumno: str):
    # 1. Crear un buffer de memoria (un archivo virtual)
    buffer = io.BytesIO()

    # 2. Configurar el lienzo (Canvas)
    # Usamos tamaño carta horizontal (landscape)
    c = canvas.Canvas(buffer, pagesize=landscape(letter))
    ancho, alto = landscape(letter)

    # 3. DIBUJAR EL DISEÑO (Como si pintaras en un cuadro)
    
    # Fondo o Borde
    c.setStrokeColorRGB(0, 0.8, 1) # Color Cyan (Voltio)
    c.setLineWidth(5)
    c.rect(30, 30, ancho-60, alto-60) # Marco exterior

    # Título
    c.setFont("Helvetica-Bold", 40)
    c.drawCentredString(ancho/2, alto - 150, "CERTIFICADO DE APROBACIÓN")

    # Texto
    c.setFont("Helvetica", 20)
    c.drawCentredString(ancho/2, alto - 220, "VoltioAcademy certifica que:")
    
    # Nombre del Alumno (Dinámico)
    c.setFont("Helvetica-Bold", 35)
    c.setFillColorRGB(0.2, 0.2, 0.2)
    c.drawCentredString(ancho/2, alto - 280, nombre_alumno.upper())

    # Descripción
    c.setFont("Helvetica", 16)
    c.setFillColorRGB(0, 0, 0)
    c.drawCentredString(ancho/2, alto - 340, "Ha aprobado satisfactoriamente el examen de:")
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(ancho/2, alto - 370, "SEGURIDAD ELÉCTRICA - CNE 2025")

    # Fecha
    c.setFont("Helvetica-Oblique", 12)
    c.drawString(100, 80, f"Fecha de emisión: {date.today()}")

    # Firma (Simulada)
    c.line(ancho - 250, 100, ancho - 50, 100)
    c.setFont("Helvetica", 10)
    c.drawCentredString(ancho - 150, 85, "Ing. Director General")
    c.drawCentredString(ancho - 150, 70, "VoltioAcademy")

    # 4. Finalizar y guardar en el buffer
    c.showPage()
    c.save()

    # 5. Mover el puntero al inicio del archivo virtual
    buffer.seek(0)

    # 6. Devolver el archivo al navegador
    return StreamingResponse(
        buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Certificado_{nombre_alumno}.pdf"}
    )

# --- RUTAS DE ADMINISTRACIÓN ---

# Ver todos los suscriptores
@app.get("/api/admin/suscriptores")
def listar_suscriptores():
    with Session(engine) as session:
        statement = select(Suscriptor)
        resultados = session.exec(statement).all()
        return resultados

# Ver todos los resultados de exámenes
@app.get("/api/admin/examenes")
def listar_examenes():
    with Session(engine) as session:
        # Ordenamos por ID descendente (los más recientes primero)
        statement = select(ExamenResultado).order_by(ExamenResultado.id.desc())
        resultados = session.exec(statement).all()
        return resultados