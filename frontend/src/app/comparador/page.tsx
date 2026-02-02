'use client';

import { useComparison } from '@/context/ComparisonContext';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { ChevronLeft, Info, MapPin, Phone, Mail, Globe, Check, X, Loader2, AlertTriangle, GraduationCap, Scale } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface CentroDetail {
    id: number;
    nombre: string;
    naturaleza: string;
    direccion: string;
    localidad: string;
    provincia: string;
    codigo_postal: string;
    telefono: string;
    email: string;
    web: string;
    ciclos: Ciclo[];
    latitud: number;
    longitud: number;
}

interface Ciclo {
    id: number;
    ciclo_formativo: string;
    nivel_educativo: string;
    familia_profesional: string;
    modalidad: string;
    clave_ciclo: string;
}

export default function ComparadorPage() {
    const router = useRouter();
    const { selectedCentros, removeFromCompare } = useComparison();
    const [details, setDetails] = useState<CentroDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (selectedCentros.length === 0) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // Fetch details for all selected centers in parallel
                const promises = selectedCentros.map(c => 
                    api.get(`/centros/${c.id}`).then(res => res.data.data)
                );
                const results = await Promise.all(promises);
                setDetails(results);
            } catch (error) {
                console.error("Error fetching comparison details", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [selectedCentros]);

    // State for Mobile Carousel
    const [activeIndex, setActiveIndex] = useState(0);

    const scrollToCard = (index: number) => {
        const container = document.getElementById('comparison-carousel');
        if (container) {
            const cardWidth = container.clientWidth;
            container.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
            setActiveIndex(index);
        }
    };

    // Handle scroll snap updates
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const index = Math.round(container.scrollLeft / container.clientWidth);
        setActiveIndex(index);
    };

    // Helper functions for styling (matched to CentroCard)
    const getNaturalezaBadge = (naturaleza: string) => {
        switch (naturaleza?.toUpperCase()) {
            case "PÚBLICO": return "bg-blue-50/50 text-blue-700 border-blue-200/60 ring-1 ring-blue-100/50 backdrop-blur-sm";
            case "PRIVADO": return "bg-amber-50/50 text-amber-700 border-amber-200/60 ring-1 ring-amber-100/50 backdrop-blur-sm";
            case "CONCERTADO": return "bg-emerald-50/50 text-emerald-700 border-emerald-200/60 ring-1 ring-emerald-100/50 backdrop-blur-sm";
            default: return "bg-gray-50/50 text-gray-700 border-gray-200/60 backdrop-blur-sm";
        }
    };

    const getLevelColor = (nivel: string) => {
        switch (nivel?.toUpperCase()) {
            case "GRADO SUPERIOR": return "bg-purple-600/90 text-white border-purple-500/50 shadow-sm shadow-purple-500/20";
            case "GRADO MEDIO": return "bg-amber-500/90 text-white border-amber-500/50 shadow-sm shadow-amber-500/20";
            case "FP BÁSICA": return "bg-blue-600/90 text-white border-blue-600/50 shadow-sm shadow-blue-500/20";
            default: return "bg-neutral-600 text-white border-neutral-600";
        }
    };

    const getLevelBackground = (nivel: string) => {
        switch (nivel?.toUpperCase()) {
            case "GRADO SUPERIOR": return "bg-purple-50/30 border-purple-100/60 group-hover:border-purple-200/80";
            case "GRADO MEDIO": return "bg-amber-50/30 border-amber-100/60 group-hover:border-amber-200/80";
            case "FP BÁSICA": return "bg-blue-50/30 border-blue-100/60 group-hover:border-blue-200/80";
            default: return "bg-neutral-50/30 border-neutral-100/60";
        }
    };

    const getLevelDotColor = (nivel: string) => {
        switch (nivel?.toUpperCase()) {
            case "GRADO SUPERIOR": return "bg-purple-400";
            case "GRADO MEDIO": return "bg-amber-400";
            case "FP BÁSICA": return "bg-blue-400";
            default: return "bg-neutral-400";
        }
    };

    if (selectedCentros.length < 2) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
                {/* Icon wrapper similar to No Favorites */}
                <div className="bg-white/50 backdrop-blur-md p-6 rounded-full border border-neutral-200/60 mb-6 shadow-sm">
                    <Scale className="w-12 h-12 text-[#223945]/60" />
                </div>
                
                <h2 className="text-2xl font-bold text-[#223945] mb-2 text-center tracking-tight">
                    {selectedCentros.length === 0 ? "Comparador Vacío" : "Necesitas al menos 2 centros"}
                </h2>
                
                <p className="text-neutral-500 mb-8 max-w-md text-center text-sm leading-relaxed">
                    {selectedCentros.length === 0 
                        ? "Ve a tus favoritos para seleccionar los centros que quieres comparar."
                        : "Comparar un solo centro no tiene mucha gracia. ¡Añade otro para empezar el duelo!"}
                </p>

                <div className="flex gap-4">
                    <Link 
                        href="/favoritos"
                        className="bg-[#223945] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-[#223945]/30 hover:-translate-y-0.5 transition-all"
                    >
                        Ir a Favoritos
                    </Link>
                    {selectedCentros.length > 0 && (
                         <button 
                            onClick={() => removeFromCompare(selectedCentros[0].id)}
                            className="px-8 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50/50 hover:text-red-600 transition-colors backdrop-blur-sm"
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-gradient pt-20 pb-12 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto"> 
                <button 
                    onClick={() => router.back()} 
                    className="inline-flex items-center gap-2 text-neutral-500 hover:text-[#223945] mb-8 font-bold transition-colors text-sm uppercase tracking-wide group"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Volver
                </button>

                <div className="mb-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#223945] mb-2 flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-[#223945] to-[#374f5e] text-white rounded-xl shadow-lg shadow-[#223945]/20">
                            <Scale className="w-6 h-6" />
                        </div>
                        Comparador de Centros
                    </h1>
                    <p className="text-neutral-500 max-w-2xl text-sm mb-8 pl-[3.5rem] leading-relaxed">
                        Analiza las fortalezas de cada centro lado a lado.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-[#223945]" />
                    </div>
                ) : (
                    <div className={`
                        relative bg-white/40 backdrop-blur-xl rounded-3xl 
                        shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 
                        overflow-hidden p-6 md:p-8 transition-all duration-500
                        ${details.length === 2 ? 'max-w-5xl' : ''}
                    `}>
                        {/* Decorative Top Gradient - More subtle */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#223945]/80 via-blue-500/80 to-blue-300/80"></div>
                        
                        {/* MOBILE INDICATORS */}
                        <div className="md:hidden flex justify-center gap-2 mb-6">
                            {details.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => scrollToCard(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-6 bg-[#223945]' : 'w-2 bg-[#223945]/20'}`}
                                />
                            ))}
                        </div>

                        {/* CAROUSEL / GRID CONTAINER */}
                        <div 
                            id="comparison-carousel"
                            onScroll={handleScroll}
                            className={`
                                flex md:grid gap-6 
                                overflow-x-auto snap-x snap-mandatory 
                                pb-6 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible
                                scrollbar-hide
                                ${details.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}
                            `}
                        >
                            {details.map((d) => (
                                <div 
                                    key={d.id} 
                                    className="
                                        flex-shrink-0 w-full md:w-auto 
                                        bg-white/80 backdrop-blur-md rounded-2xl border border-white/50
                                        shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]
                                        snap-center flex flex-col overflow-hidden relative
                                        hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-blue-100/50 hover:-translate-y-1
                                        transition-all duration-300
                                    "
                                >
                                    {/* Decorative Top Gradient - Matches CentroCard */}
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-primary-500 to-primary-300 z-10"></div>

                                    {/* CARD HEADER - Fixed Height for Alignment - Added Color Tint */}
                                    <div className="p-6 pb-4 border-b border-blue-100/30 relative flex flex-col items-start bg-gradient-to-b from-blue-50/40 via-white/60 to-white">
                                        <button 
                                            onClick={() => removeFromCompare(d.id)}
                                            className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-all"
                                            title="Quitar"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>

                                        {/* Nature Badge - Refined */}                                   {/* Naturaleza Badge - Matched to CentroCard */}
                                        <div className="mb-3">
                                            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getNaturalezaBadge(d.naturaleza)}`}>
                                                {d.naturaleza}
                                            </span>
                                        </div>
                                        
                                        {/* Name - Strict 2 lines truncation & Fixed Height - Reduced size */}
                                        <h3 
                                            className="text-[15px] font-bold text-[#111827] leading-tight min-h-[3rem] line-clamp-2 w-full pr-6 mb-1"
                                            title={d.nombre}
                                        >
                                            {d.nombre}
                                        </h3>
                                        
                                        <div className="flex items-center gap-2 mt-auto text-xs text-neutral-500 font-medium w-full">
                                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                            <span className="truncate">{d.localidad}</span>
                                        </div>
                                    </div>

                                    {/* CARD BODY - SCROLLABLE CONTENT */}
                                    <div className="flex-grow bg-neutral-50/20">
                                        {/* CONTACT SECTION */}
                                        <div className="p-5 border-b border-neutral-100/50">
                                            <h4 className="text-xs font-bold text-blue-900/80 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                Contacto
                                            </h4>
                                            <div className="space-y-2.5">
                                                {d.web && (
                                                    <a href={d.web.startsWith('http') ? d.web : `http://${d.web}`} target="_blank" className="flex items-center gap-3 text-sm text-[#223945] hover:text-blue-600 transition-colors group">
                                                        <div className="p-1.5 bg-[#223945] rounded-lg shadow-sm group-hover:shadow-md transition-all shrink-0">
                                                            <Globe className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                        <span className="font-semibold underline decoration-neutral-200 underline-offset-4 group-hover:decoration-blue-400 truncate">Visitar Web</span>
                                                    </a>
                                                )}
                                                {d.telefono && (
                                                    <div className="flex items-center gap-3 text-sm text-neutral-600">
                                                        <div className="p-1.5 bg-[#223945] rounded-lg shadow-sm shrink-0">
                                                            <Phone className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                        <span className="font-mono text-xs font-medium">{d.telefono}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* ACADEMIC OFFER - COMPACT LIST */}
                                        <div className="p-5">
                                             <h4 className="text-xs font-bold text-blue-900/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4 text-blue-600" />
                                                Oferta Educativa
                                            </h4>

                                            {d.ciclos && d.ciclos.length > 0 ? (
                                                <div className="space-y-5">
                                                     {/* Group unique families for this center */}
                                                    {Object.entries(
                                                        d.ciclos.reduce((acc, c) => {
                                                            if (!acc[c.familia_profesional]) acc[c.familia_profesional] = [];
                                                            acc[c.familia_profesional].push(c);
                                                            return acc;
                                                        }, {} as Record<string, Ciclo[]>)
                                                    ).sort().map(([familia, ciclos]) => (
                                                        <div key={familia}>
                                                            {/* Family Header - Larger & Bolder */}
                                                            <div className="flex items-center gap-2 mb-2 text-[#223945]">
                                                                <div className="w-1 h-3.5 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full shrink-0"></div>
                                                                <h5 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-tight leading-tight text-[#111827]">
                                                                    {familia}
                                                                </h5>
                                                            </div>

                                                            {/* Cycles Chips - More Vibrant Colors (CentroCard Style) */}
                                                            <div className="flex flex-col gap-1.5 pl-3">
                                                                {ciclos.map(c => (
                                                                    <div 
                                                                        key={c.id} 
                                                                        className={`w-full flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border shadow-sm transition-colors group/chip ${getLevelBackground(c.nivel_educativo)}`}
                                                                    >
                                                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getLevelDotColor(c.nivel_educativo)}`}></div>
                                                                        
                                                                        <p className="flex-1 text-[12px] font-medium text-neutral-700 leading-snug mb-0 truncate">
                                                                            {c.ciclo_formativo}
                                                                            {c.modalidad && (
                                                                                <span className="ml-1 text-[9px] text-neutral-400 font-normal uppercase">
                                                                                    {/* Truncate or simplify modality if needed */}
                                                                                    ({c.modalidad.substring(0, 3)})
                                                                                </span>
                                                                            )}
                                                                        </p>

                                                                        <span className={`
                                                                            text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow-sm shrink-0
                                                                            ${getLevelColor(c.nivel_educativo)}
                                                                        `}>
                                                                            {c.nivel_educativo === 'Grado Superior' ? 'GS' : c.nivel_educativo === 'Grado Medio' ? 'GM' : 'FPB'}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 text-neutral-400 text-xs italic bg-white/50 rounded-xl border border-dashed border-neutral-200">
                                                    Sin datos académicos
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
