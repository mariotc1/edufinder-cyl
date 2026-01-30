import Link from 'next/link';
import Image from 'next/image';
import { Github, Linkedin, Database, Code2, Cpu, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f172a] text-white py-8 border-t border-white/10 relative overflow-hidden">
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">

          {/* Section 1: Text Logo & Repo (Compact) */}
          <div className="flex flex-col gap-3 lg:w-1/3">
            <div className="flex items-center gap-3">
              {/* Text Only Logo as requested */}
              <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-blue-200 transition-colors">
                EduFinder CYL
              </Link>
              <span className="px-2 py-0.5 rounded-full border border-blue-400/30 bg-blue-500/20 text-[10px] font-bold text-blue-200 tracking-wide uppercase">
                Proyecto DAW
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-neutral-300">
              <a
                href="https://github.com/mariotc1/edufinder-cyl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>Repositorio GitHub</span>
              </a>
              <span className="text-white/20">|</span>
              <div className="flex items-center gap-2 text-neutral-400" title="Tech Stack">
                <Code2 className="w-4 h-4" />
                <Cpu className="w-4 h-4" />
                <Database className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Section 2: Team (Horizontal Row) */}
          <div className="lg:w-1/3 flex flex-col items-start lg:items-center gap-2">
            {/* Header WHITE, no icon */}
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">
              Equipo de Desarrollo
            </h3>
            <div className="flex gap-4">
              {/* Mario */}
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hover:border-blue-500/50 transition-colors">
                <span className="text-xs font-bold text-white">Mario Tomé</span>
                <div className="flex gap-2 border-l border-white/20 pl-2">
                  {/* Larger Icons (w-4 h-4 or w-5 h-5) */}
                  <SocialIconTiny href="https://github.com/mariotc1" icon={<Github className="w-4 h-4" />} />
                  <SocialIconTiny href="https://www.linkedin.com/in/mario-tome-core/" icon={<Linkedin className="w-4 h-4" />} />
                </div>
              </div>

              {/* Raúl */}
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hover:border-purple-500/50 transition-colors">
                <span className="text-xs font-bold text-white">Raúl Ortega</span>
                <div className="flex gap-2 border-l border-white/20 pl-2">
                  {/* Larger Icons */}
                  <SocialIconTiny href="https://github.com/Raul9097" icon={<Github className="w-4 h-4" />} />
                  <SocialIconTiny href="https://www.linkedin.com/in/raúl-ortega-frutos-140485332/" icon={<Linkedin className="w-4 h-4" />} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Data Sources (Compact Right Aligned) */}
          <div className="lg:w-1/3 flex flex-col items-start lg:items-end gap-2 text-right">
            {/* Header WHITE, NO ICON */}
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">
              Datos Abiertos JCyL
            </h3>
            
            <div className="flex flex-row-reverse items-center gap-4">
                <div className="flex flex-col lg:items-end gap-1.5">
                <a
                    href="https://analisis.datosabiertos.jcyl.es/explore/dataset/directorio-de-centros-docentes/export/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neutral-300 hover:text-white hover:underline decoration-emerald-500/50 underline-offset-2 transition-all"
                >
                    Directorio de Centros Docentes
                </a>
                <a
                    href="https://analisis.datosabiertos.jcyl.es/explore/dataset/oferta-de-formacion-profesional/export/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neutral-300 hover:text-white hover:underline decoration-emerald-500/50 underline-offset-2 transition-all"
                >
                    Oferta de Formación Profesional
                </a>
                </div>

                {/* JCYL Logo - Larger and side by side, no background */}
                <div className="opacity-90 hover:opacity-100 transition-opacity">
                    <Image 
                        src="/img/jcyl.png" 
                        alt="Junta de Castilla y León" 
                        width={180} 
                        height={80} 
                        className="h-16 w-auto object-contain"
                    />
                </div>
            </div>
          </div>

        </div>

        {/* Ultra-Minimal Bottom Bar */}
        <div className="mt-8 pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] text-neutral-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span>© {currentYear} EduFinder CyL</span>
            <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
            <span>Open Data Contest 2026</span>
          </div>
          <div className="flex items-center gap-1 opacity-70">
            <span>Hecho con</span>
            <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500" />
            <span>en Castilla y León</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

// Micro Component - Updated for slightly larger icons hit area
function SocialIconTiny({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-neutral-400 hover:text-white transition-colors hover:scale-110 transform duration-200"
    >
      {icon}
    </a>
  )
}
