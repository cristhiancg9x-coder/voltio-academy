import { useState, useEffect } from 'react';
import { Plus, Video, FolderPlus, Save, ChevronDown, ChevronRight, PlayCircle } from 'lucide-react';

export default function CourseEditor() {
  const API_URL = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000';
  
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [structure, setStructure] = useState(null); // La estructura actual del curso
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0); // Para forzar recarga

  // Formularios temporales
  const [newModule, setNewModule] = useState({ titulo: '', orden: 1 });
  const [newLesson, setNewLesson] = useState({ modulo_id: null, titulo: '', video_id: '', duracion: '', orden: 1 });

  // 1. Cargar lista de cursos al inicio
  useEffect(() => {
    fetch(`${API_URL}/api/cursos`)
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error(err));
  }, []);

  // 2. Cargar estructura cuando seleccionas un curso
  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    fetch(`${API_URL}/api/curso/${selectedCourse}/completo`)
      .then(res => res.json())
      .then(data => {
          setStructure(data);
          setLoading(false);
      });
  }, [selectedCourse, refresh]);

  // --- ACCIONES ---

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
        const res = await fetch(`${API_URL}/api/admin/crear-modulo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                curso_id: selectedCourse,
                titulo: newModule.titulo,
                orden: parseInt(newModule.orden)
            })
        });
        if(res.ok) {
            alert("Módulo creado");
            setNewModule({ titulo: '', orden: newModule.orden + 1 });
            setRefresh(prev => prev + 1); // Recargar estructura
        }
    } catch (error) { console.error(error); }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    // Generamos un ID único para la lección basado en el título
    const lessonId = newLesson.titulo.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

    try {
        const res = await fetch(`${API_URL}/api/admin/crear-leccion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: lessonId,
                modulo_id: newLesson.modulo_id,
                titulo: newLesson.titulo,
                video_id: newLesson.video_id,
                duracion: newLesson.duracion,
                orden: parseInt(newLesson.orden)
            })
        });
        if(res.ok) {
            alert("Lección agregada");
            setNewLesson({ ...newLesson, titulo: '', video_id: '', duracion: '', orden: newLesson.orden + 1 });
            setRefresh(prev => prev + 1);
        }
    } catch (error) { console.error(error); }
  };

  return (
    <div className="bg-volt-dark/50 border border-white/10 p-6 rounded-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Video className="text-volt-secondary" /> Editor de Contenido
        </h2>

        {/* SELECTOR DE CURSO */}
        <div className="mb-8">
            <label className="text-xs text-slate-400 block mb-2">Selecciona un curso para editar:</label>
            <select 
                className="w-full bg-black/50 border border-white/10 rounded p-3 text-white"
                onChange={(e) => setSelectedCourse(e.target.value)}
                value={selectedCourse || ""}
            >
                <option value="">-- Elige un curso --</option>
                {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.titulo}</option>
                ))}
            </select>
        </div>

        {selectedCourse && structure && (
            <div className="space-y-8">
                
                {/* 1. CREAR NUEVO MÓDULO */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <h3 className="text-sm font-bold text-volt-primary mb-3 flex items-center gap-2">
                        <FolderPlus className="w-4 h-4" /> Nuevo Módulo
                    </h3>
                    <form onSubmit={handleCreateModule} className="flex gap-2">
                        <input 
                            placeholder="Ej: Módulo 1: Fundamentos" 
                            className="flex-1 bg-black/30 border border-white/10 rounded p-2 text-sm text-white"
                            value={newModule.titulo}
                            onChange={e => setNewModule({...newModule, titulo: e.target.value})}
                            required
                        />
                        <input 
                            type="number" placeholder="Orden" className="w-16 bg-black/30 border border-white/10 rounded p-2 text-sm text-white"
                            value={newModule.orden}
                            onChange={e => setNewModule({...newModule, orden: e.target.value})}
                        />
                        <button className="bg-volt-primary text-black px-4 rounded font-bold text-sm hover:bg-white transition-colors">
                            Crear
                        </button>
                    </form>
                </div>

                {/* 2. VISUALIZADOR DE ESTRUCTURA Y AGREGAR LECCIONES */}
                <div className="space-y-4">
                    <h3 className="text-white font-bold border-b border-white/10 pb-2">Estructura Actual</h3>
                    
                    {structure.modules.length === 0 && <p className="text-slate-500 text-sm">Este curso está vacío.</p>}

                    {structure.modules.map((mod) => (
                        <div key={mod.id} className="ml-4 border-l-2 border-white/10 pl-4 pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-slate-200 font-bold text-lg">{mod.title}</h4>
                                <button 
                                    onClick={() => setNewLesson({...newLesson, modulo_id: mod.id})}
                                    className="text-xs bg-white/5 px-2 py-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
                                >
                                    + Agregar Lección aquí
                                </button>
                            </div>

                            {/* Formulario de Lección (Solo aparece si seleccionas este módulo) */}
                            {newLesson.modulo_id === mod.id && (
                                <form onSubmit={handleCreateLesson} className="bg-volt-secondary/10 p-3 rounded-lg mb-3 border border-volt-secondary/30 animate-fade-in">
                                    <p className="text-xs text-volt-secondary mb-2 font-bold">Nueva Lección para: {mod.title}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                        <input placeholder="Título lección" className="bg-black/50 border border-white/10 rounded p-2 text-sm text-white" required 
                                            value={newLesson.titulo} onChange={e => setNewLesson({...newLesson, titulo: e.target.value})} />
                                        <input placeholder="ID Video YouTube (ej: dQw4w9WgXcQ)" className="bg-black/50 border border-white/10 rounded p-2 text-sm text-white" required 
                                            value={newLesson.video_id} onChange={e => setNewLesson({...newLesson, video_id: e.target.value})} />
                                    </div>
                                    <div className="flex gap-2">
                                        <input placeholder="Duración (ej: 10:00)" className="w-32 bg-black/50 border border-white/10 rounded p-2 text-sm text-white" 
                                            value={newLesson.duracion} onChange={e => setNewLesson({...newLesson, duracion: e.target.value})} />
                                        <input type="number" placeholder="Orden" className="w-20 bg-black/50 border border-white/10 rounded p-2 text-sm text-white" 
                                            value={newLesson.orden} onChange={e => setNewLesson({...newLesson, orden: e.target.value})} />
                                        <button className="flex-1 bg-volt-secondary text-white rounded font-bold text-sm hover:bg-white hover:text-black transition-colors">Guardar Lección</button>
                                    </div>
                                </form>
                            )}

                            {/* Lista de lecciones existentes */}
                            <div className="space-y-1">
                                {mod.lessons.map((less) => (
                                    <div key={less.id} className="flex items-center gap-3 p-2 bg-white/5 rounded hover:bg-white/10 transition-colors">
                                        <PlayCircle className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm text-slate-300 flex-1">{less.titulo}</span>
                                        <span className="text-xs text-slate-500 font-mono">{less.duracion}</span>
                                    </div>
                                ))}
                                {mod.lessons.length === 0 && <p className="text-xs text-slate-600 italic ml-2">Sin lecciones aún.</p>}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        )}
    </div>
  );
}