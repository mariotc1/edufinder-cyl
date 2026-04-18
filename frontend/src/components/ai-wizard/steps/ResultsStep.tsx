'use client';

import { motion } from 'framer-motion';
import { Trophy, MapPin, Building2, ExternalLink, RotateCcw, X, Sparkles, Heart } from 'lucide-react';
import Link from 'next/link';
import { Centro } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useFavorite } from '@/hooks/useFavorite';
import { useRef } from 'react';

interface ResultsStepProps {
    results: Centro[];
    onReset: () => void;
    onClose: () => void;
}

// Componente de card individual para usar el hook de favoritos
function ResultCard({ centro, index }: { centro: Centro; index: number }) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { isFavorite, toggleFavorite, loading } = useFavorite({
        centro,
        initialIsFavorite: centro.isFavorito ?? false
    });

    const handleFavoriteClick = (e: React.MouseEvent) => {
        toggleFavorite(e, buttonRef.current || undefined);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="relative"
        >
            <Link
                href={`/centro/${centro.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-white border border-neutral-200 rounded-xl hover:border-[#223945]/40 hover:shadow-md transition-all group"
            >
                <div className="flex items-start gap-3">
                    {/* Icono del centro */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        centro.naturaleza?.toUpperCase() === 'PÚBLICO'
                            ? 'bg-blue-50'
                            : 'bg-amber-50'
                    }`}>
                        <Building2 className={`w-5 h-5 ${
                            centro.naturaleza?.toUpperCase() === 'PÚBLICO'
                                ? 'text-blue-600'
                                : 'text-amber-600'
                        }`} />
                    </div>

                    {/* Info principal */}
                    <div className="flex-1 min-w-0 pr-14">
                        {/* Badges */}
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                                centro.naturaleza?.toUpperCase() === 'PÚBLICO'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-amber-100 text-amber-700'
                            }`}>
                                {centro.naturaleza || 'Centro'}
                            </span>
                            {centro.distancia !== undefined && centro.distancia !== null && (
                                <span className="text-[9px] text-neutral-400 flex items-center gap-0.5">
                                    <MapPin className="w-2.5 h-2.5" />
                                    {parseFloat(String(centro.distancia)).toFixed(1)} km
                                </span>
                            )}
                        </div>

                        {/* Nombre */}
                        <h4 className="font-semibold text-[#223945] text-[13px] leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {centro.nombre}
                        </h4>

                        {/* Ubicación */}
                        <p className="text-[11px] text-neutral-500">
                            {centro.localidad}, {centro.provincia}
                        </p>

                        {/* Ciclos si existen */}
                        {centro.ciclos && centro.ciclos.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                                {centro.ciclos.slice(0, 2).map((ciclo, idx) => (
                                    <span
                                        key={idx}
                                        className="text-[9px] px-1.5 py-0.5 bg-[#223945]/5 text-[#223945] rounded"
                                    >
                                        {ciclo.ciclo_formativo}
                                    </span>
                                ))}
                                {centro.ciclos.length > 2 && (
                                    <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">
                                        +{centro.ciclos.length - 2}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Indicador nueva pestaña */}
                    <div className="flex-shrink-0 self-center">
                        <div className="w-7 h-7 rounded-full bg-neutral-100 group-hover:bg-[#223945] flex items-center justify-center transition-all">
                            <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </div>
            </Link>

            {/* Botón favorito */}
            <button
                ref={buttonRef}
                onClick={handleFavoriteClick}
                disabled={loading}
                className={`absolute top-3 right-12 w-7 h-7 rounded-full flex items-center justify-center transition-all z-10 ${
                    isFavorite
                        ? 'bg-red-50 text-red-500 hover:bg-red-100'
                        : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200 hover:text-red-400'
                }`}
                title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
                <Heart className={`w-3.5 h-3.5 transition-all ${isFavorite ? 'fill-current' : ''} ${loading ? 'animate-pulse' : ''}`} />
            </button>
        </motion.div>
    );
}

export default function ResultsStep({ results, onReset, onClose }: ResultsStepProps) {
    const { user } = useAuth();
    const hasResults = results.length > 0;
    const userName = user?.name?.split(' ')[0];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-3 px-4 sm:px-6 flex flex-col h-full max-h-[70vh]"
        >
            {/* Header compacto - NO scrolleable */}
            <div className="text-center mb-2 flex-shrink-0">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="inline-flex mb-1.5"
                >
                    <div className="relative">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                            className="absolute inset-0 bg-[#223945] rounded-full"
                        />
                        <div className="relative p-2.5 bg-gradient-to-br from-[#223945] to-blue-600 rounded-full shadow-lg shadow-[#223945]/25">
                            {hasResults ? (
                                <Trophy className="w-4 h-4 text-white" />
                            ) : (
                                <Sparkles className="w-4 h-4 text-white" />
                            )}
                        </div>
                    </div>
                </motion.div>
                <h3 className="text-base sm:text-lg font-bold text-[#223945] mb-0.5">
                    {hasResults
                        ? userName
                            ? `${userName}, encontré ${results.length} centro${results.length !== 1 ? 's' : ''} para ti`
                            : `Encontré ${results.length} centro${results.length !== 1 ? 's' : ''} para ti`
                        : userName
                            ? `${userName}, no encontré centros`
                            : 'No encontré centros'
                    }
                </h3>
                <p className="text-neutral-500 text-[11px] sm:text-xs">
                    {hasResults
                        ? 'Pulsa en cualquiera para ver más detalles'
                        : 'Prueba a ampliar tus criterios'
                    }
                </p>
            </div>

            {/* Lista de resultados - SOLO ESTA ZONA ES SCROLLEABLE */}
            {hasResults ? (
                <div className="flex-1 overflow-y-auto min-h-0 mb-3 -mx-1 px-1">
                    <div className="space-y-2">
                        {results.map((centro, index) => (
                            <ResultCard key={centro.id} centro={centro} index={index} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-6">
                    <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                        <MapPin className="w-7 h-7 text-neutral-400" />
                    </div>
                    <p className="text-neutral-500 text-sm text-center">
                        No hay centros que coincidan con tus criterios
                    </p>
                </div>
            )}

            {/* Botones - NO scrolleable */}
            <div className="flex gap-2 flex-shrink-0 mt-auto">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex items-center justify-center gap-1 px-3 py-2.5 bg-white border border-neutral-200 text-neutral-600 font-semibold rounded-xl hover:bg-neutral-50 transition-colors text-[13px]"
                >
                    <X className="w-3.5 h-3.5" />
                    Cerrar
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onReset}
                    className="flex-1 relative flex items-center justify-center gap-1.5 px-4 py-2.5 font-semibold rounded-xl transition-all text-[13px] overflow-hidden bg-gradient-to-r from-[#223945] via-[#2d4a5e] to-blue-600 text-white shadow-lg shadow-[#223945]/25 hover:shadow-xl hover:shadow-[#223945]/30"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Nueva búsqueda</span>
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '200%' }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'linear', repeatDelay: 2 }}
                        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    />
                </motion.button>
            </div>
        </motion.div>
    );
}
