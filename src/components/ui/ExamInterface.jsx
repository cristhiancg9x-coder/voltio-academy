import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Timer, Save, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ExamInterface() {
  const [respuestas, setRespuestas] = useState(["", "", ""]);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  // URL INTELIGENTE
  const API_URL = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email);
    };
    getUser();
  }, []);

  // --- FUNCIÓN MOVIDA AQUÍ PARA EVITAR ERRORES ---
  const descargarCertificado = () => {
    if (!userEmail) return;
    const nombreParaDiploma = userEmail.split('@')[0];
    window.open(`${API_URL}/api/certificado/${nombreParaDiploma}`, '_blank');
  };
  // ---------------------------------------------

  const handleSelect = (preguntaIndex, opcion) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaIndex] = opcion;
    setRespuestas(nuevasRespuestas);
  };

  const handleSubmit = async () => {
    if (respuestas.includes("")) {
      alert("Por favor, responde todas las preguntas.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/examen/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          respuestas: respuestas
        })
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      setResultado(data);

    } catch (error) {
      console.error("Error detallado:", error);
      alert("Error al enviar el examen. Verifica que el Backend esté encendido.");
    } finally {
      setLoading(false);
    }
  };

  // PANTALLA DE RESULTADOS
  if (resultado) {
    return (
      <div className="bg-volt-dark/80 border border-white/10 p-10 rounded-3xl text-center animate-fade-in max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
            {resultado.nota >= 13 
                ? <CheckCircle className="w-20 h-20 text-green-500" />
                : <XCircle className="w-20 h-20 text-red-500" />
            }
        </div>
        <h2 className="text-4xl font-display font-bold text-white mb-2">Nota: {resultado.nota} / 20</h2>
        <p className="text-xl text-slate-300 mb-8">{resultado.mensaje}</p>
        
        <div className="p-4 bg-white/5 rounded-xl inline-block mb-8">
            <p className="text-sm text-slate-400">Aciertos: <span className="text-white font-bold">{resultado.aciertos} de 3</span></p>
        </div>

        <div className="flex flex-col gap-4">
            {/* BOTÓN DE DESCARGA */}
            {resultado.nota >= 13 && (
                <button 
                    onClick={descargarCertificado}
                    className="w-full py-3 bg-gradient-to-r from-volt-primary to-volt-secondary text-white font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2"
                >
                    📜 Descargar Certificado Oficial
                </button>
            )}

            <button onClick={() => window.location.reload()} className="text-volt-primary hover:underline text-sm">
                Intentar de nuevo
            </button>
        </div>
      </div>
    );
  }

  // PANTALLA DEL EXAMEN
  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-volt-dark/50 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
            <div>
                <h1 className="text-2xl font-bold text-white font-display mb-1">Simulador CNE 2025</h1>
                <p className="text-slate-400 text-sm">Usuario: {userEmail}</p>
            </div>
            <div className="flex items-center gap-2 text-volt-primary bg-volt-primary/10 px-4 py-2 rounded-lg border border-volt-primary/30 mt-4 md:mt-0">
                <Timer className="w-5 h-5" />
                <span className="font-mono font-bold">45:00</span>
            </div>
        </div>

        {/* PREGUNTAS */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-8 mb-6">
            <h3 className="text-lg text-white font-bold mb-6">1. Según el CNE, ¿cuál es la altura mínima para un tomacorriente en cocina?</h3>
            <div className="space-y-3">
                {['A', 'B', 'C'].map((opcion, index) => (
                    <label key={opcion} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${respuestas[0] === opcion ? 'border-volt-primary bg-volt-primary/10' : 'border-white/5 hover:bg-white/5'}`}>
                        <input type="radio" name="p1" className="accent-volt-primary" onChange={() => handleSelect(0, opcion)} />
                        <span className="text-slate-300">
                            {index === 0 && "0.30 m sobre el nivel del piso terminado."}
                            {index === 1 && "1.10 m sobre el nivel del piso terminado."}
                            {index === 2 && "No existe altura mínima."}
                        </span>
                    </label>
                ))}
            </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-2xl p-8 mb-6">
            <h3 className="text-lg text-white font-bold mb-6">2. ¿Qué color identifica al conductor de protección a tierra?</h3>
            <div className="space-y-3">
                {['A', 'B', 'C'].map((opcion, index) => (
                    <label key={opcion} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${respuestas[1] === opcion ? 'border-volt-primary bg-volt-primary/10' : 'border-white/5 hover:bg-white/5'}`}>
                        <input type="radio" name="p2" className="accent-volt-primary" onChange={() => handleSelect(1, opcion)} />
                        <span className="text-slate-300">
                            {index === 0 && "Negro."}
                            {index === 1 && "Verde o Verde con franja Amarilla."}
                            {index === 2 && "Blanco."}
                        </span>
                    </label>
                ))}
            </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-2xl p-8 mb-6">
            <h3 className="text-lg text-white font-bold mb-6">3. ¿Qué dispositivo protege contra sobrecargas?</h3>
            <div className="space-y-3">
                {['A', 'B', 'C'].map((opcion, index) => (
                    <label key={opcion} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${respuestas[2] === opcion ? 'border-volt-primary bg-volt-primary/10' : 'border-white/5 hover:bg-white/5'}`}>
                        <input type="radio" name="p3" className="accent-volt-primary" onChange={() => handleSelect(2, opcion)} />
                        <span className="text-slate-300">
                            {index === 0 && "Interruptor Termomagnético."}
                            {index === 1 && "Interruptor Diferencial."}
                            {index === 2 && "Contactor."}
                        </span>
                    </label>
                ))}
            </div>
        </div>

        <div className="text-right">
            <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-volt-primary text-black font-bold rounded-lg hover:bg-white transition-colors flex items-center gap-2 ml-auto disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Finalizar Intento</>}
            </button>
        </div>
    </div>
  );
}