from sqlmodel import SQLModel, create_engine
from dotenv import load_dotenv
import os

# Importamos todos los modelos para que SQLModel los conozca
# (Asegúrate de que main.py esté en la misma carpeta)
from main import Curso, Modulo, Leccion, Suscriptor, ExamenResultado, Compra

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

def init_db():
    print("🔄 Conectando a Supabase...")
    print("🛠️  Creando tablas faltantes...")
    SQLModel.metadata.create_all(engine)
    print("✅ ¡Tablas creadas con éxito!")

if __name__ == "__main__":
    init_db()