import Link from 'next/link';
import { MapPin, ArrowRight, GraduationCap, Heart, Navigation } from 'lucide-react';
import { Centro } from '@/types';
import { useFavorite } from '@/hooks/useFavorite';
import { useRef } from 'react';
import { centroName, centroTipo, centroLugar, centroEtapas, titleCase } from '@/lib/centro-format';

interface MapPopupProps {
    centro: Centro;
    initialIsFavorite?: boolean;
}

// COMPONENTE POPUP DEL MAPA
// Ficha emergente al tocar un marcador: qué es, dónde está y qué se puede estudiar
export default function MapPopup({ centro, initialIsFavorite = false }: MapPopupProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const { isFavorite, toggleFavorite, loading } = useFavorite({
        centro,
        initialIsFavorite
    });

    const esPublico = centro.naturaleza?.toUpperCase().includes('PÚBLICO');
    const ciclos = centro.ciclos_count ?? 0;
    const etapas = centroEtapas(centro.denominacion_generica);
    const direccion = titleCase(centro.direccion);

    return (
        <div ref={cardRef} className="w-full bg-white font-sans overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300" />

            <div className="p-4">
                {/* Titularidad + tipo · favorito */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ring-1 ${
                            esPublico ? 'bg-blue-50 text-blue-700 ring-blue-200' : 'bg-amber-50 text-amber-700 ring-amber-200'
                        }`}>
                            {centro.naturaleza || 'Centro'}
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest truncate">
                            {centroTipo(centro.denominacion_generica)}
                        </span>
                    </div>
                    <button
                        onClick={(e) => toggleFavorite(e, cardRef.current!)}
                        disabled={loading}
                        className="shrink-0 -mr-1 -mt-1 p-1.5 rounded-full bg-white border border-neutral-100 shadow-sm hover:bg-red-50 transition-colors group/heart"
                        aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                    >
                        <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-400 group-hover/heart:text-red-500'}`} />
                    </button>
                </div>

                <div className="mt-1.5 text-[17px] font-extrabold text-[#111827] leading-tight line-clamp-2" title={centroName(centro)}>
                    {centroName(centro)}
                </div>

                <div className="mt-2 flex items-start gap-1.5 text-neutral-500">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <div className="text-[13px] leading-snug min-w-0">
                        {direccion && <span className="block truncate">{direccion}</span>}
                        <span className="block text-xs text-neutral-400">{centroLugar(centro)}</span>
                    </div>
                </div>

                {/* Qué se puede estudiar */}
                <div className="mt-3">
                    {ciclos > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#223945]/[0.06] text-xs font-bold text-[#223945]">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                            {ciclos} {ciclos === 1 ? 'ciclo de FP' : 'ciclos de FP'}
                        </span>
                    ) : etapas.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {etapas.map(e => (
                                <span key={e} className="px-2 py-0.5 rounded-full bg-[#223945]/[0.06] text-[11px] font-semibold text-[#223945]">{e}</span>
                            ))}
                        </div>
                    ) : null}
                </div>

                {/* Acciones */}
                <div className="mt-3.5 flex gap-2">
                    <Link
                        href={`/centro/${centro.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-[#223945] text-sm font-bold shadow-md shadow-[#223945]/20 hover:bg-gradient-to-r hover:from-[#223945] hover:to-blue-700 transition-all !text-white"
                    >
                        Ver centro
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${centro.latitud},${centro.longitud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Cómo llegar"
                        className="shrink-0 w-10 h-10 rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 flex items-center justify-center hover:bg-blue-100 transition-colors"
                    >
                        <Navigation className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
    );
}
