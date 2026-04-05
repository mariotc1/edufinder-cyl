'use client';

import { motion } from 'framer-motion';
import { CheckCircle, MapPin, Building2, ArrowRight, RotateCcw, X } from 'lucide-react';
import Link from 'next/link';
import { Centro } from '@/types';

interface ResultsStepProps {
    results: Centro[];
    onReset: () => void;
    onClose: () => void;
}

export default function ResultsStep({ results, onReset, onClose }: ResultsStepProps) {
    const hasResults = results.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-6 px-4"
        >
            {/* Header */}
            <div className="text-center mb-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="inline-flex p-3 bg-green-100 rounded-xl mb-3"
                >
                    <CheckCircle className="w-6 h-6 text-green-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-[#223945] mb-2">
                    {hasResults
                        ? `¡Encontramos ${results.length} centro${results.length !== 1 ? 's' : ''} para ti!`
                        : 'No encontramos centros'
                    }
                </h3>
                <p className="text-neutral-500 text-sm">
                    {hasResults
                        ? 'Estos son los que mejor se adaptan a tus preferencias'
                        : 'Prueba a ampliar tus criterios de búsqueda'
                    }
                </p>
            </div>

            {/* Lista de resultados */}
            {hasResults ? (
                <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-1">
                    {results.map((centro, index) => (
                        <motion.div
                            key={centro.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                href={`/centro/${centro.id}`}
                                onClick={onClose}
                                className="block p-4 bg-white border border-neutral-200 rounded-xl hover:border-[#223945]/30 hover:shadow-md transition-all group"
                            >
                                {/* Badge de naturaleza */}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                                        centro.naturaleza?.toUpperCase() === 'PÚBLICO'
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                        {centro.naturaleza || 'Centro'}
                                    </span>
                                    {centro.distancia !== undefined && centro.distancia !== null && (
                                        <span className="text-[10px] text-neutral-400">
                                            {parseFloat(String(centro.distancia)).toFixed(1)} km
                                        </span>
                                    )}
                                </div>

                                {/* Nombre */}
                                <h4 className="font-bold text-[#223945] text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {centro.nombre}
                                </h4>

                                {/* Info */}
                                <div className="flex items-center gap-4 text-xs text-neutral-500">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {centro.localidad}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Building2 className="w-3 h-3" />
                                        {centro.provincia}
                                    </span>
                                </div>

                                {/* Ciclos si existen */}
                                {centro.ciclos && centro.ciclos.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-neutral-100">
                                        <div className="flex flex-wrap gap-1">
                                            {centro.ciclos.slice(0, 3).map((ciclo, idx) => (
                                                <span
                                                    key={idx}
                                                    className="text-[9px] px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded-full"
                                                >
                                                    {ciclo.ciclo_formativo}
                                                </span>
                                            ))}
                                            {centro.ciclos.length > 3 && (
                                                <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded-full">
                                                    +{centro.ciclos.length - 3} más
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Flecha */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="w-4 h-4 text-[#223945]" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="py-8 text-center">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-neutral-400" />
                    </div>
                    <p className="text-neutral-500 mb-4">
                        No hay centros que coincidan con todos tus criterios.
                    </p>
                </div>
            )}

            {/* Botones */}
            <div className="flex gap-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onReset}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 text-neutral-600 font-semibold rounded-xl hover:bg-neutral-200 transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Nueva búsqueda
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#223945] text-white font-semibold rounded-xl hover:bg-[#1a2c35] transition-colors"
                >
                    <X className="w-4 h-4" />
                    Cerrar
                </motion.button>
            </div>
        </motion.div>
    );
}
