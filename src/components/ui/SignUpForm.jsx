import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { UserPlus, Loader2, AlertCircle } from 'lucide-react';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center">
        <h3 className="text-xl font-bold text-green-400 mb-2">¡Bienvenido!</h3>
        <p className="text-slate-300 text-sm">Tu cuenta ha sido creada.</p>
        <a href="/" className="inline-block mt-4 text-volt-primary hover:underline">Volver al inicio</a>
      </div>
    );
  }

  return (
    <div className="bg-volt-dark/50 border border-white/10 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md mx-auto shadow-2xl">
        <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-volt-primary/10 rounded-full border border-volt-primary/30 mb-4">
                <UserPlus className="w-6 h-6 text-volt-primary" />
            </div>
            <h2 className="text-2xl font-bold text-white font-display">Crear Cuenta</h2>
        </div>

        {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-6 flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
            </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Correo</label>
                <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-volt-primary outline-none"
                    placeholder="ejemplo@voltio.com"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Contraseña</label>
                <input 
                    type="password" 
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-volt-primary outline-none"
                    placeholder="••••••••"
                />
            </div>
            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-volt-primary text-black font-bold rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2 mt-4"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "REGISTRARME"}
            </button>
        </form>
    </div>
  );
}