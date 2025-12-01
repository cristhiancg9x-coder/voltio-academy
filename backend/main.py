from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Field, SQLModel, create_engine, Session, select

# --- 1. CONFIGURACIÓN DE LA BASE DE DATOS ---
# Esto creará un archivo llamado 'database.db'
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# El motor de la base de datos
engine = create_engine(sqlite_url)

# --- 2. EL MODELO (La forma de los datos) ---
class Suscriptor(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str

# Función para crear las tablas al iniciar
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# --- 3. LA APP ---
app = FastAPI()

# Permisos para que Astro hable con Python (CORS)
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

# Al encender, crea la base de datos si no existe
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# --- 4. RUTAS ---

@app.get("/")
def read_root():
    return {"mensaje": "Backend con Base de Datos Activo 💾"}

@app.get("/api/status")
def check_status():
    return {"sistema": "Python + SQLite", "version": "2.0.0", "estado": "OK"}

@app.post("/api/subscribe")
def suscribir_usuario(suscriptor: Suscriptor):
    with Session(engine) as session:
        # Verificamos si ya existe
        statement = select(Suscriptor).where(Suscriptor.email == suscriptor.email)
        results = session.exec(statement)
        usuario_existente = results.first()
        
        if usuario_existente:
            print(f"⚠️ {suscriptor.email} ya estaba registrado.")
            return {"mensaje": "Ya estás suscrito."}

        # Guardamos el nuevo
        session.add(suscriptor)
        session.commit()
        session.refresh(suscriptor)
        
        print(f"✅ GUARDADO EN DB: {suscriptor.email}")
        return {"mensaje": "Guardado exitosamente"}