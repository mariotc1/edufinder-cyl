import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react'; // Removed Building2 for minimalism
import { Centro } from '@/types';
import { useFavorite } from '@/hooks/useFavorite';
import { useRef } from 'react';

interface MapPopupProps {
    centro: Centro;
}

export default function MapPopup({ centro }: MapPopupProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const { isFavorite, toggleFavorite, loading } = useFavorite({
        centro,
    });

    return (
        <div ref={cardRef} className="w-full bg-white font-sans overflow-hidden">
            {/* Minimalist Gradient Line (Top) */}
            <div className="h-1 w-full bg-gradient-to-r from-[#223945] via-blue-500 to-blue-400" />
            
            <div className="p-3">
                {/* Header: Title + Heart (Flex Row for perfect alignment) */}
                <div className="flex justify-between items-start gap-1.5 mb-1.5">
                    <div className="min-w-0 flex-1">
                        <span className="text-[8px] font-bold text-blue-600 uppercase tracking-wider block mb-0.5">
                            {centro.denominacion_generica || "Centro"}
                        </span>
                        <div className="text-[9px] font-bold text-[#223945] leading-3 line-clamp-2" title={centro.nombre}>
                            {centro.nombre}
                        </div>
                    </div>
                    
                    {/* Heart Button */}
                    <button 
                        onClick={(e) => toggleFavorite(e, cardRef.current!)}
                        disabled={loading}
                        className="shrink-0 p-1.5 -mr-1 -mt-1 rounded-full bg-white border border-neutral-200 shadow-sm hover:bg-neutral-50 transition-all group/heart"
                        title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className={`w-3.5 h-3.5 transition-colors ${
                                isFavorite 
                                ? "fill-red-500 text-red-500 border-red-500" 
                                : "text-neutral-300 group-hover/heart:text-red-500"
                            }`}
                        >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                    </button>
                </div>

                {/* Address - Ultra Compact */}
                <div className="flex items-start gap-1 mb-2 text-neutral-500">
                    <MapPin className="w-2.5 h-2.5 mt-0.5 shrink-0" />
                    <div className="text-[9px] leading-tight flex flex-col">
                        <span className="line-clamp-1">{centro.direccion || 'Ubicación no disponible'}</span>
                        <span className="text-neutral-400 text-[8px] font-medium leading-none mt-0.5">{centro.localidad}</span>
                    </div>
                </div>

                {/* Big Clear Action Button */}
                <Link 
                    href={`/centro/${centro.id}`} 
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-[#223945] text-white rounded text-[11px] font-bold hover:bg-[#1a2c35] transition-colors shadow-sm decoration-0"
                >
                    <span className="text-white">Explorar Centro</span>
                    <ArrowRight className="w-3 h-3 text-white" />
                </Link>
            </div>
        </div>
    );
}
