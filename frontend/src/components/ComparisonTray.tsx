'use client';

import { useComparison } from '@/context/ComparisonContext';
import { X, ArrowRight, Trash2, Scale, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// COMPONENTE BANDEJA DE COMPARACIÓN
// Muestra una barra flotante en la parte inferior cuando hay centros seleccionados para comparar
export default function ComparisonTray() {
    const { selectedCentros, removeFromCompare, clearComparison } = useComparison();
    const pathname = usePathname();
    const [expanded, setExpanded] = useState(false);

    // No renderizar si no hay seleccionados o estamos en la página de comparación
    if (selectedCentros.length === 0 || pathname === '/comparador') return null;

    const canCompare = selectedCentros.length >= 2;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0, x: '-50%' }}
                animate={{ y: 0, opacity: 1, x: '-50%' }}
                exit={{ y: 100, opacity: 0, x: '-50%' }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="fixed bottom-[5.5rem] md:bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
            >
                {/* Expanded view - list of centers */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="mb-2 bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden"
                        >
                            <div className="p-3 border-b border-neutral-100 bg-neutral-50">
                                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                                    Centros seleccionados ({selectedCentros.length}/3)
                                </p>
                            </div>
                            <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                                {selectedCentros.map((centro, idx) => (
                                    <div
                                        key={centro.id}
                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#223945] to-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <span className="flex-1 text-sm font-medium text-neutral-700 truncate">
                                            {centro.nombre}
                                        </span>
                                        <button
                                            onClick={() => removeFromCompare(centro.id)}
                                            className="p-1.5 rounded-full text-neutral-400 hover:text-red-500 hover:bg-red-50 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {selectedCentros.length < 3 && (
                                    <div className="flex items-center gap-3 p-2 rounded-xl border-2 border-dashed border-neutral-200 text-neutral-400">
                                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-neutral-300 flex items-center justify-center text-xs">
                                            +
                                        </div>
                                        <span className="text-sm">
                                            {selectedCentros.length < 2
                                                ? `Añade ${2 - selectedCentros.length} más para comparar`
                                                : 'Puedes añadir 1 más'
                                            }
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main floating bar */}
                <div className="
                    flex items-center justify-between p-2 rounded-2xl
                    bg-gradient-to-r from-[#223945] to-blue-600 backdrop-blur-2xl
                    border border-white/20 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)]
                ">
                    {/* Left: Expandable button with info */}
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-3 pl-2 pr-3 py-1 rounded-xl hover:bg-white/10 transition-colors flex-1 min-w-0"
                    >
                        <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Scale className="w-5 h-5 !text-white" />
                            </div>
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-[#223945] text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                                {selectedCentros.length}
                            </span>
                        </div>

                        <div className="text-left flex-1 min-w-0 overflow-hidden">
                            <p className="text-xs font-bold !text-white leading-none truncate whitespace-nowrap">
                                {canCompare ? 'Listo para comparar' : 'Selecciona centros'}
                            </p>
                            <p className="text-[10px] !text-white/70 mt-0.5 truncate whitespace-nowrap">
                                {selectedCentros.length}/3 · Toca para ver
                            </p>
                        </div>

                        <ChevronUp className={`w-4 h-4 !text-white/70 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Divider */}
                    <div className="h-8 w-px bg-white/20 mx-2 flex-shrink-0"></div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                            onClick={clearComparison}
                            className="p-2.5 rounded-xl text-white hover:text-red-400 hover:bg-white/10 transition-all"
                            title="Limpiar todo"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        {canCompare ? (
                            <Link
                                href="/comparador"
                                className="
                                    flex items-center gap-2
                                    bg-white text-[#223945]
                                    px-4 py-2.5 rounded-xl
                                    text-sm font-bold
                                    shadow-lg hover:shadow-xl
                                    transition-all hover:scale-[1.02] active:scale-95
                                "
                            >
                                <span className="hidden sm:inline">Comparar</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <div className="px-3 py-2.5 rounded-xl bg-white/20 text-white text-sm font-bold cursor-not-allowed">
                                +{2 - selectedCentros.length}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}