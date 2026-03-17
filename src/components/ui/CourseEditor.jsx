import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Video, FolderPlus, PlayCircle, Loader2 } from 'lucide-react';

export default function CourseEditor() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const [newModule, setNewModule] = useState({ title: '', order_index: 1 });
  const [newLesson, setNewLesson] = useState({ module_id: null, title: '', video_id: '', duration: '', order_index: 1 });

  // 1. Load courses
  useEffect(() => {
    supabase.from('courses').select('id, title').eq('is_published', true)
      .then(({ data }) => setCourses(data || []));
  }, []);

  // 2. Load structure when a course is selected
  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    supabase
      .from('modules')
      .select('*, lessons(*)')
      .eq('course_id', selectedCourse)
      .order('order_index')
      .then(({ data }) => {
        const sorted = (data || []).map(mod => ({
          ...mod,
          lessons: (mod.lessons || []).sort((a, b) => a.order_index - b.order_index)
        }));
        setStructure(sorted);
        setLoading(false);
      });
  }, [selectedCourse, refresh]);

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    const { error } = await supabase.from('modules').insert({
      course_id: selectedCourse,
      title: newModule.title,
      order_index: parseInt(newModule.order_index)
    });
    if (!error) {
      setNewModule({ title: '', order_index: newModule.order_index + 1 });
      setRefresh(p => p + 1);
    } else {
      alert(`Error: ${error.message}`);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    const lessonId = newLesson.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const { error } = await supabase.from('lessons').insert({
      id: lessonId,
      module_id: newLesson.module_id,
      title: newLesson.title,
      video_id: newLesson.video_id,
      duration: newLesson.duration,
      order_index: parseInt(newLesson.order_index)
    });
    if (!error) {
      setNewLesson({ ...newLesson, title: '', video_id: '', duration: '', order_index: newLesson.order_index + 1 });
      setRefresh(p => p + 1);
    } else {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="bg-volt-dark/50 border border-white/10 p-6 rounded-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Video className="text-volt-secondary" /> Editor de Contenido
        </h2>

        {/* COURSE SELECTOR */}
        <div className="mb-8">
            <label className="text-xs text-slate-400 block mb-2">Selecciona un curso para editar:</label>
            <select
                className="w-full bg-black/50 border border-white/10 rounded p-3 text-white"
                onChange={(e) => setSelectedCourse(e.target.value)}
                value={selectedCourse || ""}
            >
                <option value="">-- Elige un curso --</option>
                {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                ))}
            </select>
        </div>

        {loading && <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-volt-primary" /></div>}

        {selectedCourse && structure && !loading && (
            <div className="space-y-8">
                
                {/* CREATE MODULE */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <h3 className="text-sm font-bold text-volt-primary mb-3 flex items-center gap-2">
                        <FolderPlus className="w-4 h-4" /> Nuevo Módulo
                    </h3>
                    <form onSubmit={handleCreateModule} className="flex gap-2">
                        <input
                            placeholder="Ej: Módulo 1: Fundamentos"
                            className="flex-1 bg-black/30 border border-white/10 rounded p-2 text-sm text-white"
                            value={newModule.title}
                            onChange={e => setNewModule({...newModule, title: e.target.value})}
                            required
                        />
                        <input
                            type="number" placeholder="Orden" className="w-16 bg-black/30 border border-white/10 rounded p-2 text-sm text-white"
                            value={newModule.order_index}
                            onChange={e => setNewModule({...newModule, order_index: e.target.value})}
                        />
                        <button className="bg-volt-primary text-black px-4 rounded font-bold text-sm hover:bg-white transition-colors">
                            Crear
                        </button>
                    </form>
                </div>

                {/* STRUCTURE VIEWER */}
                <div className="space-y-4">
                    <h3 className="text-white font-bold border-b border-white/10 pb-2">Estructura Actual</h3>
                    {structure.length === 0 && <p className="text-slate-500 text-sm">Este curso está vacío.</p>}

                    {structure.map((mod) => (
                        <div key={mod.id} className="ml-4 border-l-2 border-white/10 pl-4 pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-slate-200 font-bold text-lg">{mod.title}</h4>
                                <button
                                    onClick={() => setNewLesson({...newLesson, module_id: mod.id})}
                                    className="text-xs bg-white/5 px-2 py-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
                                >
                                    + Agregar Lección aquí
                                </button>
                            </div>

                            {newLesson.module_id === mod.id && (
                                <form onSubmit={handleCreateLesson} className="bg-volt-secondary/10 p-3 rounded-lg mb-3 border border-volt-secondary/30">
                                    <p className="text-xs text-volt-secondary mb-2 font-bold">Nueva Lección para: {mod.title}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                        <input placeholder="Título lección" className="bg-black/50 border border-white/10 rounded p-2 text-sm text-white" required
                                            value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} />
                                        <input placeholder="ID Video YouTube (ej: dQw4w9WgXcQ)" className="bg-black/50 border border-white/10 rounded p-2 text-sm text-white" required
                                            value={newLesson.video_id} onChange={e => setNewLesson({...newLesson, video_id: e.target.value})} />
                                    </div>
                                    <div className="flex gap-2">
                                        <input placeholder="Duración (ej: 10:00)" className="w-32 bg-black/50 border border-white/10 rounded p-2 text-sm text-white"
                                            value={newLesson.duration} onChange={e => setNewLesson({...newLesson, duration: e.target.value})} />
                                        <input type="number" placeholder="Orden" className="w-20 bg-black/50 border border-white/10 rounded p-2 text-sm text-white"
                                            value={newLesson.order_index} onChange={e => setNewLesson({...newLesson, order_index: e.target.value})} />
                                        <button className="flex-1 bg-volt-secondary text-white rounded font-bold text-sm hover:bg-white hover:text-black transition-colors">Guardar Lección</button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-1">
                                {mod.lessons.map((less) => (
                                    <div key={less.id} className="flex items-center gap-3 p-2 bg-white/5 rounded hover:bg-white/10 transition-colors">
                                        <PlayCircle className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm text-slate-300 flex-1">{less.title}</span>
                                        <span className="text-xs text-slate-500 font-mono">{less.duration || '–'}</span>
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