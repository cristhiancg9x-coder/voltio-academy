import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificamos si ya aceptó las cookies antes
    const consent = localStorage.getItem('voltio_cookie_consent');
    if (!consent) {
      // Si no hay rastro, mostramos el banner después de 1 segundo
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    // Guardamos la decisión en la memoria del navegador
    localStorage.setItem('voltio_cookie_consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-0 left-0 w-full z-[60] p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-volt-dark/95 backdrop-blur-xl border border-volt-primary/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center gap-6">
            
            {/* Icono y Texto */}
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 bg-volt-primary/10 rounded-full border border-volt-primary/30 shrink-0">
                <Cookie className="w-6 h-6 text-volt-primary" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">Nos importan tus datos</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Usamos cookies para mejorar tu experiencia en VoltioAcademy y analizar el tráfico. 
                  Al continuar navegando, aceptas nuestra <a href="/cookies" className="text-volt-primary hover:underline">Política de Cookies</a>.
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={handleAccept}
                className="flex-1 md:flex-none px-6 py-3 bg-volt-primary text-black font-bold rounded-xl hover:bg-white transition-all shadow-lg shadow-volt-primary/20 whitespace-nowrap"
              >
                Aceptar todo
              </button>
              <button 
                onClick={() => setIsVisible(false)}
                className="p-3 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}