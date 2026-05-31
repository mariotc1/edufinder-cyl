'use client';

import { useComparison } from '@/context/ComparisonContext';
import { useEffect, useState, useRef, Suspense, useCallback } from 'react';
import api from '@/lib/axios';
import { ChevronLeft, Info, MapPin, Phone, Mail, Globe, Check, X, Loader2, AlertTriangle, GraduationCap, Scale, Download, Share2, Link2, Copy, CheckCircle } from 'lucide-react';
import { hapticFeedback } from '@/lib/haptics';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';

// Wrapper component for Suspense - Exportado para usar desde page.tsx
export default function ComparadorContent() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#223945]" />
            </div>
        }>
            <ComparadorPage />
        </Suspense>
    );
}

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

// PÁGINA DE COMPARADOR DE CENTROS
function ComparadorPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { selectedCentros, removeFromCompare, addToCompare } = useComparison();
    const [details, setDetails] = useState<CentroDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);
    const [loadedFromUrl, setLoadedFromUrl] = useState(false);

    // Evitar problemas de hidratación y scroll to top al montar
    useEffect(() => {
        setIsHydrated(true);
        // Scroll to top cuando se navega a la página
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    // Load centers from URL params (for shared links)
    useEffect(() => {
        const centrosParam = searchParams.get('centros');
        if (centrosParam && !loadedFromUrl && isHydrated) {
            setLoadedFromUrl(true); // Bloquear inmediatamente para evitar bucles
            
            const ids = centrosParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
            if (ids.length >= 1) {
                const fetchAndAdd = async () => {
                    try {
                        const promises = ids.slice(0, 3).map(id =>
                            api.get(`/centros/${id}`).then(res => res.data.data)
                        );
                        const results = await Promise.all(promises);
                        results.forEach(centro => {
                            addToCompare(centro);
                        });
                    } catch (error) {
                        console.error("Error loading from URL:", error);
                    }
                };
                fetchAndAdd();
            }
        }
    }, [searchParams, loadedFromUrl, isHydrated, addToCompare]);

    // Efecto para obtener detalles completos
    useEffect(() => {
        if (!isHydrated) return;

        const fetchDetails = async () => {
            if (selectedCentros.length === 0) {
                setIsLoading(false);
                setDetails([]);
                return;
            }

            setIsLoading(true);
            try {
                const promises = selectedCentros.map(c =>
                    api.get(`/centros/${c.id}`).then(res => res.data.data)
                );
                const results = await Promise.all(promises);
                setDetails(results);
                // Haptic feedback cuando la comparación está lista
                if (results.length >= 2) {
                    hapticFeedback('success');
                }
            } catch (error) {
                console.error("Error fetching comparison details", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [selectedCentros, isHydrated]); // Dependencia directa de selectedCentros ahora que el contexto es estable

    const [activeIndex, setActiveIndex] = useState(0);

    const scrollToCard = (index: number) => {
        const container = document.getElementById('comparison-carousel');
        if (container) {
            const cardWidth = container.clientWidth;
            container.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
            setActiveIndex(index);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const index = Math.round(container.scrollLeft / container.clientWidth);
        setActiveIndex(index);
    };

    const getNaturalezaBadge = (naturaleza: string) => {
        switch (naturaleza?.toUpperCase()) {
            case "PÚBLICO": return "bg-blue-50/50 text-blue-700 border-blue-200/60 ring-1 ring-blue-100/50 backdrop-blur-sm";
            case "PRIVADO": return "bg-amber-50/50 text-amber-700 border-amber-200/60 ring-1 ring-amber-100/50 backdrop-blur-sm";
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

    // Share functionality
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const shareMenuRef = useRef<HTMLDivElement>(null);

    // Close share menu on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
                setShowShareMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getShareUrl = () => {
        if (typeof window === 'undefined') return '';
        const ids = details.map(d => d.id).join(',');
        return `${window.location.origin}/comparador?centros=${ids}`;
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(getShareUrl());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Error copying link:', err);
        }
    };

    const handleShareWhatsApp = () => {
        const centrosCount = details.length;
        const centrosList = details.map(d => `- ${d.nombre}`).join('\n');
        const text = `Mira, he comparado estos ${centrosCount} centros con EduFinder CyL, ¿que te parece?\n\n${centrosList}\n\nEchale un vistazo: ${getShareUrl()}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        setShowShareMenu(false);
    };

    const handleShareNative = async () => {
        if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
            try {
                await navigator.share({
                    title: 'Comparación de Centros - EduFinder',
                    text: `Compara estos centros: ${details.map(d => d.nombre).join(', ')}`,
                    url: getShareUrl(),
                });
            } catch (err) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        }
        setShowShareMenu(false);
    };

    // PDF Generation
    const [generatingPdf, setGeneratingPdf] = useState(false);

    const generatePDF = async () => {
        if (details.length === 0) return;
        setGeneratingPdf(true);

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            const colWidth = (pageWidth - margin * 2 - (details.length - 1) * 5) / details.length;
            let y = margin;

            // Header
            pdf.setFillColor(34, 57, 69);
            pdf.rect(0, 0, pageWidth, 32, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Comparacion de Centros', margin, 16);

            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`EduFinder CyL - ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, 25);

            y = 42;

            details.forEach((centro, idx) => {
                const x = margin + idx * (colWidth + 5);
                let localY = y;
                pdf.setFillColor(249, 250, 251);
                pdf.setDrawColor(229, 231, 235);
                pdf.roundedRect(x, localY, colWidth, 50, 2, 2, 'FD');

                pdf.setFontSize(7);
                pdf.setFont('helvetica', 'bold');
                if (centro.naturaleza?.toUpperCase() === 'PÚBLICO' || centro.naturaleza?.toUpperCase() === 'PUBLICO') {
                    pdf.setFillColor(219, 234, 254);
                    pdf.setTextColor(29, 78, 216);
                } else {
                    pdf.setFillColor(254, 243, 199);
                    pdf.setTextColor(180, 83, 9);
                }
                const badgeText = centro.naturaleza?.toUpperCase() || 'N/A';
                pdf.roundedRect(x + 4, localY + 4, 22, 5, 1, 1, 'F');
                pdf.text(badgeText, x + 6, localY + 7.5);

                pdf.setTextColor(17, 24, 39);
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                const nameLines = pdf.splitTextToSize(centro.nombre, colWidth - 10);
                pdf.text(nameLines.slice(0, 2), x + 4, localY + 16);

                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(107, 114, 128);
                pdf.text(`${centro.localidad}, ${centro.provincia}`, x + 4, localY + 30);

                localY += 34;
                pdf.setFontSize(7);
                pdf.setTextColor(75, 85, 99);
                if (centro.web) {
                    const webText = centro.web.replace(/^https?:\/\//, '').substring(0, 28);
                    pdf.text(`Web: ${webText}`, x + 4, localY);
                    localY += 4;
                }
                if (centro.telefono) {
                    pdf.text(`Tel: ${centro.telefono}`, x + 4, localY);
                }
            });

            y += 58;
            pdf.setDrawColor(209, 213, 219);
            pdf.setLineWidth(0.3);
            pdf.line(margin, y, pageWidth - margin, y);
            y += 8;

            pdf.setTextColor(34, 57, 69);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text('OFERTA EDUCATIVA', margin, y);
            y += 10;

            const allFamilies = new Set<string>();
            details.forEach(centro => {
                centro.ciclos?.forEach(c => allFamilies.add(c.familia_profesional));
            });
            const sortedFamilies = Array.from(allFamilies).sort();

            sortedFamilies.forEach(familia => {
                if (y > pageHeight - 35) {
                    pdf.addPage();
                    y = margin;
                }
                pdf.setFillColor(34, 57, 69);
                pdf.rect(margin, y, pageWidth - margin * 2, 6, 'F');
                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(255, 255, 255);
                pdf.text(familia.toUpperCase(), margin + 3, y + 4.2);
                y += 10;

                details.forEach((centro, idx) => {
                    const x = margin + idx * (colWidth + 5);
                    const ciclosInFamily = centro.ciclos?.filter(c => c.familia_profesional === familia) || [];
                    pdf.setFontSize(6);
                    let cicloY = y;
                    if (ciclosInFamily.length === 0) {
                        pdf.setTextColor(156, 163, 175);
                        pdf.setFont('helvetica', 'italic');
                        pdf.text('No disponible', x, cicloY);
                    } else {
                        ciclosInFamily.forEach(ciclo => {
                            if (cicloY > pageHeight - 15) return;
                            const levelShort = ciclo.nivel_educativo === 'Grado Superior' ? 'GS' :
                                              ciclo.nivel_educativo === 'Grado Medio' ? 'GM' : 'FPB';

                            if (ciclo.nivel_educativo?.toUpperCase() === 'GRADO SUPERIOR') pdf.setFillColor(147, 51, 234);
                            else if (ciclo.nivel_educativo?.toUpperCase() === 'GRADO MEDIO') pdf.setFillColor(245, 158, 11);
                            else pdf.setFillColor(37, 99, 235);
                            
                            pdf.roundedRect(x, cicloY - 2.5, 8, 3.5, 0.5, 0.5, 'F');
                            pdf.setTextColor(255, 255, 255);
                            pdf.setFont('helvetica', 'bold');
                            pdf.text(levelShort, x + 1.2, cicloY);

                            pdf.setTextColor(55, 65, 81);
                            pdf.setFont('helvetica', 'normal');
                            const cicloName = ciclo.ciclo_formativo.length > 40
                                ? ciclo.ciclo_formativo.substring(0, 38) + '...'
                                : ciclo.ciclo_formativo;
                            pdf.text(cicloName, x + 10, cicloY);
                            cicloY += 4.5;
                        });
                    }
                });
                const maxCiclos = Math.max(...details.map(c => (c.ciclos?.filter(ci => ci.familia_profesional === familia) || []).length), 1);
                y += Math.max(maxCiclos * 4.5 + 3, 8);
            });

            const totalPages = pdf.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(7);
                pdf.setTextColor(156, 163, 175);
                pdf.text(`Generado con EduFinder CyL - edufinder.es | Pagina ${i} de ${totalPages}`, margin, pageHeight - 8);
            }
            pdf.save(`comparacion-${details.length}-centros.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setGeneratingPdf(false);
        }
    };

    // No renderizar nada hasta que estemos hidratados para evitar parpadeos y bucles
    if (!isHydrated) return null;

    if (selectedCentros.length < 2) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
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
                    <Link href="/favoritos" className="bg-[#223945] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                        Ir a Favoritos
                    </Link>
                    {selectedCentros.length > 0 && (
                         <button onClick={() => removeFromCompare(selectedCentros[0].id)} className="px-8 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors">
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
                <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-neutral-500 hover:text-[#223945] mb-8 font-semibold transition-colors text-sm md:font-bold md:uppercase md:tracking-wide group">
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Volver
                </button>

                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[#223945] mb-2 flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-[#223945] to-[#374f5e] text-white rounded-xl shadow-lg">
                                    <Scale className="w-6 h-6" />
                                </div>
                                Comparador de Centros
                            </h1>
                            <p className="text-neutral-500 max-w-2xl text-sm pl-[3.5rem] leading-relaxed">
                                Compara {details.length} centros educativos
                            </p>
                        </div>

                        {details.length >= 2 && !isLoading && (
                            <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
                                <div className="relative" ref={shareMenuRef}>
                                    <button onClick={() => setShowShareMenu(!showShareMenu)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-700 font-bold text-sm hover:bg-neutral-50 transition-all shadow-sm">
                                        <Share2 className="w-4 h-4" />
                                        <span className="hidden sm:inline">Compartir</span>
                                    </button>
                                    {/* Desktop dropdown */}
                                    <AnimatePresence>
                                        {showShareMenu && (
                                            <motion.div initial={{ opacity: 0, y: 5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.95 }} className="hidden sm:block absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden z-50">
                                                <div className="p-1">
                                                    <button onClick={handleCopyLink} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors text-left">
                                                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                                                            {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-neutral-500" />}
                                                        </div>
                                                        <span className="text-sm font-medium text-neutral-700">{copied ? '¡Copiado!' : 'Copiar enlace'}</span>
                                                    </button>
                                                    <button onClick={handleShareWhatsApp} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors text-left">
                                                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                                        </div>
                                                        <span className="text-sm font-medium text-neutral-700">WhatsApp</span>
                                                    </button>
                                                    {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                                                        <button onClick={handleShareNative} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors text-left">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><Share2 className="w-4 h-4 text-blue-600" /></div>
                                                            <span className="text-sm font-medium text-neutral-700">Más opciones...</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {/* Mobile modal centrado */}
                                    <AnimatePresence>
                                        {showShareMenu && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="sm:hidden fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
                                                onClick={() => setShowShareMenu(false)}
                                            >
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                                    className="w-full max-w-xs bg-white rounded-2xl shadow-2xl overflow-hidden"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="bg-gradient-to-r from-[#223945] to-blue-600 px-4 py-3 flex items-center justify-between">
                                                        <h3 className="text-white font-bold">Compartir comparación</h3>
                                                        <button onClick={() => setShowShareMenu(false)} className="text-white/80 hover:text-white p-1">
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    <div className="p-3 space-y-2">
                                                        <button onClick={handleCopyLink} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-50 transition-colors text-left">
                                                            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                                                                {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-neutral-500" />}
                                                            </div>
                                                            <span className="text-base font-medium text-neutral-700">{copied ? '¡Copiado!' : 'Copiar enlace'}</span>
                                                        </button>
                                                        <button onClick={handleShareWhatsApp} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-50 transition-colors text-left">
                                                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                                                <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                                            </div>
                                                            <span className="text-base font-medium text-neutral-700">WhatsApp</span>
                                                        </button>
                                                        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                                                            <button onClick={handleShareNative} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-50 transition-colors text-left">
                                                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center"><Share2 className="w-5 h-5 text-blue-600" /></div>
                                                                <span className="text-base font-medium text-neutral-700">Más opciones...</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <button onClick={generatePDF} disabled={generatingPdf} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#223945] text-white font-bold text-sm hover:bg-[#1a2c35] transition-all shadow-md disabled:opacity-50">
                                    {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                    <span className="hidden sm:inline">{generatingPdf ? 'Generando...' : 'Descargar PDF'}</span>
                                    <span className="sm:hidden">PDF</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-[#223945]" /></div>
                ) : (
                    <div className={`relative bg-white/40 backdrop-blur-xl rounded-3xl shadow-sm border border-white/60 overflow-hidden p-6 md:p-8 ${details.length === 2 ? 'max-w-5xl' : ''}`}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#223945]/80 via-blue-500/80 to-blue-300/80"></div>
                        <div className="md:hidden flex justify-center gap-2 mb-6">
                            {details.map((_, idx) => (
                                <button key={idx} onClick={() => scrollToCard(idx)} className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-6 bg-[#223945]' : 'w-2 bg-[#223945]/20'}`} />
                            ))}
                        </div>
                        <div id="comparison-carousel" onScroll={handleScroll} className={`flex md:grid gap-6 overflow-x-auto snap-x snap-mandatory pb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide ${details.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
                            {details.map((d) => (
                                <div key={d.id} className="flex-shrink-0 w-full md:w-auto bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm snap-center flex flex-col overflow-hidden relative hover:shadow-md transition-all duration-300">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300 z-10"></div>
                                    <div className="p-6 pb-4 border-b border-blue-100/30 relative flex flex-col items-start bg-gradient-to-b from-blue-50/40 via-white/60 to-white">
                                        <button onClick={() => removeFromCompare(d.id)} className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-all"><X className="w-4 h-4" /></button>
                                        <div className="mb-3">
                                            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getNaturalezaBadge(d.naturaleza)}`}>{d.naturaleza}</span>
                                        </div>
                                        <h3 className="text-[15px] font-bold text-[#111827] leading-tight min-h-[3rem] line-clamp-2 w-full pr-6 mb-1">{d.nombre}</h3>
                                        <div className="flex items-center gap-2 mt-auto text-xs text-neutral-500 font-medium w-full">
                                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                            <span className="truncate">{d.localidad}</span>
                                        </div>
                                    </div>
                                    <div className="flex-grow bg-neutral-50/20">
                                        <div className="p-5 border-b border-neutral-100/50">
                                            <h4 className="text-xs font-bold text-blue-900/80 uppercase tracking-wider mb-3">Contacto</h4>
                                            <div className="space-y-2.5">
                                                {d.web && (
                                                    <a href={d.web.startsWith('http') ? d.web : `http://${d.web}`} target="_blank" className="flex items-center gap-3 text-sm text-[#223945] hover:text-blue-600 transition-colors group">
                                                        <div className="p-1.5 bg-[#223945] rounded-lg shrink-0"><Globe className="w-3.5 h-3.5 text-white" /></div>
                                                        <span className="font-semibold underline decoration-neutral-200 underline-offset-4 truncate">Visitar Web</span>
                                                    </a>
                                                )}
                                                {d.telefono && (
                                                    <div className="flex items-center gap-3 text-sm text-neutral-600">
                                                        <div className="p-1.5 bg-[#223945] rounded-lg shrink-0"><Phone className="w-3.5 h-3.5 text-white" /></div>
                                                        <span className="font-mono text-xs font-medium">{d.telefono}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-5">
                                             <h4 className="text-xs font-bold text-blue-900/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4 text-blue-600" />
                                                Oferta Educativa
                                            </h4>
                                            {d.ciclos && d.ciclos.length > 0 ? (
                                                <div className="space-y-5">
                                                    {Object.entries(d.ciclos.reduce((acc, c) => {
                                                        if (!acc[c.familia_profesional]) acc[c.familia_profesional] = [];
                                                        acc[c.familia_profesional].push(c);
                                                        return acc;
                                                    }, {} as Record<string, Ciclo[]>)).sort().map(([familia, ciclos]) => (
                                                        <div key={familia}>
                                                            <div className="flex items-center gap-2 mb-2 text-[#223945]">
                                                                <div className="w-1 h-3.5 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full shrink-0"></div>
                                                                <h5 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-tight leading-tight text-[#111827]">{familia}</h5>
                                                            </div>
                                                            <div className="flex flex-col gap-1.5 pl-3">
                                                                {ciclos.map(c => (
                                                                    <div key={c.id} className={`w-full flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border shadow-sm transition-colors ${getLevelBackground(c.nivel_educativo)}`}>
                                                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getLevelDotColor(c.nivel_educativo)}`}></div>
                                                                        <p className="flex-1 text-[12px] font-medium text-neutral-700 leading-snug mb-0 truncate">{c.ciclo_formativo}</p>
                                                                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow-sm shrink-0 ${getLevelColor(c.nivel_educativo)}`}>
                                                                            {c.nivel_educativo === 'Grado Superior' ? 'GS' : c.nivel_educativo === 'Grado Medio' ? 'GM' : 'FPB'}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 text-neutral-400 text-xs italic bg-white/50 rounded-xl border border-dashed border-neutral-200">Sin datos académicos</div>
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
