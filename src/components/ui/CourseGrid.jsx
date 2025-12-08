import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Play, Lock, Clock, BarChart, CreditCard, Loader2, AlertCircle } from 'lucide-react';

export default function CourseGrid() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]); // Aquí guardaremos los cursos de la DB
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // Para el estado de carga inicial

  const API_URL = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000';

  // 1. CARGAR DATOS (Usuario, Mis Compras y Catálogo)
  useEffect(() => {
    const init = async () => {
      // A. Obtener Usuario
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      try {
        // B. Obtener Catálogo de Cursos (Desde Python)
        const resCursos = await fetch(`${API_URL}/api/cursos`);
        if (resCursos.ok) {
            const dataCursos = await resCursos.json();
            setCourses(dataCursos);
        }

        // C. Obtener Mis Compras (Solo si hay usuario)
        if (user) {
          const resCompras = await fetch(`${API_URL}/api/mis-cursos/${user.email}`);
          if (resCompras.ok) {
              const purchasedIds = await resCompras.json();
              setMyCourses(purchasedIds);
          }
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setFetching(false);
      }
    };
    init();
  }, []);

  const handleBuy = async (courseId) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    // AVISO DE SIMULACIÓN (Quitar cuando tengas MercadoPago verificado)
    if (!confirm("🚧 MODO PRUEBA: ¿Quieres simular la compra de este curso gratis?")) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/crear-pago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, curso_id: courseId })
      });
      
      const data = await res.json();
      
      // Manejo de respuesta (Simulación o Real)
      if (data.init_point) {
        // Modo Real
        window.location.href = data.init_point; 
      } else if (data.status === 'success' || data.status === 'exists') {
        // Modo Simulación
        alert("¡Compra exitosa! El curso se ha desbloqueado.");
        setMyCourses([...myCourses, courseId]);
      } else {
        alert("Error al procesar el pago.");
      }

    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
      return <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto text-volt-primary" /></div>;
  }

  if (courses.length === 0) {
      return (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <p className="text-slate-400">No hay cursos publicados todavía.</p>
            <p className="text-sm text-slate-600">Ve al panel de admin para crear uno.</p>
        </div>
      );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
      {courses.map((course) => {
        // ¿Está desbloqueado? (Si es gratis O si ya lo compré)
        const isUnlocked = course.es_gratis || myCourses.includes(course.id);

        return (
          <div key={course.id} className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden ${
              !isUnlocked 
              ? 'bg-volt-dark/30 border-white/5' 
              : 'bg-volt-dark/60 border-volt-primary/20 hover:border-volt-primary hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]'
          }`}>
              
              <div className="flex flex-col md:flex-row h-full">
                  {/* Imagen */}
                  <div className="w-full md:w-2/5 h-64 md:h-auto relative overflow-hidden">
           <img
               src={course.imagen || '/images/courses/default.webp'} 
               alt={course.titulo} 
               className={`w-full h-full object-cover ...`} 
               // TRUCO DE SEGURIDAD: Si falla default.jpg, usa la social-image.png
               onError={(e) => {
                  e.target.onerror = null; // Evita bucle infinito
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
                                  {course.nivel}
                              </span>
                              {!isUnlocked && (
                                  <span className="text-volt-secondary text-xs font-bold border border-volt-secondary/50 px-2 py-1 rounded">
                                      S/ {course.precio}
                                  </span>
                              )}
                          </div>

                          <h3 className={`text-xl font-bold mb-2 font-display ${isUnlocked ? 'text-white group-hover:text-volt-primary' : 'text-slate-400'}`}>
                              {course.titulo}
                          </h3>
                          <p className="text-sm text-slate-400 line-clamp-2 mb-4">{course.descripcion}</p>
                      </div>

                      <div className="mt-4">
                          {isUnlocked ? (
                              <a href={`/aula/${course.id}`} className="block w-full py-2 bg-volt-primary text-volt-dark font-bold rounded text-center hover:bg-white transition-colors flex items-center justify-center gap-2">
                                  <Play className="w-4 h-4" /> Entrar al Aula
                              </a>
                          ) : (
                              <button 
                                onClick={() => handleBuy(course.id)}
                                disabled={loading}
                                className="w-full py-2 bg-volt-secondary text-white font-bold rounded flex items-center justify-center gap-2 hover:bg-white hover:text-volt-secondary transition-colors"
                              >
                                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4" /> Comprar Curso</>}
                              </button>
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