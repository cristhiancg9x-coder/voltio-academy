import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Timer, Save, CheckCircle, XCircle, Loader2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ExamInterface() {
  const [respuestas, setRespuestas] = useState(["", "", ""]);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const certificateRef = useRef(null); // Para el PDF

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          setUserEmail(user.email);
          setUserId(user.id);
      }
    };
    getUser();
  }, []);

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
      // 1. Corregir examen en el cliente
      const claves_correctas = ["A", "B", "A"];
      let puntaje = 0;
      respuestas.forEach((resp, index) => {
          if (resp === claves_correctas[index]) puntaje++;
      });
      const nota_final = Math.round((puntaje / claves_correctas.length) * 20);
      const passed = nota_final >= 13;

      // 2. Guardar en Supabase
      if (userId) {
          const { error } = await supabase
              .from('exam_results')
              .insert({
                  user_id: userId,
                  course_id: "automatizacion-pro", // ID estático para este examen
                  score: nota_final,
                  passed: passed
              });
          if (error) throw error;
      }

      setResultado({
          nota: nota_final,
          aciertos: puntaje,
          mensaje: passed ? "¡Aprobaste, Felicidades!" : "Sigue estudiando."
      });

    } catch (error) {
      console.error("Error guardando examen:", error);
      alert("Hubo un error al registrar el resultado.");
    } finally {
      setLoading(false);
    }
  };

  // --- GENERACIÓN DE CERTIFICADO CLIENT-SIDE ---
  const descargarCertificado = async () => {
      if (!certificateRef.current) return;
      
      const element = certificateRef.current;
      // Hacerlo visible temporalmente para capturarlo (si estuviera oculto)
      element.style.display = 'block'; 

      const canvas = await html2canvas(element, {
          scale: 2, // Mayor calidad
          useCORS: true,
      });

      // Volver a ocultar si se prefiere, aunque aquí se dibuja en pantalla de forma aislada
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'letter');
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Certificado_${userEmail.split('@')[0]}.pdf`);
  };

  // PANTALLA DE RESULTADOS
  if (resultado) {
    return (
      <div className="bg-volt-dark/80 border border-white/10 p-10 rounded-3xl text-center animate-fade-in max-w-2xl mx-auto relative">
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
            {resultado.nota >= 13 && (
                <button 
                     onClick={descargarCertificado}
                     className="w-full py-3 bg-gradient-to-r from-volt-primary to-volt-secondary text-white font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2"
                >
                     <Download className="w-5 h-5" /> Descargar Certificado Oficial
                </button>
            )}

            <button onClick={() => window.location.reload()} className="text-volt-primary hover:underline text-sm">
                Intentar de nuevo
            </button>
        </div>

        {/* --- DISEÑO DEL CERTIFICADO (Oculto o para Renderizar) --- */}
        {resultado.nota >= 13 && (
            <div className="absolute top-0 left-0 -z-50 pointer-events-none" style={{ left: '-9999px' }}>
                <div 
                    ref={certificateRef} 
                    className="w-[1100px] h-[850px] bg-[#0a0a0a] border-[16px] border-volt-secondary relative p-16 flex flex-col items-center justify-center text-center text-white"
                >
                    <div className="absolute top-8 left-8 text-volt-secondary font-bold text-2xl tracking-widest font-display">
                        VOLTIO ACADEMY
                    </div>
                    
                    <div className="mb-8">
                        <CheckCircle className="w-24 h-24 text-volt-primary mx-auto mb-4" />
                        <h1 className="text-5xl font-extrabold font-display leading-tight tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-volt-primary to-volt-secondary">
                            CERTIFICADO DE APROBACIÓN
                        </h1>
                    </div>

                    <p className="text-xl text-slate-400 mb-4">Otorgado con orgullo a:</p>
                    <h2 className="text-6xl font-black text-white font-display mb-8 uppercase px-8 border-y border-white/10 py-4">
                        {userEmail ? userEmail.split('@')[0].toUpperCase() : "ESTUDIANTE"}
                    </h2>

                    <p className="text-lg text-slate-300 max-w-2xl mb-12">
                        Por haber demostrado el dominio de los conceptos esenciales y aprobar satisfactoriamente el examen del simulador técnico de:
                        <br />
                        <span className="text-volt-primary font-bold text-2xl mt-2 inline-block">Módulo de Seguridad Eléctrica - CNE 2025</span>
                    </p>

                    <div className="flex justify-between w-full max-w-3xl mt-12 border-t border-white/5 pt-8">
                        <div className="text-left">
                            <p className="text-slate-500 text-xs">Fecha de emisión:</p>
                            <p className="text-white font-mono text-sm">{new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-500 text-xs">ID de validación:</p>
                            <p className="text-white font-mono text-sm">{Math.random().toString(36).substring(2, 9).toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="absolute bottom-16 flex flex-col items-center">
                        <div className="w-48 border-b border-white/30 mb-2"></div>
                        <p className="text-slate-400 text-xs">Ing. Director General</p>
                        <p className="text-volt-secondary font-bold text-sm">Voltio Academy</p>
                    </div>
                </div>
            </div>
        )}
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