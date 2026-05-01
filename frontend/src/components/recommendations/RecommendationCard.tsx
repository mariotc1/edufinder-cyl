'use client';

import Link from 'next/link';
import { MapPin, Eye, Sparkles, Heart, GraduationCap } from 'lucide-react';
import { Centro } from '@/types';

interface MatchReason {
    type: string;
    icon?: string;
    text: string;
}

interface RecommendationCardProps {
    centro: Centro & {
        match_reasons?: MatchReason[];
        distancia_km?: number;
        relevance_score?: number;
    };
}

export default function RecommendationCard({ centro }: RecommendationCardProps) {
    const getNaturalezaColor = (naturaleza: string) => {
        switch (naturaleza?.toUpperCase()) {
            case 'PÚBLICO':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'PRIVADO':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            default:
                return 'bg-neutral-50 text-neutral-600 border-neutral-200';
        }
    };

    // Obtener el ciclo coincidente principal (si existe)
    const getCicloMatch = () => {
        if (!centro.match_reasons) return null;
        const cicloReason = centro.match_reasons.find(r =>
            r.type === 'ciclo_liked' || r.type === 'ciclo_exacto'
        );
        return cicloReason?.text || null;
    };

    // Obtener indicador de afinidad
    const getAffinityLevel = () => {
        if (!centro.match_reasons) return null;
        const favMatch = centro.match_reasons.find(r => r.type === 'favorite_match');
        if (favMatch?.text?.includes('Muy afín')) return 'high';
        if (favMatch) return 'medium';
        return null;
    };

    const cicloMatch = getCicloMatch();
    const affinity = getAffinityLevel();

    // Formatear distancia
    const formatDistance = (km: number) => {
        if (km < 1) return `${Math.round(km * 1000)}m`;
        return `${km.toFixed(1)}km`;
    };

    return (
        <div className="relative group w-[280px] sm:w-[320px]">
            <div className="relative bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-purple-300 hover:shadow-lg transition-all duration-200 h-[140px] sm:h-[150px] flex flex-col">
                {/* Degradado superior - varía según afinidad */}
                <div className={`absolute top-0 left-0 w-full h-1.5 ${
                    affinity === 'high'
                        ? 'bg-gradient-to-r from-red-400 via-purple-500 to-blue-500'
                        : 'bg-gradient-to-r from-purple-500 via-blue-500 to-blue-400'
                }`}></div>

                {/* Botón ver centro - esquina superior derecha */}
                <Link
                    href={`/centro/${centro.id}`}
                    className={`absolute top-3 right-3 p-2 rounded-full text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all z-10 ${
                        affinity === 'high'
                            ? 'bg-gradient-to-br from-red-400 via-purple-500 to-blue-500'
                            : 'bg-gradient-to-br from-purple-500 via-blue-500 to-blue-400'
                    }`}
                    title="Ver centro"
                >
                    <Eye className="w-4 h-4" />
                </Link>

                <div className="p-3 sm:p-4 pt-4 sm:pt-5 flex flex-col flex-1 pr-12">
                    {/* Fila 1: Badges */}
                    <div className="flex items-center gap-1.5 mb-2 shrink-0">
                        <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${getNaturalezaColor(centro.naturaleza)}`}>
                            {centro.naturaleza || 'Centro'}
                        </span>

                        {affinity === 'high' ? (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-red-50 to-purple-50 text-red-600 rounded-full text-[9px] font-bold border border-red-100">
                                <Heart className="w-2.5 h-2.5 fill-current" />
                                <span className="hidden sm:inline">Muy afín</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[9px] font-bold">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span className="hidden sm:inline">Para ti</span>
                            </div>
                        )}

                        {/* Distancia si existe */}
                        {centro.distancia_km && (
                            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-bold border border-emerald-100">
                                <MapPin className="w-2.5 h-2.5" />
                                <span>{formatDistance(centro.distancia_km)}</span>
                            </div>
                        )}
                    </div>

                    {/* Fila 2: Nombre */}
                    <h3 className="font-bold text-[#223945] text-[11px] sm:text-[12px] leading-tight line-clamp-2 mb-1.5" title={centro.nombre}>
                        {centro.nombre}
                    </h3>

                    {/* Fila 3: Ciclo coincidente (si existe) */}
                    {cicloMatch && (
                        <div className="flex items-center gap-1 mb-1.5 min-w-0">
                            <GraduationCap className="w-3 h-3 text-purple-500 shrink-0" />
                            <span className="text-[10px] text-purple-700 font-medium truncate">
                                {cicloMatch}
                            </span>
                        </div>
                    )}

                    {/* Footer: Ubicación */}
                    <div className="flex items-center gap-1.5 text-neutral-500 mt-auto">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="text-[10px] sm:text-xs truncate">
                            {centro.localidad}, {centro.provincia}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
