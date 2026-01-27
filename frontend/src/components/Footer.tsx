import Link from 'next/link';
import { Github, Linkedin, Database, Code2, Cpu, ExternalLink, Heart, Globe } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f172a] text-neutral-200 py-10 border-t border-white/10 relative overflow-hidden">
        {/* Subtle top gradient line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Column 1: Project Identity (Span 4) */}
          <div className="md:col-span-5 lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
               <Logo showSubtitle={false} className="text-white scale-90 origin-left" />
               <span className="px-2 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-[10px] font-medium text-blue-300 tracking-wide uppercase">
                 Proyecto DAW
               </span>
            </div>
            <p className="text-neutral-400 text-sm font-light leading-relaxed max-w-sm">
              Plataforma desarrollada con datos abiertos de la Junta de Castilla y León para facilitar el acceso a la oferta educativa.
            </p>
            
            <div className="flex items-center gap-3 pt-2">
                 <a 
                    href="https://github.com/mariotc1/edufinder-cyl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group text-sm font-medium"
                 >
                    <Github className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                    <span>Repositorio</span>
                 </a>
                 <div className="h-4 w-[1px] bg-white/10"></div>
                 <div className="flex gap-2">
                    <TechIcon icon={<Code2 className="w-4 h-4" />} label="Next.js" />
                    <TechIcon icon={<Cpu className="w-4 h-4" />} label="Tailwind" />
                    <TechIcon icon={<Database className="w-4 h-4" />} label="Open Data" />
                 </div>
            </div>
          </div>

          {/* Column 2: Team (Span 4) */}
          <div className="md:col-span-4 lg:col-span-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-blue-500"></span>
                Equipo de Desarrollo
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mario */}
                <div className="group p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all">
                    <p className="text-sm font-medium text-white mb-0.5">Mario Tomé Core</p>
                    <p className="text-[11px] text-neutral-500 mb-2 font-mono">Full Stack Developer</p>
                    <div className="flex items-center gap-2">
                        <SocialIcon href="https://github.com/mariotc1" icon={<Github className="w-3.5 h-3.5" />} />
                        <SocialIcon href="https://www.linkedin.com/in/mario-tome-core/" icon={<Linkedin className="w-3.5 h-3.5" />} />
                    </div>
                </div>

                {/* Raúl */}
                <div className="group p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/[0.02] transition-all">
                    <p className="text-sm font-medium text-white mb-0.5">Raúl Ortega Frutos</p>
                    <p className="text-[11px] text-neutral-500 mb-2 font-mono">Full Stack Developer</p>
                    <div className="flex items-center gap-2">
                         <SocialIcon href="https://github.com/Raul9097" icon={<Github className="w-3.5 h-3.5" />} />
                         <SocialIcon href="https://www.linkedin.com/in/raúl-ortega-frutos-140485332/" icon={<Linkedin className="w-3.5 h-3.5" />} />
                    </div>
                </div>
            </div>
          </div>

          {/* Column 3: Data Sources (Span 3) */}
          <div className="md:col-span-3 lg:col-span-3">
             <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                Fuentes de Datos
            </h3>
            <ul className="space-y-2">
                <li>
                    <a 
                        href="https://analisis.datosabiertos.jcyl.es/explore/dataset/directorio-de-centros-docentes/export/?flg=es-es&disjunctive.denominacion_generica"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-2 text-xs text-neutral-400 hover:text-emerald-300 transition-colors leading-snug"
                    >
                        <ExternalLink className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>Directorio Centros Docentes (JCyL)</span>
                    </a>
                </li>
                <li>
                     <a 
                        href="https://analisis.datosabiertos.jcyl.es/explore/dataset/oferta-de-formacion-profesional/export/?"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-2 text-xs text-neutral-400 hover:text-emerald-300 transition-colors leading-snug"
                    >
                        <ExternalLink className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>Oferta Formación Profesional (JCyL)</span>
                    </a>
                </li>
                 <li className="pt-2">
                    <Link href="/mapa" className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Explorar Mapa
                    </Link>
                </li>
            </ul>
          </div>

        </div>

        {/* Minimal Bottom Bar */}
        <div className="border-t border-white/5 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <p>© {currentYear} EduFinder CyL. Proyecto Académico sin ánimo de lucro.</p>
          <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
             <span>Hecho con</span>
             <Heart className="w-3 h-3 text-red-500 mx-0.5" />
             <span>en Castilla y León</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Minimal Helper Components
function SocialIcon({ href, icon }: { href: string; icon: React.ReactNode }) {
    return (
        <a 
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        >
            {icon}
        </a>
    )
}

function TechIcon({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="p-1.5 text-neutral-500" title={label}>
            {icon}
        </div>
    )
}
