'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { Sparkles, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import RecommendationCard from './RecommendationCard';
import { Centro } from '@/types';

// Fetcher para SWR
const fetcher = async (url: string) => {
    const { default: axios } = await import('@/lib/axios');
    const response = await axios.get(url);
    return response.data;
};

export default function RecommendationsSection() {
    const { user } = useAuth();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Solo fetch si hay usuario logueado
    const { data, isLoading, error } = useSWR(
        user ? '/recommendations/favorites' : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000 // Cache por 1 minuto
        }
    );

    const recommendations: Centro[] = data?.recommendations || [];

    const [scrollProgress, setScrollProgress] = useState(0);

    // Verificar estado del scroll
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
    }, [recommendations, checkScrollState]);

    // Función para hacer scroll
    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const cardWidth = 320 + 16;
        const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;

        container.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    };

    // No mostrar si no hay usuario, está cargando sin datos, hay error, o no hay recomendaciones
    if (!user || isLoading || error || recommendations.length === 0) {
        return null;
    }

    return (
        <section className="py-8 sm:py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Icono estático */}
                        <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg shadow-purple-500/20">
                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-[#223945]">
                                Basado en tus favoritos
                            </h2>
                            <p className="text-xs sm:text-sm text-neutral-500">
                                Centros que podrían interesarte
                            </p>
                        </div>
                    </div>

                    {/* Patrones detectados */}
                    {data?.patterns?.top_provincias?.length > 0 && (
                        <div className="hidden sm:flex items-center gap-2">
                            {data.patterns.top_provincias.slice(0, 2).map((prov: string) => (
                                <div
                                    key={prov}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100/50 text-purple-700/80 text-xs font-medium rounded-full"
                                >
                                    <MapPin className="w-3 h-3" />
                                    <span className="capitalize">{prov.toLowerCase()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Carrusel */}
                <div className="relative group/carousel">
                    {/* Flecha izquierda */}
                    <AnimatePresence>
                        {canScrollLeft && (
                            <motion.button
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                onClick={() => scroll('left')}
                                className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-white border border-neutral-200 rounded-full shadow-lg hover:shadow-xl hover:border-purple-300 hover:scale-110 transition-all duration-200"
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
                                className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-white border border-neutral-200 rounded-full shadow-lg hover:shadow-xl hover:border-purple-300 hover:scale-110 transition-all duration-200"
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
                        {recommendations.map((centro, index) => (
                            <motion.div
                                key={centro.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                                className="flex-shrink-0 snap-start"
                            >
                                <RecommendationCard centro={centro} />
                            </motion.div>
                        ))}
                    </div>

                    {/* Gradient fade derecho */}
                    <div className="absolute right-0 top-0 bottom-6 w-12 sm:w-20 bg-gradient-to-l from-[#f8fafc] via-[#f8fafc]/80 to-transparent pointer-events-none z-10"></div>
                </div>

                {/* Indicador de progreso - solo visible si hay scroll */}
                {(canScrollLeft || canScrollRight) && (
                    <div className="mt-2 flex justify-center">
                        <div className="w-24 sm:w-32 h-1 bg-neutral-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
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
