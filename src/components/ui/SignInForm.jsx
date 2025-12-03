import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Pedimos entrar
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 2. Si es correcto, redirigimos a la home o al dashboard
      window.location.href = "/"; 

    } catch (err) {
      setError("Correo o contraseña incorrectos."); // Mensaje genérico por seguridad
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-volt-dark/50 border border-white/10 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md mx-auto shadow-2xl">
        
        <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-volt-secondary/10 rounded-full border border-volt-secondary/30 mb-4">
                <LogIn className="w-6 h-6 text-volt-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-white font-display">Iniciar Sesión</h2>
            <p className="text-slate-400 text-sm mt-2">Bienvenido de nuevo, colega.</p>
        </div>

        {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-6 flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
            </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Correo</label>
                <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-volt-secondary focus:ring-1 focus:ring-volt-secondary outline-none transition-all"
                    placeholder="tu@email.com"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Contraseña</label>
                <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-volt-secondary focus:ring-1 focus:ring-volt-secondary outline-none transition-all"
                    placeholder="••••••••"
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-volt-secondary text-white font-bold rounded-lg hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ENTRAR AL SISTEMA"}
            </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
            ¿No tienes cuenta? <a href="/registro" className="text-volt-secondary hover:underline">Regístrate gratis</a>
        </p>

    </div>
  );
}