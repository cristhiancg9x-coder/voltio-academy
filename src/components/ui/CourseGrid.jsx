import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Play, Lock, Loader2, UserPlus } from 'lucide-react';

export default function CourseGrid() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const init = async () => {
      // 1. Check Auth state
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      try {
        // 2. Fetch courses from Supabase
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('is_published', true);
            
        if (error) throw error;
        setCourses(data || []);
      } catch (err) {
        console.error("Error cargando cursos:", err);
      } finally {
        setFetching(false);
      }
    };
    init();
  }, []);

  if (fetching) {
      return <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto text-volt-primary" /></div>;
  }

  if (courses.length === 0) {
      return (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <p className="text-slate-400">No hay cursos publicados todavía.</p>
        </div>
      );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
      {courses.map((course) => {
        // En el nuevo modelo, si estás logueado, tienes acceso a todo
        const isUnlocked = !!user;

        return (
          <div key={course.id} className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden ${
              !isUnlocked 
              ? 'bg-volt-dark/30 border-white/5' 
              : 'bg-volt-dark/60 border-volt-primary/20 hover:border-volt-primary hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]'
          }`}>
              
              <div className="flex flex-col md:flex-row h-full">
                  {/* Image */}
                  <div className="w-full md:w-2/5 h-64 md:h-auto relative overflow-hidden">
                      <img
                          src={course.image_url || '/images/courses/default.webp'} 
                          alt={course.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          onError={(e) => {
                              e.target.onerror = null; 
                              e.target.src = '/social-image.png';
                          }}
                      />
                      
                      {!isUnlocked && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                              <Lock className="w-10 h-10 text-slate-400" />
                          </div>
                      )}
                  </div>

                  {/* Info */}
                  <div className="p-6 md:w-3/5 flex flex-col justify-between">
                      <div>
                          <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold px-2 py-1 rounded uppercase bg-white/5 text-slate-300">
                                  {course.level}
                              </span>
                              <span className="text-volt-secondary text-xs font-bold border border-volt-secondary/50 px-2 py-1 rounded whitespace-nowrap">
                                  GRATIS (Con Ads)
                              </span>
                          </div>

                          <h3 className={`text-xl font-bold mb-2 font-display ${isUnlocked ? 'text-white group-hover:text-volt-primary' : 'text-slate-400'}`}>
                              {course.title}
                          </h3>
                          <p className="text-sm text-slate-400 line-clamp-2 mb-4">{course.description}</p>
                      </div>

                      <div className="mt-4">
                          {isUnlocked ? (
                              <a href={`/aula/${course.id}`} className="block w-full py-2 bg-volt-primary text-volt-dark font-bold rounded text-center hover:bg-white transition-colors flex items-center justify-center gap-2">
                                  <Play className="w-4 h-4" /> Entrar al Aula
                              </a>
                          ) : (
                              <a 
                                href="/registro"
                                className="block w-full py-2 bg-volt-secondary text-white font-bold rounded flex items-center justify-center gap-2 hover:bg-white hover:text-volt-secondary transition-colors"
                              >
                                  <UserPlus className="w-4 h-4" /> Regístrate para ver
                              </a>
                          )}
                      </div>
                  </div>
              </div>
          </div>
        );
      })}
    </div>
  );
}