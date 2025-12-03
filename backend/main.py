import os
import io
from datetime import datetime, date
from typing import List

# FastAPI y Servidor
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

# Base de Datos
from sqlmodel import Field, SQLModel, create_engine, Session, select
from dotenv import load_dotenv
from pydantic import BaseModel

# PDF (ReportLab)
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, landscape

# --- 1. CONFIGURACIÓN DE LA BASE DE DATOS ---
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# Corrección para Supabase (necesita postgresql:// en vez de postgres://)
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

# --- 2. MODELOS DE DATOS (TABLAS) ---

class Suscriptor(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str

class ExamenResultado(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str
    nota: int
    fecha: str

class Compra(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str
    curso_id: str
    fecha: str
    monto: float

# --- MODELOS DE ENTRADA (Esquemas para recibir datos) ---

class RespuestasExamen(BaseModel):
    email: str
    respuestas: List[str]

class SolicitudCompra(BaseModel):
    email: str
    curso_id: str

# Función para crear las tablas
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# --- 3. INICIALIZACIÓN DE LA APP ---
app = FastAPI()

# Configuración de Seguridad (CORS)
origins = [
    "http://localhost:4321",      # Tu PC
    "https://voltioacademy.lat",  # Tu Web
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

# --- 4. RUTAS (ENDPOINTS) ---

@app.get("/")
def read_root():
    return {"mensaje": "Backend VoltioAcademy Activo ⚡"}

@app.get("/api/status")
def check_status():
    return {"sistema": "API Real", "db": "PostgreSQL", "estado": "OK"}

# --- MÓDULO: SUSCRIPCIONES ---
@app.post("/api/subscribe")
def suscribir_usuario(suscriptor: Suscriptor):
    with Session(engine) as session:
        statement = select(Suscriptor).where(Suscriptor.email == suscriptor.email)
        if session.exec(statement).first():
            return {"mensaje": "Ya estás registrado."}
        
        session.add(suscriptor)
        session.commit()
        return {"mensaje": "Suscripción exitosa."}

# --- MÓDULO: EXÁMENES ---
@app.post("/api/examen/submit")
def corregir_examen(datos: RespuestasExamen):
    # Claves correctas (A, B, A)
    claves_correctas = ["A", "B", "A"] 
    puntaje = 0
    total = len(claves_correctas)

    for i, respuesta in enumerate(datos.respuestas):
        if i < total and respuesta == claves_correctas[i]:
            puntaje += 1
    
    nota_final = int((puntaje / total) * 20)
    
    # Guardar resultado
    nuevo_resultado = ExamenResultado(
        email=datos.email,
        nota=nota_final,
        fecha=str(date.today())
    )
    
    with Session(engine) as session:
        session.add(nuevo_resultado)
        session.commit()
        
    aprobado = nota_final >= 13
    return {
        "nota": nota_final,
        "aciertos": puntaje,
        "mensaje": "¡Aprobaste, Felicidades!" if aprobado else "Sigue estudiando."
    }

# --- MÓDULO: CERTIFICADOS PDF ---
@app.get("/api/certificado/{nombre_alumno}")
def generar_certificado(nombre_alumno: str):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=landscape(letter))
    ancho, alto = landscape(letter)

    # Diseño del Diploma
    c.setStrokeColorRGB(0, 0.8, 1) # Cyan
    c.setLineWidth(5)
    c.rect(30, 30, ancho-60, alto-60)

    c.setFont("Helvetica-Bold", 40)
    c.drawCentredString(ancho/2, alto - 150, "CERTIFICADO DE APROBACIÓN")

    c.setFont("Helvetica", 20)
    c.drawCentredString(ancho/2, alto - 220, "VoltioAcademy certifica que:")
    
    c.setFont("Helvetica-Bold", 35)
    c.setFillColorRGB(0.2, 0.2, 0.2)
    c.drawCentredString(ancho/2, alto - 280, nombre_alumno.upper())

    c.setFont("Helvetica", 16)
    c.setFillColorRGB(0, 0, 0)
    c.drawCentredString(ancho/2, alto - 340, "Ha aprobado satisfactoriamente el examen de:")
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(ancho/2, alto - 370, "SEGURIDAD ELÉCTRICA - CNE 2025")

    c.setFont("Helvetica-Oblique", 12)
    c.drawString(100, 80, f"Fecha de emisión: {date.today()}")

    c.line(ancho - 250, 100, ancho - 50, 100)
    c.setFont("Helvetica", 10)
    c.drawCentredString(ancho - 150, 85, "Ing. Director General")
    c.drawCentredString(ancho - 150, 70, "VoltioAcademy")

    c.showPage()
    c.save()
    buffer.seek(0)

    return StreamingResponse(
        buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Certificado_{nombre_alumno}.pdf"}
    )

# --- MÓDULO: ADMINISTRACIÓN ---
@app.get("/api/admin/suscriptores")
def listar_suscriptores():
    with Session(engine) as session:
        return session.exec(select(Suscriptor)).all()

@app.get("/api/admin/examenes")
def listar_examenes():
    with Session(engine) as session:
        return session.exec(select(ExamenResultado).order_by(ExamenResultado.id.desc())).all()

# --- MÓDULO: VENTAS (NUEVO) ---
@app.post("/api/comprar")
def registrar_compra(solicitud: SolicitudCompra):
    with Session(engine) as session:
        # Verificar si ya compró
        statement = select(Compra).where(
            Compra.email == solicitud.email, 
            Compra.curso_id == solicitud.curso_id
        )
        if session.exec(statement).first():
            return {"mensaje": "Ya tienes este curso.", "status": "exists"}

        # Registrar compra
        nueva_compra = Compra(
            email=solicitud.email,
            curso_id=solicitud.curso_id,
            fecha=str(datetime.now()),
            monto=49.99
        )
        session.add(nueva_compra)
        session.commit()
        
        return {"mensaje": "¡Compra exitosa! Curso desbloqueado.", "status": "success"}

@app.get("/api/mis-cursos/{email}")
def obtener_mis_cursos(email: str):
    with Session(engine) as session:
        statement = select(Compra).where(Compra.email == email)
        resultados = session.exec(statement).all()
        # Retornamos solo los IDs de los cursos comprados
        return [compra.curso_id for compra in resultados]