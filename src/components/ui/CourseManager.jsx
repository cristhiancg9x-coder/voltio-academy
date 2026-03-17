import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Layers, Loader2 } from 'lucide-react';

export default function CourseManager() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    image_url: '/images/courses/default.webp',
    level: 'Principiante',
    is_free: true,
    is_published: true,
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const crearCurso = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('courses').insert(formData);
      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 p-8 rounded-2xl text-center">
        <h3 className="text-2xl font-bold text-green-400 mb-2">¡Curso creado!</h3>
        <p className="text-slate-300 mb-4">El curso ya está disponible en la base de datos.</p>
        <button onClick={() => setSuccess(false)} className="px-6 py-2 bg-volt-primary text-black font-bold rounded-lg">Crear otro</button>
      </div>
    );
  }

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
                    <select name="level" onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm">
                        <option>Principiante</option>
                        <option>Intermedio</option>
                        <option>Avanzado</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="text-xs text-slate-400 block mb-1">Título</label>
                <input name="title" onChange={handleChange} placeholder="Título del curso" className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" required />
            </div>

            <div>
                <label className="text-xs text-slate-400 block mb-1">Descripción</label>
                <textarea name="description" onChange={handleChange} placeholder="¿De qué trata?" className="w-full bg-black/50 border border-white/10 rounded p-2 text-white h-20" required />
            </div>

            <div>
                <label className="text-xs text-slate-400 block mb-1">URL de Imagen (opcional)</label>
                <input name="image_url" onChange={handleChange} defaultValue="/images/courses/default.webp" className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm" />
            </div>

            <button disabled={loading} className="w-full bg-volt-primary text-black font-bold py-3 rounded-lg hover:bg-white transition-colors mt-4 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear Curso"}
            </button>
        </form>
    </div>
  );
}