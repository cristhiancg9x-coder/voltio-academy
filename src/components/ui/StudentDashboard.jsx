import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Award, BookOpen, Clock, Loader2, LogOut } from 'lucide-react';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setUser(user);

      try {
        // 1. Obtener Cursos Comprados
        const resCompras = await fetch(`${API_URL}/api/mis-cursos/${user.email}`);
        const cursoIds = await resCompras.json();

        // 2. Obtener Detalles de esos Cursos (Título, Progreso)
        // Nota: En un sistema real haríamos un endpoint específico para esto.
        // Aquí simularemos trayendo todos y filtrando para no complicar el backend hoy.
        const resCatalogo = await fetch(`${API_URL}/api/cursos`);
        const todosLosCursos = await resCatalogo.json();
        
        const misCursosData = todosLosCursos.filter(c => cursoIds.includes(c.id) || c.es_gratis);

        // 3. Añadirle el progreso a cada uno (Simulado por ahora o llamada real)
        // Para la V1, mostraremos el acceso directo.
        setCourses(misCursosData);

      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-volt-primary" /></div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      
      {/* HEADER DEL PERFIL */}
      <div className="bg-volt-dark/50 border border-white/10 rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-volt-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-volt-primary to-volt-secondary rounded-full flex items-center justify-center text-3xl font-bold text-black shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                {user?.email[0].toUpperCase()}
            </div>
            <div>
                <h1 className="text-3xl font-display font-bold text-white">Hola, <span className="text-volt-primary">{user?.email.split('@')[0]}</span></h1>
                <p className="text-slate-400">Estudiante de Ingeniería Eléctrica</p>
            </div>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-2 border border-red-500/30 text-red-400 rounded-full hover:bg-red-500/10 transition-colors relative z-10">
            <LogOut className="w-4 h-4" /> Cerrar Sesión
        </button>
      </div>

      {/* SECCIÓN DE CURSOS */}
      <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-2">
          <BookOpen className="text-volt-secondary" /> Mis Cursos Activos
      </h2>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(curso => (
                <div key={curso.id} className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden hover:border-volt-primary/30 transition-all group">
                    <div className="h-40 overflow-hidden relative">
                        <img src={curso.imagen} alt={curso.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    </div>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{curso.titulo}</h3>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> A tu ritmo</span>
                            <span className="bg-volt-primary/10 text-volt-primary px-2 py-0.5 rounded uppercase">{curso.nivel}</span>
                        </div>
                        
                        {/* Barra de Progreso Simulada (Visual) */}
                        <div className="w-full bg-white/10 h-1.5 rounded-full mb-4">
                            <div className="bg-volt-primary h-1.5 rounded-full w-[0%]"></div> {/* Aquí conectaremos el % real luego */}
                        </div>

                        <a href={`/aula/${curso.id}`} className="block w-full py-2 bg-white/5 border border-white/10 text-center text-white rounded-lg hover:bg-volt-primary hover:text-black hover:border-volt-primary transition-all font-bold text-sm">
                            Continuar Aprendiendo
                        </a>
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <p className="text-slate-400 mb-4">Aún no te has inscrito en ningún curso.</p>
            <a href="/cursos" className="text-volt-primary hover:underline">Explorar Catálogo</a>
        </div>
      )}

      {/* SECCIÓN DE CERTIFICADOS */}
      <h2 className="text-2xl font-display font-bold text-white mb-6 mt-16 flex items-center gap-2">
          <Award className="text-yellow-400" /> Mis Certificados
      </h2>
      
      <div className="bg-volt-dark/30 border border-white/5 rounded-2xl p-8 text-center">
          <p className="text-slate-500 text-sm">
            Completa los cursos con nota mayor a 13 para desbloquear tus diplomas oficiales.
            <br/>Aparecerán aquí automáticamente.
          </p>
      </div>

    </div>
  );
}