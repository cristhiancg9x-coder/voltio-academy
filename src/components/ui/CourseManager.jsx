import { useState } from 'react';
import { Plus, Save, Layers, Video } from 'lucide-react';

export default function CourseManager() {
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000';

  // Estado del formulario
  const [formData, setFormData] = useState({
    id: '',
    titulo: '',
    descripcion: '',
    imagen: '/images/courses/default.jpg',
    nivel: 'Principiante',
    precio: 0,
    es_gratis: false
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const crearCurso = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/crear-curso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("¡Curso creado con éxito!");
        // Aquí podrías limpiar el form o redirigir
      } else {
        alert("Error al crear curso");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-volt-dark/50 border border-white/10 p-8 rounded-2xl max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Layers className="text-volt-primary" /> Crear Nuevo Curso
        </h2>

        <form onSubmit={crearCurso} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-slate-400 block mb-1">ID del Curso (Slug)</label>
                    <input name="id" onChange={handleChange} placeholder="ej: solar-2025" className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm" required />
                </div>
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Nivel</label>
                    <select name="nivel" onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm">
                        <option>Principiante</option>
                        <option>Intermedio</option>
                        <option>Avanzado</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="text-xs text-slate-400 block mb-1">Título</label>
                <input name="titulo" onChange={handleChange} placeholder="Título del curso" className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" required />
            </div>

            <div>
                <label className="text-xs text-slate-400 block mb-1">Descripción</label>
                <textarea name="descripcion" onChange={handleChange} placeholder="¿De qué trata?" className="w-full bg-black/50 border border-white/10 rounded p-2 text-white h-20" required />
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Precio (S/)</label>
                    <input name="precio" type="number" onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                </div>
                <div className="flex items-center gap-2 mt-4">
                    <input name="es_gratis" type="checkbox" onChange={handleChange} className="w-4 h-4 accent-volt-primary" />
                    <label className="text-sm text-white">¿Es Gratis?</label>
                </div>
            </div>

            <button disabled={loading} className="w-full bg-volt-primary text-black font-bold py-3 rounded-lg hover:bg-white transition-colors mt-4">
                {loading ? "Guardando..." : "Crear Curso"}
            </button>

        </form>
    </div>
  );
}