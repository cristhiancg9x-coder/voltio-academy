import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, FileText, Lock, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [suscriptores, setSuscriptores] = useState([]);
  const [examenes, setExamenes] = useState([]);

  // TU CORREO DE ADMINISTRADOR (Cámbialo por el tuyo real)
  const ADMIN_EMAIL = "cristhiancg9x@gmail.com"; 
  const API_URL = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Verificamos si el usuario actual es el jefe
      if (user && user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        fetchData();
      } else {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  const fetchData = async () => {
    try {
      // Pedimos datos a Python en paralelo
      const [resSusc, resExam] = await Promise.all([
        fetch(`${API_URL}/api/admin/suscriptores`),
        fetch(`${API_URL}/api/admin/examenes`)
      ]);

      const dataSusc = await resSusc.json();
      const dataExam = await resExam.json();

      setSuscriptores(dataSusc);
      setExamenes(dataExam);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto text-volt-primary" /></div>;

  if (!isAdmin) {
    return (
      <div className="text-center py-20 bg-red-500/10 border border-red-500/30 rounded-2xl max-w-2xl mx-auto">
        <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white">Acceso Restringido</h2>
        <p className="text-slate-400">Esta zona es solo para el personal autorizado de VoltioAcademy.</p>
        <a href="/" className="inline-block mt-6 px-6 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-white">Volver</a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-display font-bold text-white">Panel de Control <span className="text-volt-primary">Admin</span></h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* TARJETA 1: SUSCRIPTORES */}
            <div className="bg-volt-dark/50 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-500/10 rounded-lg"><Users className="w-6 h-6 text-blue-400" /></div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Suscriptores</h3>
                        <p className="text-sm text-slate-400">Total: {suscriptores.length}</p>
                    </div>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {suscriptores.map((sub) => (
                        <div key={sub.id} className="p-3 bg-black/40 rounded-lg border border-white/5 flex justify-between text-sm">
                            <span className="text-slate-300">{sub.email}</span>
                            <span className="text-slate-600">ID: {sub.id}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* TARJETA 2: EXÁMENES */}
            <div className="bg-volt-dark/50 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-green-500/10 rounded-lg"><FileText className="w-6 h-6 text-green-400" /></div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Resultados de Exámenes</h3>
                        <p className="text-sm text-slate-400">Intentos: {examenes.length}</p>
                    </div>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {examenes.map((ex) => (
                        <div key={ex.id} className="p-3 bg-black/40 rounded-lg border border-white/5 flex justify-between items-center text-sm">
                            <div>
                                <p className="text-slate-300 font-bold">{ex.email}</p>
                                <p className="text-xs text-slate-500">{ex.fecha}</p>
                            </div>
                            <span className={`px-3 py-1 rounded font-bold ${ex.nota >= 13 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {ex.nota}/20
                            </span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    </div>
  );
}