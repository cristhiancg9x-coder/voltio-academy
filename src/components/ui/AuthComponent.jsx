import { supabase } from '../../lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect, useState } from 'react';

export default function AuthComponent({ view = 'sign_in' }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
          window.location.href = '/perfil';
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && _event === 'SIGNED_IN') {
         window.location.href = '/perfil';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="bg-volt-dark/80 border border-white/10 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md mx-auto shadow-2xl">
        <Auth 
            supabaseClient={supabase} 
            appearance={{ 
                theme: ThemeSupa,
                variables: {
                    default: {
                        colors: {
                            brand: '#FFCC00', // yellow/primary
                            brandAccent: '#E6B800',
                            inputText: 'white',
                        }
                    }
                },
                className: {
                    container: 'supabase-auth-container',
                    label: 'text-slate-400 font-bold uppercase text-xs',
                    button: 'font-bold rounded-lg py-3',
                    input: 'bg-black/50 border-white/10 text-white rounded-lg p-3',
                }
            }} 
            theme="dark"
            providers={['google', 'github']}
            view={view}
        />
      </div>
    );
  }
  else {
    return (
        <div className="text-center p-8 bg-volt-dark/80 rounded-3xl border border-white/10">
            <p className="text-white text-lg">Ya has iniciado sesión.</p>
            <a href="/perfil" className="inline-block mt-4 px-6 py-2 bg-volt-primary text-black font-bold rounded-lg hover:bg-white transition-colors">
                Ir a mi perfil
            </a>
        </div>
    )
  }
}
