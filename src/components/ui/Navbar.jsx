// src/components/ui/Navbar.jsx
import { useState } from 'react';
import { Menu, X, Zap } from 'lucide-react'; // Iconos ligeros

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'Cursos', href: '/cursos' },
    { name: 'Normativa', href: '/normativa' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-volt-primary/20 bg-volt-dark/60 backdrop-blur-md">
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

          {/* MENÚ DESKTOP (Oculto en celular) */}
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
              {/* Botón de Acción */}
              <a href="#newsletter" className="bg-volt-primary text-volt-dark px-5 py-2 rounded-full font-bold text-sm hover:bg-white transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                Suscribirse
              </a>
            </div>
          </div>

          {/* BOTÓN HAMBURGUESA (Móvil) */}
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
          </div>
        </div>
      )}
    </nav>
  );
}