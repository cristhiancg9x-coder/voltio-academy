import os
import io
import mercadopago # SDK Oficial
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

# Mercado Pago SDK
MP_ACCESS_TOKEN = os.getenv("MP_ACCESS_TOKEN")
# Inicializamos el SDK con el Token (según documentación)
if MP_ACCESS_TOKEN:
    sdk = mercadopago.SDK(MP_ACCESS_TOKEN)
else:
    sdk = None

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

# --- VENTAS (SEGÚN DOCUMENTACIÓN OFICIAL) ---
@app.post("/api/crear-pago")
def crear_pago(solicitud: SolicitudCompra):
    if not sdk:
        return {"error": "Error de configuración en el servidor (Falta Token MP)"}

    # 1. Definir producto
    precios = {
        "automatizacion-pro": 150.00,
        "solar-master": 90.00 # Ajustado a lo que pediste
    }
    precio = precios.get(solicitud.curso_id, 100.00)
    titulo = solicitud.curso_id.replace("-", " ").title()

    # 2. Crear la preferencia (El objeto Preference según la doc)
    preference_data = {
        "items": [
            {
                "id": solicitud.curso_id,
                "title": f"Curso: {titulo}",
                "quantity": 1,
                "currency_id": "PEN", # Soles
                "unit_price": float(precio)
            }
        ],
        "payer": {
            "email": solicitud.email
        },
        # URLs de retorno (A donde vuelve el usuario)
        "back_urls": {
            "success": "https://voltioacademy.lat/cursos",
            "failure": "https://voltioacademy.lat/cursos",
            "pending": "https://voltioacademy.lat/cursos"
        },
        "auto_return": "approved", # Vuelve automático si se aprueba
        # Metadatos para el Webhook (Invisible al usuario)
        "metadata": {
            "user_email": solicitud.email,
            "course_id": solicitud.curso_id
        }
    }

    try:
        # Llamada al SDK
        preference_response = sdk.preference().create(preference_data)
        preference = preference_response["response"]
        
        # Devolvemos el INIT_POINT (El link de pago)
        return {"init_point": preference["init_point"]}
        
    except Exception as e:
        print(f"Error SDK MercadoPago: {e}")
        return {"error": "Fallo al conectar con Mercado Pago"}

# --- WEBHOOK (El notificador) ---
@app.post("/api/webhook/mercadopago")
async def recibir_notificacion(request: Request):
    try:
        # Mercado Pago envía parámetros en la URL (?id=...&topic=payment)
        query_params = request.query_params
        topic = query_params.get("topic") or query_params.get("type")
        payment_id = query_params.get("id") or query_params.get("data.id")

        # Si viene en el cuerpo del mensaje (JSON)
        if not payment_id:
            body = await request.json()
            payment_id = body.get("data", {}).get("id")
            topic = body.get("type")

        if topic == "payment" and payment_id:
            # Consultar estado a Mercado Pago
            payment_info = sdk.payment().get(payment_id)
            payment = payment_info["response"]
            
            if payment["status"] == "approved":
                metadata = payment.get("metadata", {})
                email_usuario = metadata.get("user_email")
                curso_id = metadata.get("course_id")
                monto = payment.get("transaction_amount")
                
                # Guardar compra
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
                        print(f"💰 PAGO EXITOSO: {email_usuario}")
                        
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