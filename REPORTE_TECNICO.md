# Informe Técnico: Voltio Academy

## 1. Resumen General
**Voltio Academy** es una plataforma educativa web diseñada para ofrecer cursos en línea, específicamente enfocados en temas eléctricos ("Seguridad Eléctrica", "Energía Solar", etc.). El sistema permite la gestión de cursos, seguimiento del progreso de los estudiantes, realización de exámenes, generación automática de certificados y procesamiento de pagos.

El proyecto utiliza una arquitectura moderna y separada: un **Frontend** estático/híbrido de alto rendimiento y un **Backend** ligero y rápido basado en Python.

## 2. Tecnologías Utilizadas

### Frontend (Interfaz de Usuario)
Ubicación: Directorio raíz (`/src`, `package.json`)
*   **Astro (v5.x)**: Framework principal. Se elige por su velocidad y capacidad de entregar menos JavaScript al navegador ("Islands Architecture"). Ideal para sitios de contenido como academias.
*   **React (v19.x)**: Biblioteca de UI utilizada para los componentes interactivos dentro de Astro (probablemente reproductores de video, formularios, dashboards de usuario).
*   **Tailwind CSS (v3.x / v4.x alpha)**: Framework de utilidad para estilos. Permite un diseño rápido y responsivo.
*   **Lucide React**: Biblioteca de iconos.
*   **Framer Motion**: Para animaciones fluidas en la interfaz.

### Backend (Lógica del Servidor y API)
Ubicación: `/backend`
*   **Python (v3.x)**: Lenguaje de programación.
*   **FastAPI**: Framework web moderno y de alto rendimiento para construir APIs. Facilita la documentación automática y la validación de datos.
*   **SQLModel**: ORM (Object-Relational Mapper) que combina SQLAlchemy y Pydantic. Se usa para interactuar con la base de datos de manera segura y tipada.
*   **ReportLab**: Librería para generar PDFs dinámicamente. Se usa para crear los **Certificados de Aprobación**.
*   **MercadoPago SDK**: Integración para procesar pagos en línea (Perú/Latam).

### Base de Datos
*   **SQLite / PostgreSQL**: El código (`main.py`) está preparado para usar `DATABASE_URL` (típicamente PostgreSQL en producción) pero parece usar `sqlite:///database.db` localmente por defecto o como fallback.

## 3. Funcionalidades Clave
1.  **Catálogo de Cursos**: Listado público de cursos disponibles.
2.  **Gestión de Contenido (Admin)**: Endpoints para crear cursos, módulos y lecciones.
3.  **Sistema de Pagos**: Flujo completo con MercadoPago (simulación y real) para comprar cursos.
4.  **Aula Virtual**:
    *   Visualización de videos (IDs de YouTube almacenados).
    *   Marcado de progreso (lecciones completadas).
5.  **Evaluación**:
    *   Sistema de exámenes automatizados.
    *   Cálculo de nota inmediato.
6.  **Certificación**:
    *   Generación de PDF descargable al aprobar con nota > 13.

## 4. Análisis de Código y Mejoras Futuras

Para escalar este proyecto y hacerlo más robusto, se recomiendan las siguientes mejoras basadas en el análisis del código actual:

### ⚠️ Prioridad Alta (Seguridad)
*   **Protección de Rutas Admin**: Actualmente, las rutas `/api/admin/...` (crear cursos, listar suscriptores) **no parecen tener autenticación**. Cualquier persona que conozca la URL podría crear o borrar cursos.
    *   *Solución*: Implementar JWT (JSON Web Tokens) o integrar autenticación (ej. Auth0, Supabase Auth o OAuth) y proteger estos endpoints con `Dependencies`.
*   **Validación de Pagos**: Asegurar que los webhooks de MercadoPago verifiquen la firma criptográfica para evitar pagos falsos.

### 🚀 Mejoras de Arquitectura
*   **Migración a Base de Datos Robusta**: Si se planea tener muchos usuarios, asegurar el uso de PostgreSQL en lugar de SQLite para evitar bloqueos de escritura.
*   **Almacenamiento de Videos**: Actualmente se usan IDs de YouTube. Para una academia premium, considerar un host de video privado (Vimeo, Cloudflare Stream, AWS S3) para evitar descargas no autorizadas o anuncios.

### 🛠️ Calidad de Código
*   **Refactorización**: El archivo `main.py` es muy grande (Monolito). Se sugiere dividirlo en varios archivos: `routes/`, `models/`, `services/`, `config/`.
*   **Variables de Entorno**: Asegurar que `MP_ACCESS_TOKEN` y `DATABASE_URL` estén siempre protegidos y no subidos al repositorio (el `.env` actual parece estar excluido, lo cual es correcto, pero hay que verificar en producción).
