import Link from 'next/link';
import { MapPin, Building2, BookOpen, ArrowRight } from 'lucide-react';
import { Centro } from '@/types';

interface CentroCardProps {
  centro: Centro;
  index: number;
}

export default function CentroCard({ centro, index }: CentroCardProps) {
  const getNaturalezaBadge = (naturaleza: string) => {
    switch (naturaleza?.toUpperCase()) {
      case 'PÚBLICO': return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100';
      case 'PRIVADO': return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-100';
      case 'CONCERTADO': return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getLevelColor = (nivel: string) => {
    switch (nivel?.toUpperCase()) {
      case 'GRADO SUPERIOR': return 'bg-purple-600 text-white border-purple-600 shadow-sm';
      case 'GRADO MEDIO': return 'bg-amber-500 text-white border-amber-500 shadow-sm';
      case 'FP BÁSICA': return 'bg-blue-600 text-white border-blue-600 shadow-sm';
      default: return 'bg-neutral-600 text-white border-neutral-600';
    }
  };

  const getLevelBackground = (nivel: string) => {
     switch (nivel?.toUpperCase()) {
      case 'GRADO SUPERIOR': return 'bg-purple-50 border-purple-100 group-hover:border-purple-200';
      case 'GRADO MEDIO': return 'bg-amber-50 border-amber-100 group-hover:border-amber-200';
      case 'FP BÁSICA': return 'bg-blue-50 border-blue-100 group-hover:border-blue-200';
      default: return 'bg-neutral-50 border-neutral-100';
    }
  };

  const getLevelDotColor = (nivel: string) => {
    switch (nivel?.toUpperCase()) {
      case 'GRADO SUPERIOR': return 'bg-white/80';
      case 'GRADO MEDIO': return 'bg-white/80';
      case 'FP BÁSICA': return 'bg-white/80';
      default: return 'bg-neutral-400';
    }
  };

  return (
    <div 
      className="group relative bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 hover:border-[#223945] transition-all duration-300 flex flex-col h-full animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Decorative top border/gradient */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-primary-500 to-primary-300"></div>

      <div className="p-5 flex-grow flex flex-col">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-3">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border ${getNaturalezaBadge(centro.naturaleza)}`}>
            {centro.naturaleza || 'Otro'}
          </span>
          
          {centro.distancia !== undefined && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-[#223945] px-2.5 py-0.5 rounded-full shadow-sm">
              <MapPin className="w-3 h-3" />
              {parseFloat(centro.distancia.toString()).toFixed(1)} km
            </span>
          )}
        </div>
        
        {/* Title - polished typography with fixed height for alignment */}
        <h3 className="text-lg font-bold text-[#111827] mb-3 group-hover:text-[#223945] transition-colors line-clamp-2 min-h-[3.5rem] tracking-tight leading-snug">
          {centro.nombre}
        </h3>
        
        {/* Info Icons - fixed height for alignment */}
        <div className="space-y-2.5 mb-5 flex-grow min-h-[4.5rem]">
          <div className="flex items-start gap-2.5 text-neutral-600 group/item">
            <div className="p-1.5 bg-neutral-50 rounded-md shrink-0 mt-0.5 group-hover/item:bg-[#223945]/10 transition-colors">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 group-hover/item:text-[#223945] transition-colors" />
            </div>
            <p className="text-sm leading-relaxed line-clamp-2">
              <span className="font-bold text-[#223945] block text-[10px] uppercase tracking-wider mb-0.5 opacity-80">Ubicación</span>
              {centro.localidad} <span className="text-neutral-400">({centro.provincia})</span>
            </p>
          </div>
          
          <div className="flex items-start gap-2.5 text-neutral-600 group/item">
             <div className="p-1.5 bg-neutral-50 rounded-md shrink-0 mt-0.5 group-hover/item:bg-[#223945]/10 transition-colors">
              <Building2 className="w-3.5 h-3.5 text-neutral-400 group-hover/item:text-[#223945] transition-colors" />
            </div>
            {/* Removed line-clamp-1 to allow text to show fully, or increased clamp limit if needed */}
            <p className="text-sm leading-relaxed line-clamp-2">
              <span className="font-bold text-[#223945] block text-[10px] uppercase tracking-wider mb-0.5 opacity-80">Tipo</span>
              {centro.denominacion_generica}
            </p>
          </div>
        </div>

        {/* Highlighted Offer (Ciclos) - enhanced visual hierarchy - STATIC HEIGHT SCROLLABLE */}
        {centro.ciclos && centro.ciclos.length > 0 ? (
          <div className="mt-auto pt-3 border-t border-neutral-100">
             <div className="flex items-center gap-2 mb-2.5">
                <div className="p-1 bg-[#223945]/10 rounded text-[#223945]">
                  <BookOpen className="w-3 h-3" />
                </div>
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Oferta destacada</span>
             </div>
             
             {/* Static height scrollable container */}
             <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
                {centro.ciclos.map((ciclo, idx) => (
                  <div key={idx} className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-md border shadow-sm transition-colors animate-fade-in-up ${getLevelBackground(ciclo.nivel_educativo)}`}>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getLevelDotColor(ciclo.nivel_educativo)}`}></div>
                    <span className="truncate flex-1 font-medium text-neutral-800 text-[11px]">{ciclo.ciclo_formativo}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${getLevelColor(ciclo.nivel_educativo)}`}>
                      {ciclo.nivel_educativo === 'Grado Superior' ? 'GS' : (ciclo.nivel_educativo === 'Grado Medio' ? 'GM' : 'FPB')}
                    </span>
                  </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="mt-auto min-h-[4rem]"></div>
        )}
      </div>

      {/* Footer / Action - filled button style on hover */}
      <div className="p-3 bg-neutral-50/50 border-t border-neutral-100 group-hover:bg-white transition-colors">
        <Link 
          href={`/centro/${centro.id}`} 
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-bold text-[#223945] bg-white border border-neutral-200/80 shadow-sm hover:bg-[#223945] hover:text-white hover:border-[#223945] hover:shadow-md transition-all duration-200"
        >
          Ver ficha completa
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
