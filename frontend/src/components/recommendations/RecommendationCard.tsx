'use client';

import { Sparkles, Heart, GraduationCap } from 'lucide-react';
import { Centro } from '@/types';

import CentroMiniCard from '@/components/CentroMiniCard';
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

    return (
        <CentroMiniCard
            centro={centro}
            meta={affinity === 'high' ? (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                    <Heart className="w-2.5 h-2.5 fill-current" />
                    Muy afín
                </span>
            ) : (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-bold">
                    <Sparkles className="w-2.5 h-2.5" />
                    Para ti
                </span>
            )}
            destacado={cicloMatch && (
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-50 text-purple-800 text-[11px] font-semibold min-w-0">
                    <GraduationCap className="w-3.5 h-3.5 shrink-0 text-purple-600" />
                    <span className="truncate">{cicloMatch}</span>
                </span>
            )}
        />
    );
}
