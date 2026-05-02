'use client';

import { useVisitedCenters, VisitedCentro } from '@/hooks/useVisitedCenters';
import Link from 'next/link';
import { History, MapPin, X, ChevronRight, ChevronLeft, Trash2, Eye, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';

// COMPONENTE: SECCIÓN DE CENTROS VISITADOS RECIENTEMENTE
// Muestra un carrusel horizontal con los últimos centros visitados por el usuario
export default function VisitedCentersSection() {
    const { visitedCenters, loading, removeFromHistory, clearHistory } = useVisitedCenters();
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    // Estado para controlar el carrusel
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Función para verificar el estado del scroll
    const checkScrollState = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

        // Calcular progreso del scroll
        const maxScroll = scrollWidth - clientWidth;
        setScrollProgress(maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0);
    }, []);

    // Verificar estado del scroll al montar y cuando cambian los centros
    useEffect(() => {
        checkScrollState();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollState);
            window.addEventListener('resize', checkScrollState);
            return () => {
                container.removeEventListener('scroll', checkScrollState);
                window.removeEventListener('resize', checkScrollState);
            };
        }
    }, [visitedCenters, checkScrollState]);

    // Función para hacer scroll
    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const cardWidth = 320 + 16; // Ancho de card + gap
        const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;

        container.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    };

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
        <section className="py-8 sm:py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header mejorado */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Icono con diseño premium */}
                        <div className="relative">
                            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-[#223945] to-[#223945]/80 rounded-xl shadow-lg shadow-[#223945]/20">
                                <History className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            {/* Badge contador */}
                            <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-[#223945] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                                {visitedCenters.length}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-[#223945]">Visitados recientemente</h2>
                            <p className="text-xs sm:text-sm text-neutral-500">Retoma donde lo dejaste</p>
                        </div>
                    </div>

                    {/* Botón limpiar historial - Rediseñado */}
                    <div className="relative">
                        <button
                            onClick={() => setShowClearConfirm(true)}
                            className="group flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium text-neutral-500 bg-white border border-neutral-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                            <span className="hidden sm:inline">Borrar historial</span>
                        </button>

                        {/* Modal de confirmación mejorado */}
                        <AnimatePresence>
                            {showClearConfirm && (
                                <>
                                    {/* Overlay para cerrar al hacer clic fuera */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowClearConfirm(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="absolute right-0 top-full mt-3 p-5 bg-white rounded-2xl shadow-2xl border border-neutral-100 z-50 w-72"
                                    >
                                        {/* Icono de advertencia */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-red-100 rounded-xl">
                                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-neutral-800">¿Borrar historial?</p>
                                                <p className="text-xs text-neutral-500">Esta acción no se puede deshacer</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowClearConfirm(false)}
                                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    clearHistory();
                                                    setShowClearConfirm(false);
                                                }}
                                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-lg shadow-red-500/25"
                                            >
                                                Borrar todo
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Carrusel con controles */}
                <div className="relative group/carousel">
                    {/* Flecha izquierda */}
                    <AnimatePresence>
                        {canScrollLeft && (
                            <motion.button
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                onClick={() => scroll('left')}
                                className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-white border border-neutral-200 rounded-full shadow-lg hover:shadow-xl hover:border-[#223945] hover:scale-110 transition-all duration-200"
                                aria-label="Anterior"
                            >
                                <ChevronLeft className="w-5 h-5 text-[#223945]" />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* Flecha derecha */}
                    <AnimatePresence>
                        {canScrollRight && (
                            <motion.button
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                onClick={() => scroll('right')}
                                className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-white border border-neutral-200 rounded-full shadow-lg hover:shadow-xl hover:border-[#223945] hover:scale-110 transition-all duration-200"
                                aria-label="Siguiente"
                            >
                                <ChevronRight className="w-5 h-5 text-[#223945]" />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* Gradient fade izquierdo */}
                    <AnimatePresence>
                        {canScrollLeft && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute left-0 top-0 bottom-6 w-12 sm:w-20 bg-gradient-to-r from-[#f8fafc] via-[#f8fafc]/80 to-transparent pointer-events-none z-10"
                            />
                        )}
                    </AnimatePresence>

                    {/* Contenedor del carrusel */}
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                    >
                        {visitedCenters.map((centro, index) => (
                            <motion.div
                                key={centro.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{
                                    duration: 0.4,
                                    delay: Math.min(index * 0.03, 0.15),
                                    ease: [0.25, 0.1, 0.25, 1]
                                }}
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
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                                className="flex-shrink-0 snap-start w-[200px] flex items-center justify-center"
                            >
                                <Link
                                    href="/perfil"
                                    className="group flex flex-col items-center gap-3 p-6 text-neutral-400 hover:text-[#223945] transition-all"
                                >
                                    <div className="p-4 rounded-2xl bg-neutral-100 group-hover:bg-[#223945]/10 transition-colors">
                                        <ChevronRight className="w-8 h-8 transition-transform group-hover:translate-x-1" />
                                    </div>
                                    <span className="text-sm font-semibold">Ver perfil</span>
                                </Link>
                            </motion.div>
                        )}
                    </div>

                    {/* Gradient fade derecho - siempre visible si hay más contenido */}
                    <div className="absolute right-0 top-0 bottom-6 w-12 sm:w-20 bg-gradient-to-l from-[#f8fafc] via-[#f8fafc]/80 to-transparent pointer-events-none z-10"></div>
                </div>

                {/* Indicador de progreso - solo visible si hay scroll */}
                {(canScrollLeft || canScrollRight) && (
                    <div className="mt-2 flex justify-center">
                        <div className="w-24 sm:w-32 h-1 bg-neutral-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-[#223945] to-primary-500 rounded-full"
                                initial={{ width: '20%', x: 0 }}
                                animate={{
                                    width: '30%',
                                    x: `${scrollProgress * 0.7}%`
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        </div>
                    </div>
                )}
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
    // Formatear ubicación de forma compacta
    const formatLocation = (localidad: string, provincia: string) => {
        const loc = localidad || '';
        const prov = provincia || '';

        // Si la localidad es muy larga, solo mostrar provincia
        if (loc.length > 20) {
            return prov;
        }

        return `${loc}, ${prov}`;
    };

    return (
        <div className="relative group w-[280px] sm:w-[320px]">
            {/* Card con altura fija - mismo tamaño que RecommendationCard */}
            <div className="relative bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-[#223945]/30 hover:shadow-lg transition-all duration-200 h-[140px] sm:h-[150px] flex flex-col">
                {/* Degradado corporativo superior */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-primary-500 to-primary-300"></div>

                {/* Botones superiores: Ver centro + Eliminar */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                    {/* Botón ver centro */}
                    <Link
                        href={`/centro/${centro.id}`}
                        className="p-1.5 sm:p-2 rounded-full bg-[#223945] text-white shadow-md sm:shadow-lg hover:scale-110 hover:shadow-xl transition-all"
                        title="Ver centro"
                    >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Link>

                    {/* Botón eliminar */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="p-1.5 sm:p-2 rounded-full bg-white/90 text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-md sm:shadow-lg border border-neutral-100"
                        title="Eliminar del historial"
                    >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                </div>

                <div className="p-3 sm:p-4 pt-4 sm:pt-5 flex flex-col flex-1 pr-20">
                    {/* Badge de naturaleza + tiempo de visita */}
                    <div className="flex items-center gap-1.5 mb-2 shrink-0">
                        <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${getNaturalezaColor(centro.naturaleza)}`}>
                            {centro.naturaleza || 'Centro'}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium whitespace-nowrap">
                            {formatDate(centro.visitedAt)}
                        </span>
                    </div>

                    {/* Nombre del centro */}
                    <h3 className="font-bold text-[#223945] text-[11px] sm:text-[12px] leading-tight line-clamp-2 mb-1.5" title={centro.nombre}>
                        {centro.nombre}
                    </h3>

                    {/* Ubicación - siempre al fondo */}
                    <div className="flex items-center gap-1.5 text-neutral-500 mt-auto">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="text-[10px] sm:text-xs truncate">
                            {formatLocation(centro.localidad, centro.provincia)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
