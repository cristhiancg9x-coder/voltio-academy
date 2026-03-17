import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PlayCircle, CheckCircle, Circle, Lock, Menu, FileText, Download, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti'; 
import AdBanner from './AdBanner';

export default function VideoPlayer({ courseData, courseId }) {
  const [currentModule, setCurrentModule] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Estado del usuario y progreso
  const [user, setUser] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Calcular total de lecciones del curso
  const totalLessons = courseData.modules.reduce((acc, mod) => acc + (mod.lessons ? mod.lessons.length : 0), 0);
  // Calcular porcentaje
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

  // 1. Cargar datos iniciales
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        try {
            const { data, error } = await supabase
                .from('user_progress')
                .select('lesson_id')
                .eq('user_id', user.id)
                .eq('course_id', courseId);
                
            if (error) throw error;
            if (data) {
                setCompletedLessons(data.map(p => p.lesson_id));
            }
        } catch (e) {
            console.error("Error cargando progreso:", e);
        }
      }
      setLoading(false);
    };
    init();
  }, [courseId]);

  // Función para marcar/desmarcar
  const toggleLesson = async (lessonId) => {
    if (!user) return;

    const isCompleted = completedLessons.includes(lessonId);
    let newCompleted = [];
    
    if (isCompleted) {
        newCompleted = completedLessons.filter(id => id !== lessonId);
        await supabase
            .from('user_progress')
            .delete()
            .eq('user_id', user.id)
            .eq('lesson_id', lessonId);
    } else {
        newCompleted = [...completedLessons, lessonId];
        if (newCompleted.length === totalLessons) confetti(); 
        await supabase
            .from('user_progress')
            .insert({
                user_id: user.id,
                course_id: courseId,
                lesson_id: lessonId
            });
    }
    setCompletedLessons(newCompleted);
  };

  const activeModule = courseData.modules[currentModule];
  const activeLesson = activeModule && activeModule.lessons ? activeModule.lessons[currentLesson] : null;

  if (!activeLesson) {
      return <div className="text-white p-8">No hay lecciones disponibles.</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
      
      {/* ZONA 1: VIDEO */}
      <div className="flex-1 flex flex-col bg-black relative overflow-y-auto">
        <div className="aspect-video relative flex items-center justify-center bg-black">
            <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${activeLesson.video_id}?autoplay=1&rel=0&modestbranding=1`} 
                title={activeLesson.title}
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full"
            ></iframe>
        </div>

        <div className="p-6 bg-volt-dark border-t border-white/10 flex flex-col justify-between items-start gap-4">
            <div className="w-full flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white font-display mb-2">{activeLesson.title}</h1>
                    <div className="flex items-center gap-4 flex-wrap">
                        <p className="text-slate-400 text-sm flex items-center gap-2">
                            <FileText className="w-4 h-4" /> 
                            Módulo: {activeModule.title}
                        </p>
                        <button 
                            onClick={() => toggleLesson(activeLesson.id)}
                            className={`flex items-center gap-2 text-sm font-bold px-3 py-1 rounded-full transition-colors border ${
                                completedLessons.includes(activeLesson.id)
                                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30'
                            }`}
                        >
                            {completedLessons.includes(activeLesson.id) ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                            {completedLessons.includes(activeLesson.id) ? 'Completada' : 'Marcar como vista'}
                        </button>
                    </div>
                </div>
                
                <div className="flex gap-3">
                     <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden p-2 bg-white/10 rounded-lg text-white"
                     >
                        <Menu />
                     </button>
                     <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-volt-primary/10 text-volt-primary border border-volt-primary/50 rounded-lg hover:bg-volt-primary hover:text-black transition-all font-bold text-sm">
                        <Download className="w-4 h-4" /> Recursos
                     </button>
                </div>
            </div>

            {/* AD BANNER AQUÍ (Abajo del título) */}
            <div className="w-full mt-4">
                <AdBanner />
            </div>
        </div>
      </div>

      {/* ZONA 2: SIDEBAR DE PROGRESO */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-80 bg-[#111] border-l border-white/10 transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        
        {/* HEADER SIDEBAR: BARRA DE PROGRESO */}
        <div className="p-5 border-b border-white/10 bg-[#161616]">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-white text-sm">Tu Progreso</h3>
                <span className="text-volt-primary text-xs font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                    className="bg-gradient-to-r from-volt-primary to-volt-secondary h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 absolute top-5 right-5"><Lock className="w-4 h-4"/></button>
        </div>

        {/* LISTA DE LECCIONES */}
        <div className="overflow-y-auto flex-1 pb-20">
            {courseData.modules.map((module, modIndex) => (
                <div key={modIndex} className="mb-1">
                    <div className="px-5 py-3 bg-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest sticky top-0 backdrop-blur-md z-10 border-b border-white/5">
                        {module.title}
                    </div>
                    <div>
                        {module.lessons && module.lessons.map((lesson, lessIndex) => {
                            const isActive = modIndex === currentModule && lessIndex === currentLesson;
                            const isCompleted = completedLessons.includes(lesson.id);

                            return (
                                <div key={lesson.id} className={`flex group relative ${isActive ? 'bg-white/5' : ''}`}>
                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-volt-primary"></div>}

                                    <button
                                        onClick={() => {
                                            setCurrentModule(modIndex);
                                            setCurrentLesson(lessIndex);
                                        }}
                                        className="flex-1 text-left px-4 py-3 flex gap-3 items-start transition-all hover:bg-white/5"
                                    >
                                        <div className="mt-0.5 text-slate-500">
                                            <PlayCircle className={`w-4 h-4 ${isActive ? 'text-volt-primary' : ''}`} />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium leading-snug ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                {lesson.title}
                                            </p>
                                            <span className="text-[10px] text-slate-600 font-mono mt-1 block">{lesson.duration || '00:00'}</span>
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => toggleLesson(lesson.id)}
                                        className="px-4 flex items-center justify-center hover:bg-white/10 transition-colors"
                                        title={isCompleted ? "Marcar como no vista" : "Marcar como vista"}
                                    >
                                        {isCompleted 
                                            ? <CheckCircle className="w-5 h-5 text-green-500" />
                                            : <Circle className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
                                        }
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
        
        {/* Footer del Sidebar: Certificado */}
        {progressPercent === 100 && (
            <div className="p-4 border-t border-white/10 bg-green-500/10">
                <button className="w-full py-2 bg-green-500 text-black font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20">
                    <Trophy className="w-4 h-4" /> Reclamar Certificado
                </button>
            </div>
        )}

      </div>
    </div>
  );
}