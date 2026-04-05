'use client';

import { useVisitedCenters, VisitedCentro } from '@/hooks/useVisitedCenters';
import Link from 'next/link';
import { History, MapPin, X, ChevronRight, Trash2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// COMPONENTE: SECCIÓN DE CENTROS VISITADOS RECIENTEMENTE
// Muestra un carrusel horizontal con los últimos centros visitados por el usuario
export default function VisitedCentersSection() {
    const { visitedCenters, loading, removeFromHistory, clearHistory } = useVisitedCenters();
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    // No mostrar si no hay historial o está cargando
    if (loading || visitedCenters.length === 0) {
        return null;
    }

    const getNaturalezaColor = (naturaleza: string) => {
        switch (naturaleza?.toUpperCase()) {
            case 'PÚBLICO': return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100';
            case 'PRIVADO': return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-100';
            default: return 'bg-neutral-50 text-neutral-600 border-neutral-200';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora mismo';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays} días`;
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    return (
        <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#223945]/10 rounded-lg">
                            <History className="w-5 h-5 text-[#223945]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#223945]">Visitados recientemente</h2>
                            <p className="text-sm text-neutral-500">Los últimos centros que has explorado</p>
                        </div>
                    </div>

                    {/* Botón limpiar historial */}
                    <div className="relative">
                        <button
                            onClick={() => setShowClearConfirm(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Limpiar</span>
                        </button>

                        {/* Confirmación de limpiar */}
                        <AnimatePresence>
                            {showClearConfirm && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute right-0 top-full mt-2 p-4 bg-white rounded-xl shadow-xl border border-neutral-200 z-50 w-64"
                                >
                                    <p className="text-sm font-medium text-neutral-700 mb-3">
                                        ¿Eliminar todo el historial?
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowClearConfirm(false)}
                                            className="flex-1 px-3 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={() => {
                                                clearHistory();
                                                setShowClearConfirm(false);
                                            }}
                                            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Carrusel horizontal */}
                <div className="relative">
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                        {visitedCenters.map((centro, index) => (
                            <motion.div
                                key={centro.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex-shrink-0 snap-start"
                            >
                                <VisitedCentroCard
                                    centro={centro}
                                    onRemove={() => removeFromHistory(centro.id)}
                                    getNaturalezaColor={getNaturalezaColor}
                                    formatDate={formatDate}
                                />
                            </motion.div>
                        ))}

                        {/* Ver más placeholder */}
                        {visitedCenters.length >= 5 && (
                            <div className="flex-shrink-0 snap-start w-[200px] flex items-center justify-center">
                                <Link
                                    href="/perfil"
                                    className="flex flex-col items-center gap-2 p-4 text-neutral-400 hover:text-[#223945] transition-colors"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                    <span className="text-sm font-medium">Ver perfil</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Gradient fade en los bordes */}
                    <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-[#f8fafc] to-transparent pointer-events-none"></div>
                </div>
            </div>
        </section>
    );
}

// Componente individual de tarjeta de centro visitado
function VisitedCentroCard({
    centro,
    onRemove,
    getNaturalezaColor,
    formatDate
}: {
    centro: VisitedCentro;
    onRemove: () => void;
    getNaturalezaColor: (n: string) => string;
    formatDate: (d: string) => string;
}) {
    return (
        <div className="relative group w-[280px] sm:w-[320px]">
            <div className="relative bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-[#223945]/30 hover:shadow-lg transition-all">
                {/* Degradado corporativo superior */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-primary-500 to-primary-300"></div>

                <div className="p-4 pt-5">
                    {/* Badge de naturaleza + tiempo de visita */}
                    <div className="flex items-center gap-2 mb-3 pr-8">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${getNaturalezaColor(centro.naturaleza)}`}>
                            {centro.naturaleza || 'Centro'}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium">
                            {formatDate(centro.visitedAt)}
                        </span>
                    </div>

                    {/* Nombre del centro */}
                    <h3 className="font-bold text-[#223945] text-sm leading-tight mb-2 line-clamp-2 min-h-[2.5rem]">
                        {centro.nombre}
                    </h3>

                    {/* Ubicación */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-neutral-500">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs truncate">{centro.localidad}, {centro.provincia}</span>
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

                {/* Botón eliminar (siempre visible) */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="absolute top-3 right-2 p-1.5 rounded-full bg-white/90 text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm border border-neutral-100"
                    title="Eliminar del historial"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
