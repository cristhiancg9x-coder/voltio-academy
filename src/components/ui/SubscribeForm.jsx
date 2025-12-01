// src/components/ui/SubscribeForm.jsx
import { useState } from 'react';
import { Mail, Loader2, CheckCircle } from 'lucide-react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // LÓGICA INTELIGENTE:
  // Si existe una variable de entorno (en Vercel), úsala. Si no, usa localhost.
  const API_URL = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Usamos la URL dinámica
      const response = await fetch(`${API_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      });

      if (response.ok) {
        setSuccess(true);
        setEmail('');
      } else {
        // Si el backend responde con error (ej: "Ya estás suscrito")
        const data = await response.json();
        alert(data.mensaje || "Hubo un error al suscribirse.");
      }

    } catch (error) {
      console.error("Error de conexión:", error);
      alert("El servidor parece estar desconectado o no responde.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center animate-fade-in">
        <div className="flex justify-center mb-2">
            <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <p className="text-green-400 font-bold text-sm">¡Suscrito correctamente!</p>
        <p className="text-slate-400 text-xs mt-1">Revisa tu bandeja pronto.</p>
        <button onClick={() => setSuccess(false)} className="text-xs text-slate-500 underline mt-2 hover:text-white">
            Suscribir otro correo
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
            <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com" 
                className="w-full bg-black/50 border border-slate-700 rounded-lg py-2 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-volt-primary focus:ring-1 focus:ring-volt-primary transition-all disabled:opacity-50"
                disabled={loading}
            />
            <Mail className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
        </div>
        <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 bg-volt-primary/10 border border-volt-primary/50 text-volt-primary rounded-lg text-sm font-bold hover:bg-volt-primary hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "SUSCRIBIRSE"}
        </button>
    </form>
  );
}