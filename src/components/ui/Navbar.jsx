// src/components/ui/Navbar.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // Importamos el cliente
import { Menu, X, Zap, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null); // Aquí guardamos al usuario si existe

  // 1. Efecto para detectar si hay sesión iniciada
  useEffect(() => {
    // Revisar sesión al cargar
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    // Escuchar cambios (si se loguea o se sale en otra pestaña)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. Función para cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/"; // Recargar a la home
  };

  const menuItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'Cursos', href: '/cursos' },
    { name: 'Simulador', href: '/examen' },
    { name: 'Normativa', href: '/normativa' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-volt-primary/20 bg-volt-dark/60 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => window.location.href='/'}>
            <div className="p-2 bg-volt-primary/10 rounded-full border border-volt-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                <Zap className="h-6 w-6 text-volt-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-wider text-white">
              VOLTIO<span className="text-volt-primary">ACADEMY</span>
            </span>
          </div>

          {/* MENÚ DESKTOP */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-slate-300 hover:text-volt-primary px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 hover:bg-white/5"
                >
                  {item.name}
                </a>
              ))}

              {/* LÓGICA DE USUARIO VS INVITADO */}
              {user ? (
                // SI ESTÁ LOGUEADO: Muestra su correo y botón salir
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                    <div className="flex items-center gap-2 text-sm text-volt-primary">
                        <User className="w-4 h-4" />
                        <span className="hidden lg:inline">{user.email.split('@')[0]}</span>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-500/10 border border-red-500/50 text-red-400 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
              ) : (
                // SI ES INVITADO: Muestra botón de entrar
                <a href="/login" className="bg-volt-primary text-volt-dark px-5 py-2 rounded-full font-bold text-sm hover:bg-white transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)] ml-4">
                  Área de Miembros
                </a>
              )}

            </div>
          </div>

          {/* BOTÓN MÓVIL */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {isOpen && (
        <div className="md:hidden bg-volt-dark/95 backdrop-blur-xl border-b border-volt-primary/20 absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-slate-300 hover:text-volt-primary block px-3 py-4 rounded-md text-base font-medium border-l-2 border-transparent hover:border-volt-primary hover:bg-white/5"
              >
                {item.name}
              </a>
            ))}
            
            <div className="border-t border-white/10 mt-4 pt-4 px-3">
                {user ? (
                    <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 w-full py-2">
                        <LogOut className="w-5 h-5" /> Cerrar Sesión ({user.email})
                    </button>
                ) : (
                    <a href="/login" className="block text-center w-full bg-volt-primary text-black font-bold py-3 rounded-lg">
                        Iniciar Sesión
                    </a>
                )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}