'use client';

import { useComparison } from '@/context/ComparisonContext';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { ChevronLeft, Info, MapPin, Phone, Mail, Globe, Check, X, Loader2, AlertTriangle, GraduationCap } from 'lucide-react';
import Link from 'next/link';
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
            case "PÚBLICO": return "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100";
            case "PRIVADO": return "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-100";
            case "CONCERTADO": return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-100";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const getLevelColor = (nivel: string) => {
        switch (nivel?.toUpperCase()) {
            case "GRADO SUPERIOR": return "bg-purple-600 text-white border-purple-600 shadow-sm";
            case "GRADO MEDIO": return "bg-amber-500 text-white border-amber-500 shadow-sm";
            case "FP BÁSICA": return "bg-blue-600 text-white border-blue-600 shadow-sm";
            default: return "bg-neutral-600 text-white border-neutral-600";
        }
    };

    const getLevelBackground = (nivel: string) => {
        switch (nivel?.toUpperCase()) {
            case "GRADO SUPERIOR": return "bg-purple-50 border-purple-100 group-hover:border-purple-200";
            case "GRADO MEDIO": return "bg-amber-50 border-amber-100 group-hover:border-amber-200";
            case "FP BÁSICA": return "bg-blue-50 border-blue-100 group-hover:border-blue-200";
            default: return "bg-neutral-50 border-neutral-100";
        }
    };

    const getLevelDotColor = (nivel: string) => {
        switch (nivel?.toUpperCase()) {
            case "GRADO SUPERIOR": return "bg-white/80";
            case "GRADO MEDIO": return "bg-white/80";
            case "FP BÁSICA": return "bg-white/80";
            default: return "bg-neutral-400";
        }
    };

    if (selectedCentros.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
                <div className="bg-neutral-100 p-6 rounded-full mb-6">
                    <AlertTriangle className="w-12 h-12 text-neutral-400" />
                </div>
                <h2 className="text-2xl font-bold text-[#223945] mb-2 text-center">No hay centros seleccionados</h2>
                <p className="text-neutral-500 mb-8 max-w-md text-center">
                    Añade hasta 3 centros desde el mapa o el buscador para ver sus diferencias.
                </p>
                <Link 
                    href="/mapa"
                    className="bg-[#223945] text-white px-8 py-3 rounded-xl font-bold hover:-translate-y-1 transition-transform shadow-lg shadow-[#223945]/20"
                >
                    Ir al Mapa
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-gradient pt-20 pb-12 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto"> 
                <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-[#223945] mb-8 font-bold transition-colors text-sm uppercase tracking-wide">
                    <ChevronLeft className="w-4 h-4" />
                    Volver
                </Link>

                <div className="mb-0">
                    <h1 className="text-2xl font-bold text-[#223945] mb-2 flex items-center gap-3">
                        Comparador de Centros
                    </h1>
                    <p className="text-neutral-500 max-w-2xl text-sm mb-8">
                        Analiza las fortalezas de cada centro lado a lado.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-[#223945]" />
                    </div>
                ) : (
                    <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 overflow-hidden p-6 md:p-8">
                        {/* Decorative Top Gradient */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>
                        
                        {/* MOBILE INDICATORS */}
                        <div className="md:hidden flex justify-center gap-2 mb-6">
                            {details.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => scrollToCard(idx)}
                                    className={`h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-8 bg-[#223945]' : 'w-2 bg-neutral-200'}`}
                                />
                            ))}
                        </div>

                        {/* CAROUSEL / GRID CONTAINER */}
                        <div 
                            id="comparison-carousel"
                            onScroll={handleScroll}
                            className="
                                flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 
                                overflow-x-auto snap-x snap-mandatory 
                                pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible
                                scrollbar-hide
                            "
                        >
                            {details.map((d) => (
                                <div 
                                    key={d.id} 
                                    className="
                                        flex-shrink-0 w-full md:w-auto 
                                        bg-white rounded-2xl border border-neutral-100 shadow-sm 
                                        snap-center flex flex-col overflow-hidden
                                        hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[#223945]/20 transition-all duration-300
                                    "
                                >
                                    {/* CARD HEADER - Fixed Height for Alignment */}
                                    <div className="p-6 pb-4 border-b border-neutral-50 relative flex flex-col">
                                        <button 
                                            onClick={() => removeFromCompare(d.id)}
                                            className="absolute top-4 right-4 p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                            title="Eliminar"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                        
                                        {/* Naturaleza Badge - Matched to CentroCard */}
                                        <div className="mb-4">
                                            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getNaturalezaBadge(d.naturaleza)}`}>
                                                {d.naturaleza}
                                            </span>
                                        </div>
                                        
                                        {/* Name - Fixed Min Height for Alignment */}
                                        <h3 className="text-lg font-bold text-[#223945] leading-tight min-h-[4rem] flex items-start">
                                            {d.nombre}
                                        </h3>
                                        
                                        <div className="flex items-center gap-2 mt-2 text-sm text-neutral-500 font-medium">
                                            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                                            <span className="truncate">{d.localidad}</span>
                                        </div>
                                    </div>

                                    {/* CARD BODY - SCROLLABLE CONTENT */}
                                    <div className="p-0 flex-grow bg-neutral-50/30">
                                        {/* CONTACT SECTION */}
                                        <div className="p-6 border-b border-neutral-100">
                                            <h4 className="text-xs font-bold text-[#223945] uppercase tracking-wider mb-3 opacity-60">Contacto</h4>
                                            <div className="space-y-3">
                                                {d.web && (
                                                    <a href={d.web.startsWith('http') ? d.web : `http://${d.web}`} target="_blank" className="flex items-center gap-3 text-sm text-[#223945] hover:text-blue-600 transition-colors group">
                                                        <div className="p-2 bg-white rounded-lg border border-neutral-100 shadow-sm group-hover:border-blue-200">
                                                            <Globe className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-bold underline decoration-neutral-200 underline-offset-4 group-hover:decoration-blue-400 truncate">Visitar Web</span>
                                                    </a>
                                                )}
                                                {d.telefono && (
                                                    <div className="flex items-center gap-3 text-sm text-neutral-600">
                                                        <div className="p-2 bg-white rounded-lg border border-neutral-100 shadow-sm">
                                                            <Phone className="w-4 h-4" />
                                                        </div>
                                                        <span>{d.telefono}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* ACADEMIC OFFER - COMPACT LIST */}
                                        <div className="p-6">
                                             <h4 className="text-xs font-bold text-[#223945] uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4" />
                                                Oferta Educativa
                                            </h4>

                                            {d.ciclos && d.ciclos.length > 0 ? (
                                                <div className="space-y-6">
                                                     {/* Group unique families for this center */}
                                                    {Object.entries(
                                                        d.ciclos.reduce((acc, c) => {
                                                            if (!acc[c.familia_profesional]) acc[c.familia_profesional] = [];
                                                            acc[c.familia_profesional].push(c);
                                                            return acc;
                                                        }, {} as Record<string, Ciclo[]>)
                                                    ).sort().map(([familia, ciclos]) => (
                                                        <div key={familia}>
                                                            {/* Family Header */}
                                                            <div className="flex items-center gap-2 mb-2 text-[#223945]">
                                                                <div className="w-1 h-4 bg-[#223945] rounded-full shrink-0"></div>
                                                                <h5 className="text-[11px] font-extrabold uppercase tracking-tight leading-tight">
                                                                    {familia}
                                                                </h5>
                                                            </div>

                                                            {/* Cycles Chips - More Vibrant Colors (CentroCard Style) */}
                                                            <div className="flex flex-col gap-2 pl-3">
                                                                {ciclos.map(c => (
                                                                    <div 
                                                                        key={c.id} 
                                                                        className={`w-full flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg border shadow-sm transition-colors group/chip ${getLevelBackground(c.nivel_educativo)}`}
                                                                    >
                                                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getLevelDotColor(c.nivel_educativo)}`}></div>
                                                                        
                                                                        <p className="flex-1 text-[13px] font-medium text-neutral-800 leading-snug mb-0">
                                                                            {c.ciclo_formativo}
                                                                            {c.modalidad && (
                                                                                <span className="block text-[10px] text-neutral-500 font-normal mt-0.5">
                                                                                    {c.modalidad}
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
                                                <div className="text-center py-8 text-neutral-400 italic bg-white rounded-xl border border-dashed border-neutral-200">
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
