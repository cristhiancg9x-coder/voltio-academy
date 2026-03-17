import { useEffect } from 'react';

export default function AdBanner({ slot = "default", className = "" }) {
  useEffect(() => {
    // Aquí iría la carga de scripts de Ads (Google AdSense, etc.)
    // Ejemplo:
    // try {
    //   (window.adsbygoogle = window.adsbygoogle || []).push({});
    // } catch (e) {
    //   console.error(e);
    // }
  }, []);

  return (
    <div className={`my-6 mx-auto w-full max-w-4xl p-1 bg-gradient-to-r from-volt-primary/10 via-white/5 to-volt-secondary/10 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden ${className}`}>
        <div className="bg-volt-dark/80 rounded-xl p-4 flex flex-col items-center justify-center min-h-[120px] relative">
            <span className="absolute top-2 right-2 text-[10px] uppercase font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded">
                Patrocinado
            </span>
            
            <div className="text-center">
                <p className="text-slate-400 text-sm mb-1">Espacio Publicitario disponible</p>
                <div className="h-12 flex items-center justify-center">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-volt-primary to-volt-secondary font-bold text-xl font-display">
                        Voltio Academy Ads
                    </span>
                </div>
                <p className="text-slate-500 text-xs">Aprende más sobre nuestros patrocinadores</p>
            </div>
        </div>
    </div>
  );
}
