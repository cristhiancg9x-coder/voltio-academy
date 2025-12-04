import { Home, BookOpen, GraduationCap, FileText } from 'lucide-react';

export default function MobileNav() {
  
  // Array de enlaces
  const links = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Blog', href: '/blog', icon: BookOpen },
    { name: 'Cursos', href: '/cursos', icon: GraduationCap },
    { name: 'Normas', href: '/normativa', icon: FileText },
  ];

  return (
    // md:hidden = Se oculta en PC. fixed bottom-0 = Pegado abajo.
    <div className="md:hidden fixed bottom-0 left-0 w-full z-[100] bg-volt-dark/90 backdrop-blur-xl border-t border-white/10 pb-safe">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => (
          <a 
            key={link.name} 
            href={link.href}
            className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-volt-primary active:text-volt-primary transition-colors gap-1"
          >
            <link.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{link.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}