import Link from 'next/link';
import { MapPin, Building2, BookOpen, ArrowRight } from 'lucide-react';
import { Centro } from '@/types';

interface CentroCardProps {
  centro: Centro;
}

export default function CentroCard({ centro }: CentroCardProps) {
  const getNaturalezaBadge = (naturaleza: string) => {
    switch (naturaleza?.toUpperCase()) {
      case 'PÚBLICO': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PRIVADO': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CONCERTADO': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Decorative top border/gradient */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-500 to-primary-300"></div>

      <div className="p-6 flex-grow flex flex-col">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getNaturalezaBadge(centro.naturaleza)}`}>
            {centro.naturaleza || 'Otro'}
          </span>
          
          {centro.distancia !== undefined && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
              <MapPin className="w-3.5 h-3.5" />
              {parseFloat(centro.distancia.toString()).toFixed(1)} km
            </span>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2 md:min-h-[3.5rem] tracking-tight">
          {centro.nombre}
        </h3>
        
        {/* Info Icons */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 text-neutral-600">
            <div className="p-1.5 bg-neutral-50 rounded-md shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-primary-500" />
            </div>
            <p className="text-sm leading-relaxed">
              <span className="font-medium text-neutral-900 block text-xs uppercase tracking-wider mb-0.5 text-neutral-500">Ubicación</span>
              {centro.localidad} <span className="text-neutral-400">({centro.provincia})</span>
            </p>
          </div>
          
          <div className="flex items-start gap-3 text-neutral-600">
             <div className="p-1.5 bg-neutral-50 rounded-md shrink-0 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-primary-500" />
            </div>
            <p className="text-sm leading-relaxed">
              <span className="font-medium text-neutral-900 block text-xs uppercase tracking-wider mb-0.5 text-neutral-500">Tipo</span>
              {centro.denominacion_generica}
            </p>
          </div>
        </div>

        {/* Highlighted Offer (Ciclos) */}
        {centro.ciclos && centro.ciclos.length > 0 ? (
          <div className="mt-auto pt-4 border-t border-neutral-100">
             <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-secondary-500" />
                <span className="text-xs font-bold text-neutral-700 uppercase tracking-wide">Oferta destacada</span>
             </div>
             <div className="space-y-2">
                {centro.ciclos.slice(0, 2).map((ciclo, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-neutral-600 bg-neutral-50 px-2 py-1.5 rounded border border-neutral-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary-400 shrink-0"></div>
                    <span className="truncate flex-1">{ciclo.ciclo_formativo}</span>
                    <span className="text-[10px] text-neutral-400 uppercase border border-neutral-200 px-1 rounded">{ciclo.nivel_educativo === 'Grado Superior' ? 'GS' : (ciclo.nivel_educativo === 'Grado Medio' ? 'GM' : 'FPB')}</span>
                  </div>
                ))}
             </div>
             {centro.ciclos.length > 2 && (
               <p className="text-xs text-primary-600 font-medium mt-2 pl-1 hover:underline cursor-pointer">
                 +{centro.ciclos.length - 2} ciclos más disponibles
               </p>
             )}
          </div>
        ) : (
          <div className="mt-auto"></div>
        )}
      </div>

      {/* Footer / Action */}
      <div className="p-4 bg-neutral-50 border-t border-neutral-100 group-hover:bg-primary-50/30 transition-colors">
        <Link 
          href={`/centro/${centro.id}`} 
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold text-primary-700 bg-white border border-neutral-200 shadow-sm group-hover:border-primary-200 group-hover:text-primary-800 group-hover:bg-white group-hover:shadow transition-all"
        >
          Ver ficha completa
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
