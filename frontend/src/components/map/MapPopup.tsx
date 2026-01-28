'use client';

import Link from 'next/link';
import { Building2, MapPin, ArrowRight } from 'lucide-react';
import { Centro } from '@/types'; // Ensure types share location
import FavoriteButton from '@/components/ui/FavoriteButton';
import { useFavorite } from '@/hooks/useFavorite';
import { useRef } from 'react';


interface MapPopupProps {
    centro: Centro;
}

export default function MapPopup({ centro }: MapPopupProps) {
    // We need a ref for the animation source, similar to CentroCard
    const cardRef = useRef<HTMLDivElement>(null);

    const { isFavorite, toggleFavorite, loading } = useFavorite({
        centro,
        // We can pass callback if map needs to know, but likely not needed for just toggling
    });

    return (
        <div ref={cardRef} className="min-w-[260px] relative font-sans text-left">
            {/* Decorative Gradient Top Border */}
            <div className="absolute -top-[1px] -left-[1px] -right-[1px] h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-400 rounded-t-lg"></div>

            {/* Favorite Button - Absolute Top Right */}
            <div className="absolute top-3 right-0 z-10">
                 <FavoriteButton 
                    isFavorite={isFavorite} 
                    onClick={(e) => toggleFavorite(e, cardRef.current!)}
                    loading={loading}
                    className="!w-8 !h-8 !p-1.5 shadow-sm border-neutral-100 bg-white/90 backdrop-blur-sm"
                 />
            </div>

            <div className="pt-3 pb-1 px-1">
                 {/* Header / Icon + Type */}
                <div className="flex items-start gap-3 mb-2 pr-8">
                    <div className="p-2 bg-neutral-100 rounded-lg shrink-0 border border-neutral-200 shadow-sm">
                        <Building2 className="w-5 h-5 text-[#223945]" />
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">
                            {centro.denominacion_generica || centro.naturaleza || "Centro Educativo"}
                        </span>
                        <h3 className="font-bold text-[#223945] text-sm leading-tight line-clamp-2" title={centro.nombre}>
                            {centro.nombre}
                        </h3>
                    </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-1.5 mb-4 pl-0.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                        {centro.direccion || 'Dirección no disponible'}
                        <br />
                        <span className="text-neutral-400 font-medium">{centro.localidad} ({centro.provincia})</span>
                    </p>
                </div>

                {/* Footer Action */}
                <Link 
                    href={`/centro/${centro.id}`} 
                    className="group flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-bold bg-[#223945] text-white shadow-md shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all duration-200"
                >
                    Ver Ficha Completa
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    );
}
