import os
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Field, SQLModel, create_engine, Session, select
from dotenv import load_dotenv
from pydantic import BaseModel

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