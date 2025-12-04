import os
import io
import mercadopago
from datetime import datetime, date
from typing import List

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

# Base de Datos
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
engine = create_engine(DATABASE_URL)

# Mercado Pago (Lo dejamos listo para cuando te verifiquen)
MP_ACCESS_TOKEN = os.getenv("MP_ACCESS_TOKEN")
# Si no hay token, el SDK fallará al usarse, pero no rompe el servidor al inicio
if MP_ACCESS_TOKEN:
    sdk = mercadopago.SDK(MP_ACCESS_TOKEN)

# --- 2. MODELOS ---
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

class RespuestasExamen(BaseModel):
    email: str
    respuestas: List[str]

class SolicitudCompra(BaseModel):
    email: str
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

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# --- 4. RUTAS ---

@app.get("/")
def read_root():
    return {"mensaje": "Backend VoltioAcademy Activo ⚡"}

@app.get("/api/status")
def check_status():
    return {"sistema": "API Real", "db": "PostgreSQL", "estado": "OK"}

# --- SUSCRIPCIONES (LIMPIO: Solo guarda en DB) ---
@app.post("/api/subscribe")
def suscribir_usuario(suscriptor: Suscriptor):
    with Session(engine) as session:
        # 1. Verificar si ya existe
        statement = select(Suscriptor).where(Suscriptor.email == suscriptor.email)
        if session.exec(statement).first():
            return {"mensaje": "Ya estás registrado."}
        
        # 2. Guardar en Base de Datos
        session.add(suscriptor)
        session.commit()

        # YA NO HAY ENVÍO DE CORREO AQUÍ
        print(f"✅ Nuevo suscriptor guardado: {suscriptor.email}")

        return {"mensaje": "Suscripción exitosa."}

# --- VENTAS CON MERCADO PAGO ---
@app.post("/api/crear-pago")
def crear_pago(solicitud: SolicitudCompra):
    # Si no hay token configurado, avisamos
    if not MP_ACCESS_TOKEN:
        return {"error": "Pasarela de pagos en mantenimiento."}

    precios = {
        "automatizacion-pro": 150.00,
        "solar-master": 250.00
    }
    precio = precios.get(solicitud.curso_id, 100.00)
    titulo = solicitud.curso_id.replace("-", " ").title()

    preference_data = {
        "items": [
            {
                "id": solicitud.curso_id,
                "title": f"Curso: {titulo}",
                "quantity": 1,
                "currency_id": "PEN",
                "unit_price": precio
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

# Llamamos a Mercado Pago
    preference_response = sdk.preference().create(preference_data)
    preference = preference_response["response"]

    # Devolvemos el LINK de pago al Frontend
    return {"init_point": preference["init_point"]}


@app.post("/api/webhook/mercadopago")
async def recibir_notificacion(request: Request):
    if not MP_ACCESS_TOKEN:
        return {"status": "error", "message": "MP no configurado"}
        
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
                    statement = select(Compra).where(
                        Compra.email == email_usuario, 
                        Compra.curso_id == curso_id
                    )
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
                        print(f"💰 PAGO CONFIRMADO: {email_usuario} - {curso_id}")
                        
        return {"status": "ok"}
    except Exception as e:
        print(f"Error webhook: {e}")
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
        
    aprobado = nota_final >= 13
    return {
        "nota": nota_final,
        "aciertos": puntaje,
        "mensaje": "¡Aprobaste, Felicidades!" if aprobado else "Sigue estudiando."
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