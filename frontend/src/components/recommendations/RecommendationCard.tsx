'use client';

import Link from 'next/link';
import { MapPin, Eye, Sparkles } from 'lucide-react';
import { Centro } from '@/types';

interface RecommendationCardProps {
    centro: Centro;
}

export default function RecommendationCard({ centro }: RecommendationCardProps) {
    const getNaturalezaColor = (naturaleza: string) => {
        switch (naturaleza?.toUpperCase()) {
            case 'PÚBLICO':
                return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100';
            case 'PRIVADO':
                return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-100';
            default:
                return 'bg-neutral-50 text-neutral-600 border-neutral-200';
        }
    };

    // Formatear ubicación de forma compacta
    const formatLocation = (localidad: string, provincia: string) => {
        const loc = localidad || '';
        const prov = provincia || '';

        if (loc.length > 20) {
            return prov;
        }

        return loc ? `${loc}, ${prov}` : prov;
    };

    return (
        <div className="relative group w-[280px] sm:w-[320px]">
            <div className="relative bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-purple-300 hover:shadow-lg transition-all duration-200 h-[140px] sm:h-[150px] flex flex-col">
                {/* Degradado superior */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-blue-500 to-blue-400"></div>

                <div className="p-3 sm:p-4 pt-4 sm:pt-5 pb-4 sm:pb-5 flex flex-col flex-1">
                    {/* Badge de naturaleza + Para ti */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 shrink-0">
                        <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wide px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border ${getNaturalezaColor(centro.naturaleza)}`}>
                            {centro.naturaleza || 'Centro'}
                        </span>
                        <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-700 rounded-full text-[9px] sm:text-[10px] font-bold">
                            <Sparkles className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                            <span className="hidden sm:inline">Para ti</span>
                        </div>
                    </div>

                    {/* Nombre del centro */}
                    <div className="flex-1 mb-2 overflow-hidden">
                        <h3 className="font-bold text-[#223945] text-[11px] sm:text-[12px] leading-[1.1rem] sm:leading-[1.2rem] line-clamp-2" title={centro.nombre}>
                            {centro.nombre}
                        </h3>
                    </div>

                    {/* Ubicación */}
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-neutral-500 min-w-0 flex-1 mr-3">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs truncate">
                                {formatLocation(centro.localidad, centro.provincia)}
                            </span>
                        </div>

                        {/* Botón ver detalles */}
                        <Link
                            href={`/centro/${centro.id}`}
                            className="p-2 rounded-lg bg-[#223945] text-white hover:bg-[#223945]/90 hover:scale-105 transition-all shadow-md shrink-0"
                            title="Ver detalles del centro"
                        >
                            <Eye className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
