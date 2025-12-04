import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Play, Lock, Clock, BarChart, CheckCircle, CreditCard, Loader2 } from 'lucide-react';

const coursesData = [
  {
    id: "domiciliaria-1",
    title: "Electricidad Domiciliaria: Nivel 1",
    desc: "Domina las reparaciones básicas y cambios de tomacorrientes.",
    level: "Principiante",
    modules: 12,
    hours: 5,
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop",
    price: 0, // Gratis
    isFree: true
  },
  {
    id: "planos-1",
    title: "Lectura de Planos Eléctricos",
    desc: "Aprende a interpretar diagramas unifilares según el CNE.",
    level: "Intermedio",
    modules: 8,
    hours: 3,
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1000&auto=format&fit=crop",
    price: 0,
    isFree: true
  },
  {
    id: "automatizacion-pro",
    title: "Automatización con Contactores",
    desc: "Lógica cableada para control de motores trifásicos.",
    level: "Avanzado",
    modules: 20,
    hours: 15,
    image: "https://images.unsplash.com/photo-1565514020125-28b3d64024c0?q=80&w=1000&auto=format&fit=crop",
    price: 49.99,
    isFree: false
  },
  {
    id: "solar-master",
    title: "Energía Solar Fotovoltaica",
    desc: "Dimensionamiento de paneles solares y baterías.",
    level: "Experto",
    modules: 15,
    hours: 12,
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1000&auto=format&fit=crop",
    price: 89.99,
    isFree: false
  }
];

export default function CourseGrid() {
  const [user, setUser] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(false); // Para el botón de compra

  const API_URL = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000';

  // 1. Cargar usuario y sus compras al iniciar
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        try {
          const res = await fetch(`${API_URL}/api/mis-cursos/${user.email}`);
          const purchasedIds = await res.json();
          setMyCourses(purchasedIds);
        } catch (err) {
          console.error("Error cargando cursos:", err);
        }
      }
    };
    init();
  }, []);

  // src/components/ui/CourseGrid.jsx

  const handleBuy = async (courseId) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    try {
      // 1. Pedimos el link al backend
      const res = await fetch(`${API_URL}/api/crear-pago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, curso_id: courseId })
      });
      
      const data = await res.json();
      
      // 2. REDIRECCIÓN A MERCADO PAGO
      if (data.init_point) {
        window.location.href = data.init_point; 
      } else {
        alert("Error al generar el pago. Intenta más tarde.");
      }

    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor de pagos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
      {coursesData.map((course) => {
        // ¿Está desbloqueado? (Si es gratis O si ya lo compré)
        const isUnlocked = course.isFree || myCourses.includes(course.id);

        return (
          <div key={course.id} className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden ${
              !isUnlocked 
              ? 'bg-volt-dark/30 border-white/5' 
              : 'bg-volt-dark/60 border-volt-primary/20 hover:border-volt-primary hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]'
          }`}>
              
              <div className="flex flex-col md:flex-row h-full">
                  {/* Imagen */}
                  <div className="w-full md:w-2/5 h-64 md:h-auto relative overflow-hidden">
                      <img src={course.image} alt={course.title} class={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!isUnlocked && 'grayscale'}`} />
                      
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
                              {!isUnlocked && (
                                  <span className="text-volt-secondary text-xs font-bold border border-volt-secondary/50 px-2 py-1 rounded">
                                      ${course.price} USD
                                  </span>
                              )}
                          </div>

                          <h3 className={`text-xl font-bold mb-2 font-display ${isUnlocked ? 'text-white group-hover:text-volt-primary' : 'text-slate-400'}`}>
                              {course.title}
                          </h3>
                      </div>

                      <div className="mt-4">
                          {isUnlocked ? (
                              <button className="w-full py-2 bg-volt-primary text-volt-dark font-bold rounded flex items-center justify-center gap-2 hover:bg-white transition-colors">
                                  <Play className="w-4 h-4" /> Entrar al Aula
                              </button>
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