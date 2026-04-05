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

    return (
        <div className="relative group w-[280px] sm:w-[320px]">
            <div className="relative bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-purple-300 hover:shadow-lg transition-all duration-200">
                {/* Degradado superior con tono púrpura para diferenciar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-blue-500 to-blue-400"></div>

                {/* Badge de recomendación */}
                <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold">
                        <Sparkles className="w-3 h-3" />
                        Para ti
                    </div>
                </div>

                <div className="p-4 pt-5">
                    {/* Badge de naturaleza */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${getNaturalezaColor(centro.naturaleza)}`}>
                            {centro.naturaleza || 'Centro'}
                        </span>
                    </div>

                    {/* Nombre del centro */}
                    <h3 className="font-bold text-[#223945] text-sm leading-tight mb-2 line-clamp-2 min-h-[2.5rem]">
                        {centro.nombre}
                    </h3>

                    {/* Ciclos si existen */}
                    {centro.ciclos && centro.ciclos.length > 0 && (
                        <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                                {centro.ciclos.slice(0, 2).map((ciclo, idx) => (
                                    <span
                                        key={idx}
                                        className="text-[9px] px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded-full truncate max-w-[140px]"
                                    >
                                        {ciclo.ciclo_formativo}
                                    </span>
                                ))}
                                {centro.ciclos.length > 2 && (
                                    <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded-full">
                                        +{centro.ciclos.length - 2}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Ubicación */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-neutral-500">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs truncate">
                                {centro.localidad}, {centro.provincia}
                            </span>
                        </div>

                        {/* Botón ver detalles */}
                        <Link
                            href={`/centro/${centro.id}`}
                            className="p-2 rounded-lg bg-[#223945] text-white hover:bg-[#223945]/90 hover:scale-105 transition-all shadow-md"
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
