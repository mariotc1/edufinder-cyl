import Link from 'next/link';
import { MapPin, X, ArrowRight, Navigation } from 'lucide-react';
import { centroName, centroLugar, denominacionDe } from '@/lib/centro-format';
import { estiloTipo, formatDistancia } from '@/lib/centro-estilo';

interface CentroMiniCardProps {
    centro: {
        id: number;
        nombre: string;
        naturaleza?: string;
        localidad?: string;
        provincia?: string;
        denominacion_generica?: string;
        distancia_km?: number;
    };
    // Pastilla extra junto a la titularidad ("Hace 2 h", "Para ti"...)
    meta?: React.ReactNode;
    // Línea destacada bajo el nombre (p. ej. el ciclo que encaja contigo)
    destacado?: React.ReactNode;
    onRemove?: () => void;
}

// TARJETA COMPACTA DE CENTRO
// Para carruseles (visitados, recomendaciones): mismo lenguaje visual que CentroCard en pequeño
export default function CentroMiniCard({ centro, meta, destacado, onRemove }: CentroMiniCardProps) {
    const nombre = centroName(centro);
    const estilo = estiloTipo(denominacionDe(centro));
    const Icon = estilo.icon;
    const esPublico = centro.naturaleza?.toUpperCase().includes('PÚBLICO');
    const km = formatDistancia(centro.distancia_km);

    return (
        <div className="group relative w-[272px] sm:w-[310px] h-full flex flex-col rounded-3xl bg-white ring-1 ring-neutral-200/80 shadow-[0_1px_2px_rgba(34,57,69,0.06),0_8px_24px_-12px_rgba(34,57,69,0.18)] hover:shadow-[0_16px_36px_-14px_rgba(34,57,69,0.35)] hover:ring-[#223945]/25 transition-all duration-300">
            <Link href={`/centro/${centro.id}`} aria-label={`Ver ${nombre}`} className="absolute inset-0 z-10 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" />

            <div className={`flex-1 flex flex-col rounded-3xl bg-gradient-to-b ${estilo.header} via-white to-white p-4`}>
                <div className="flex items-start gap-2.5">
                    <span className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${estilo.tile} text-white flex items-center justify-center shadow-md`}>
                        <Icon className="w-[18px] h-[18px]" />
                    </span>
                    <div className="flex-1 min-w-0">
                        <span className={`block text-[10px] font-extrabold uppercase tracking-wider truncate ${estilo.text}`}>{estilo.label}</span>
                        <span className="mt-1 flex items-center gap-1 flex-wrap">
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${esPublico ? 'bg-blue-600 text-white' : 'bg-amber-400 text-amber-950'}`}>
                                {esPublico ? 'Público' : 'Privado'}
                            </span>
                            {km && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white bg-[#223945]">
                                    <Navigation className="w-2 h-2 fill-current" />
                                    {km}
                                </span>
                            )}
                            {meta}
                        </span>
                    </div>
                    {onRemove && (
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
                            aria-label={`Quitar ${nombre} del historial`}
                            title="Quitar del historial"
                            className="relative z-20 shrink-0 -mr-1 -mt-1 w-8 h-8 rounded-full flex items-center justify-center text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <h3 className="mt-3 !text-base !font-extrabold !leading-tight !text-[#111827] line-clamp-2 group-hover:!text-[#223945]" title={nombre}>
                    {nombre}
                </h3>
                {destacado && <div className="mt-1.5 min-w-0">{destacado}</div>}

                <div className="mt-auto pt-3 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span className="flex-1 min-w-0 truncate text-xs font-medium text-neutral-500">{centroLugar(centro)}</span>
                    <span className="shrink-0 w-7 h-7 rounded-full bg-[#223945] text-white flex items-center justify-center shadow-sm group-hover:bg-gradient-to-br group-hover:from-[#223945] group-hover:to-blue-700 transition-all">
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                </div>
            </div>
        </div>
    );
}
