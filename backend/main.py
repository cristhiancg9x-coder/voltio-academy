import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Field, SQLModel, create_engine, Session, select
from dotenv import load_dotenv

# 1. CARGAR VARIABLES DE ENTORNO
# Esto busca el archivo .env si estamos en local
load_dotenv()

# 2. CONFIGURACIÓN DE LA BASE DE DATOS
# Leemos la URL secreta desde el entorno. Si no existe, da error.
DATABASE_URL = os.getenv("DATABASE_URL")

# Corrección para Supabase: SQLAlchemy necesita que empiece con postgresql://
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Creamos el motor de conexión
engine = create_engine(DATABASE_URL)

# --- 3. EL MODELO (Igual que antes) ---
class Suscriptor(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# --- 4. LA APP ---
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

# --- 5. RUTAS ---

@app.get("/")
def read_root():
    return {"mensaje": "Backend VoltioAcademy: Conectado a PostgreSQL 🐘"}

@app.get("/api/status")
def check_status():
    return {"sistema": "API Real", "db": "PostgreSQL", "estado": "OK"}

@app.post("/api/subscribe")
def suscribir_usuario(suscriptor: Suscriptor):
    with Session(engine) as session:
        statement = select(Suscriptor).where(Suscriptor.email == suscriptor.email)
        results = session.exec(statement)
        if results.first():
            return {"mensaje": "Este correo ya está registrado en la nube."}

        session.add(suscriptor)
        session.commit()
        session.refresh(suscriptor)
        print(f"🚀 GUARDADO EN SUPABASE: {suscriptor.email}")
        return {"mensaje": "Suscripción exitosa y guardada en la nube."}