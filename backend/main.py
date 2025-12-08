import os
import io
import mercadopago
from datetime import datetime, date
from typing import List, Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from sqlmodel import Field, SQLModel, create_engine, Session, select
from dotenv import load_dotenv
from pydantic import BaseModel

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, landscape

# --- 1. CONFIGURACIÓN ---
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
engine = create_engine(DATABASE_URL)

MP_ACCESS_TOKEN = os.getenv("MP_ACCESS_TOKEN")
sdk = None
if MP_ACCESS_TOKEN:
    sdk = mercadopago.SDK(MP_ACCESS_TOKEN)

# --- 2. MODELOS DE DATOS ---

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
    payment_id: str | None = None 

# --- NUEVOS MODELOS PARA CURSOS ---
class Curso(SQLModel, table=True):
    id: str = Field(primary_key=True) # Ej: "solar-master"
    titulo: str
    descripcion: str
    imagen: str
    nivel: str # Principiante, Intermedio...
    precio: float
    es_gratis: bool = False
    publicado: bool = False # Para borradores

class Modulo(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    curso_id: str = Field(foreign_key="curso.id")
    titulo: str
    orden: int

class Leccion(SQLModel, table=True):
    id: str = Field(primary_key=True) # Ej: "l1-solar"
    modulo_id: int = Field(foreign_key="modulo.id")
    titulo: str
    video_id: str # YouTube ID
    duracion: str
    orden: int

# --- NUEVO MODELO: PROGRESO ---
class Progreso(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str
    lesson_id: str
    curso_id: str
    fecha: str

# --- ESQUEMAS DE ENTRADA ---
class RespuestasExamen(BaseModel):
    email: str
    respuestas: List[str]

class SolicitudCompra(BaseModel):
    email: str
    curso_id: str

class CursoCreate(BaseModel):
    id: str
    titulo: str
    descripcion: str
    imagen: str
    nivel: str
    precio: float
    es_gratis: bool

class ModuloCreate(BaseModel):
    curso_id: str
    titulo: str
    orden: int

class LeccionCreate(BaseModel):
    id: str
    modulo_id: int
    titulo: str
    video_id: str
    duracion: str
    orden: int

class SolicitudProgreso(BaseModel):
    email: str
    lesson_id: str
    curso_id: str

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# --- 3. APP ---
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
# --- RUTA DE ESTADO (Vital para el chip "SISTEMA ONLINE") ---
@app.get("/api/status")
def check_status():
    return {"sistema": "API Real", "db": "PostgreSQL", "estado": "OK"}

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# --- 4. RUTAS ---

@app.get("/")
def read_root():
    return {"mensaje": "Backend VoltioAcademy V2 - Sistema de Cursos Activo 🎓"}

# --- GESTIÓN DE CURSOS (ADMIN) ---

@app.post("/api/admin/crear-curso")
def crear_curso(curso: CursoCreate):
    with Session(engine) as session:
        nuevo_curso = Curso(**curso.dict(), publicado=True)
        session.add(nuevo_curso)
        session.commit()
        return {"mensaje": "Curso creado exitosamente", "id": curso.id}

@app.post("/api/admin/crear-modulo")
def crear_modulo(modulo: ModuloCreate):
    with Session(engine) as session:
        nuevo_modulo = Modulo(**modulo.dict())
        session.add(nuevo_modulo)
        session.commit()
        session.refresh(nuevo_modulo)
        return {"mensaje": "Módulo creado", "id": nuevo_modulo.id}

@app.post("/api/admin/crear-leccion")
def crear_leccion(leccion: LeccionCreate):
    with Session(engine) as session:
        nueva_leccion = Leccion(**leccion.dict())
        session.add(nueva_leccion)
        session.commit()
        return {"mensaje": "Lección creada"}

# --- LECTURA DE CURSOS (PÚBLICO) ---

@app.get("/api/cursos")
def obtener_cursos():
    with Session(engine) as session:
        # Devuelve solo los publicados
        return session.exec(select(Curso).where(Curso.publicado == True)).all()

@app.get("/api/curso/{curso_id}/completo")
def obtener_estructura_curso(curso_id: str):
    """Devuelve el curso con sus módulos y lecciones jerarquizados"""
    with Session(engine) as session:
        curso = session.get(Curso, curso_id)
        if not curso:
            return {"error": "Curso no encontrado"}
        
        # Obtener módulos
        modulos = session.exec(select(Modulo).where(Modulo.curso_id == curso_id).order_by(Modulo.orden)).all()
        
        estructura_modulos = []
        for mod in modulos:
            # Obtener lecciones de cada módulo
            lecciones = session.exec(select(Leccion).where(Leccion.modulo_id == mod.id).order_by(Leccion.orden)).all()
            estructura_modulos.append({
                "id": mod.id,
                "title": mod.titulo,
                "lessons": [l.dict() for l in lecciones]
            })
            
        return {
            "title": curso.titulo,
            "description": curso.descripcion,
            "modules": estructura_modulos
        }

# --- SISTEMA DE PROGRESO ---
@app.post("/api/progreso/toggle")
def toggle_progreso(solicitud: SolicitudProgreso):
    with Session(engine) as session:
        statement = select(Progreso).where(
            Progreso.email == solicitud.email,
            Progreso.lesson_id == solicitud.lesson_id
        )
        existente = session.exec(statement).first()

        if existente:
            session.delete(existente)
            session.commit()
            return {"status": "unmarked", "mensaje": "Lección desmarcada"}
        else:
            nuevo = Progreso(
                email=solicitud.email,
                lesson_id=solicitud.lesson_id,
                curso_id=solicitud.curso_id,
                fecha=str(datetime.now())
            )
            session.add(nuevo)
            session.commit()
            return {"status": "marked", "mensaje": "Lección completada"}

@app.get("/api/progreso/{email}/{curso_id}")
def obtener_progreso(email: str, curso_id: str):
    with Session(engine) as session:
        statement = select(Progreso).where(
            Progreso.email == email,
            Progreso.curso_id == curso_id
        )
        resultados = session.exec(statement).all()
        return [p.lesson_id for p in resultados]

# --- SUSCRIPCIONES ---
@app.post("/api/subscribe")
def suscribir_usuario(suscriptor: Suscriptor):
    with Session(engine) as session:
        statement = select(Suscriptor).where(Suscriptor.email == suscriptor.email)
        if session.exec(statement).first():
            return {"mensaje": "Ya estás registrado."}
        
        session.add(suscriptor)
        session.commit()
        return {"mensaje": "Suscripción exitosa."}

# --- VENTAS CON MERCADO PAGO ---
@app.post("/api/crear-pago")
def crear_pago(solicitud: SolicitudCompra):
    # BUSCAMOS EL PRECIO REAL EN LA BASE DE DATOS AHORA
    with Session(engine) as session:
        curso = session.get(Curso, solicitud.curso_id)
        if not curso:
            return {"error": "Curso no encontrado"}
        
        precio_real = curso.precio
        titulo_curso = curso.titulo

    # Modo Simulación si no hay SDK
    if not sdk:
         with Session(engine) as session:
            # Verificar si ya existe
            statement = select(Compra).where(
                Compra.email == solicitud.email, 
                Compra.curso_id == solicitud.curso_id
            )
            if session.exec(statement).first():
                return {"status": "exists", "mensaje": "Ya tienes este curso."}

            nueva_compra = Compra(
                email=solicitud.email,
                curso_id=solicitud.curso_id,
                fecha=str(datetime.now()),
                monto=precio_real,
                payment_id="simulado_v2"
            )
            session.add(nueva_compra)
            session.commit()
            return {"status": "success", "mensaje": "¡Pago simulado exitoso!"}

    # Modo Real (Si hay SDK)
    preference_data = {
        "items": [
            {
                "id": solicitud.curso_id,
                "title": f"Curso: {titulo_curso}",
                "quantity": 1,
                "currency_id": "PEN",
                "unit_price": float(precio_real)
            }
        ],
        "payer": {
            "email": solicitud.email
        },
        "back_urls": {
            "success": "https://voltioacademy.lat/cursos",
            "failure": "https://voltioacademy.lat/cursos",
            "pending": "https://voltioacademy.lat/cursos"
        },
        "auto_return": "approved",
        "metadata": {
            "user_email": solicitud.email,
            "course_id": solicitud.curso_id
        }
    }

    try:
        preference_response = sdk.preference().create(preference_data)
        preference = preference_response["response"]
        return {"init_point": preference["init_point"]}
    except Exception as e:
        print(f"Error SDK MercadoPago: {e}")
        return {"error": "Fallo al conectar con Mercado Pago"}

@app.post("/api/webhook/mercadopago")
async def recibir_notificacion(request: Request):
    if not sdk: return {"status": "error", "message": "MP no configurado"}
    try:
        data = await request.json()
        if data.get("type") == "payment":
            payment_id = data.get("data", {}).get("id")
            payment_info = sdk.payment().get(payment_id)
            payment = payment_info["response"]
            
            if payment["status"] == "approved":
                metadata = payment.get("metadata", {})
                email_usuario = metadata.get("user_email")
                curso_id = metadata.get("course_id")
                monto = payment.get("transaction_amount")
                
                with Session(engine) as session:
                    statement = select(Compra).where(Compra.email == email_usuario, Compra.curso_id == curso_id)
                    if not session.exec(statement).first():
                        nueva_compra = Compra(
                            email=email_usuario,
                            curso_id=curso_id,
                            fecha=str(datetime.now()),
                            monto=monto,
                            payment_id=str(payment_id)
                        )
                        session.add(nueva_compra)
                        session.commit()
        return {"status": "ok"}
    except Exception as e:
        print(f"Error Webhook: {e}")
        return {"status": "error"}

@app.get("/api/mis-cursos/{email}")
def obtener_mis_cursos(email: str):
    with Session(engine) as session:
        statement = select(Compra).where(Compra.email == email)
        resultados = session.exec(statement).all()
        return [compra.curso_id for compra in resultados]

# --- EXÁMENES ---
@app.post("/api/examen/submit")
def corregir_examen(datos: RespuestasExamen):
    claves_correctas = ["A", "B", "A"] 
    puntaje = 0
    total = len(claves_correctas)
    for i, respuesta in enumerate(datos.respuestas):
        if i < total and respuesta == claves_correctas[i]:
            puntaje += 1
    nota_final = int((puntaje / total) * 20)
    
    nuevo_resultado = ExamenResultado(
        email=datos.email,
        nota=nota_final,
        fecha=str(date.today())
    )
    with Session(engine) as session:
        session.add(nuevo_resultado)
        session.commit()
    return {
        "nota": nota_final,
        "aciertos": puntaje,
        "mensaje": "¡Aprobaste, Felicidades!" if (nota_final >= 13) else "Sigue estudiando."
    }

# --- CERTIFICADOS ---
@app.get("/api/certificado/{nombre_alumno}")
def generar_certificado(nombre_alumno: str):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=landscape(letter))
    ancho, alto = landscape(letter)
    c.setStrokeColorRGB(0, 0.8, 1)
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

# --- ADMIN ---
@app.get("/api/admin/suscriptores")
def listar_suscriptores():
    with Session(engine) as session:
        return session.exec(select(Suscriptor)).all()

@app.get("/api/admin/examenes")
def listar_examenes():
    with Session(engine) as session:
        return session.exec(select(ExamenResultado).order_by(ExamenResultado.id.desc())).all()