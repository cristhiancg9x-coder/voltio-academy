// src/components/ui/SubscribeForm.jsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Loader2, CheckCircle } from 'lucide-react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check if already subscribed
      const { data: existing } = await supabase
        .from('suscriptor')
        .select('id')
        .eq('email', email)
        .single();

      if (existing) {
        setError('Este correo ya está suscrito.');
        return;
      }

      const { error: insertError } = await supabase
        .from('suscriptor')
        .insert({ email });

      if (insertError) throw insertError;

      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError('Hubo un error al suscribirse. Inténtalo de nuevo.');
      console.error(err);
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
        {error && <p className="text-red-400 text-xs">{error}</p>}
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