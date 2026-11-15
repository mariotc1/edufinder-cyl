'use client';

import { useComparison } from '@/context/ComparisonContext';
import { useEffect, useState, useRef, Suspense, useMemo } from 'react';
import api from '@/lib/axios';
import { ChevronLeft, MapPin, Phone, Mail, Globe, X, Loader2, GraduationCap, Scale, Download, Share2, Copy, CheckCircle, Check, ArrowRight, Heart, Laptop } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { BrandBackdrop } from '@/components/auth/AuthLayout';
import { centroName, centroTipo, centroEtapas, centroLugar, nivelFP, NIVELES_FP } from '@/lib/centro-format';

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
    denominacion_generica?: string;
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

// Identidad de cada columna: letra + color (la letra evita depender solo del color)
const COLUMNAS = [
    { letra: 'A', solid: 'bg-[#223945]', bar: 'from-[#223945] to-[#3b5a6b]' },
    { letra: 'B', solid: 'bg-teal-600', bar: 'from-teal-600 to-teal-400' },
    { letra: 'C', solid: 'bg-pink-600', bar: 'from-pink-600 to-pink-400' },
];

const esDistancia = (c: Ciclo) => !!c.modalidad && !c.modalidad.toLowerCase().startsWith('presencial');
const ordenNivel = (nivel: string) => {
    const n = nivelFP(nivel);
    return n ? NIVELES_FP.indexOf(n) : 99;
};

type Fila = { key: string; nombre: string; nivel: string; familia: string; en: boolean[]; };

// PÁGINA DE COMPARADOR DE CENTROS
function ComparadorPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { selectedCentros, removeFromCompare, replaceComparison } = useComparison();
    const [cache, setCache] = useState<Record<number, CentroDetail>>({});
    const [isHydrated, setIsHydrated] = useState(false);
    // Mientras se cargan los centros de un enlace (?centros=1,2,3) no se muestra la selección anterior
    const [urlPending, setUrlPending] = useState(() => !!searchParams.get('centros'));
    const [soloComun, setSoloComun] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    // Enlace compartido o venir de Favoritos: los centros del enlace sustituyen la selección
    const urlLoaded = useRef(false);
    useEffect(() => {
        if (!isHydrated || urlLoaded.current) return;
        urlLoaded.current = true;
        const ids = (searchParams.get('centros') ?? '').split(',').map(Number).filter(n => n > 0).slice(0, 3);
        if (ids.length === 0) { setUrlPending(false); return; }
        Promise.allSettled(ids.map(id => api.get(`/centros/${id}`).then(res => res.data.data as CentroDetail)))
            .then(results => {
                const ok = results.flatMap(r => (r.status === 'fulfilled' && r.value ? [r.value] : []));
                setCache(prev => Object.fromEntries([...Object.entries(prev), ...ok.map(c => [c.id, c])]));
                if (ok.length > 0) replaceComparison(ok);
            })
            .finally(() => setUrlPending(false));
    }, [isHydrated, searchParams, replaceComparison]);

    // Detalle completo (con ciclos) de los centros que aún no se han pedido
    const pedidos = useRef(new Set<number>());
    useEffect(() => {
        if (!isHydrated || urlPending) return;
        selectedCentros.filter(c => !cache[c.id] && !pedidos.current.has(c.id)).forEach(c => {
            pedidos.current.add(c.id);
            api.get(`/centros/${c.id}`)
                .then(res => setCache(prev => ({ ...prev, [c.id]: res.data.data })))
                .catch(err => console.error('Error fetching comparison details', err));
        });
    }, [selectedCentros, cache, isHydrated, urlPending]);

    // La URL refleja siempre la comparación actual (para recargar o compartir)
    const idsKey = selectedCentros.map(c => c.id).join(',');
    useEffect(() => {
        if (!isHydrated || urlPending) return;
        if ((searchParams.get('centros') ?? '') !== idsKey) {
            router.replace(idsKey ? `/comparador?centros=${idsKey}` : '/comparador', { scroll: false });
        }
    }, [idsKey, isHydrated, urlPending, searchParams, router]);

    const details = useMemo(() => selectedCentros.map(c => cache[c.id]).filter(Boolean), [selectedCentros, cache]);
    const isLoading = urlPending || details.length < selectedCentros.length;
    const n = details.length;

    // Resumen por centro
    const resumen = useMemo(() => details.map(d => {
        const ciclos = d.ciclos ?? [];
        return {
            ciclos: ciclos.length,
            niveles: NIVELES_FP.map(nv => ({ nivel: nv, count: ciclos.filter(c => nivelFP(c.nivel_educativo) === nv).length })).filter(x => x.count > 0),
            distancia: ciclos.filter(esDistancia).length,
            familias: new Set(ciclos.map(c => c.familia_profesional)).size,
            etapas: centroEtapas(d.denominacion_generica),
        };
    }), [details]);
    const maxCiclos = Math.max(0, ...resumen.map(r => r.ciclos));
    const hayFP = maxCiclos > 0;

    // Oferta de FP cruzada: cada ciclo (nombre + nivel) y en qué centros se imparte
    const familias = useMemo(() => {
        const filas = new Map<string, Fila>();
        details.forEach((d, i) => (d.ciclos ?? []).forEach(c => {
            const key = `${c.familia_profesional}|${nivelFP(c.nivel_educativo)?.abbr ?? c.nivel_educativo}|${c.ciclo_formativo.toLowerCase().trim()}`;
            const fila = filas.get(key) ?? { key, nombre: c.ciclo_formativo, nivel: c.nivel_educativo, familia: c.familia_profesional, en: details.map(() => false) };
            fila.en[i] = true;
            filas.set(key, fila);
        }));
        const grupos = new Map<string, Fila[]>();
        filas.forEach(f => grupos.set(f.familia, [...(grupos.get(f.familia) ?? []), f]));
        return [...grupos.entries()]
            .map(([familia, filas]) => ({
                familia,
                filas: filas.sort((a, b) => ordenNivel(a.nivel) - ordenNivel(b.nivel) || a.nombre.localeCompare(b.nombre, 'es')),
                centros: details.map((_, i) => filas.some(f => f.en[i])).filter(Boolean).length,
            }))
            .sort((a, b) => b.centros - a.centros || a.familia.localeCompare(b.familia, 'es'));
    }, [details]);
    const totalFilas = familias.reduce((s, f) => s + f.filas.length, 0);
    const filasComunes = familias.reduce((s, f) => s + f.filas.filter(r => r.en.filter(Boolean).length >= 2).length, 0);
    const familiasVisibles = soloComun
        ? familias.map(f => ({ ...f, filas: f.filas.filter(r => r.en.filter(Boolean).length >= 2) })).filter(f => f.filas.length > 0)
        : familias;

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
        const centrosList = details.map(d => `- ${centroName(d)}`).join('\n');
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
                const nameLines = pdf.splitTextToSize(centroName(centro), colWidth - 10);
                pdf.text(nameLines.slice(0, 2), x + 4, localY + 16);

                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(107, 114, 128);
                pdf.text(centroLugar(centro), x + 4, localY + 30);

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

    if (!urlPending && selectedCentros.length < 2) {
        return (
            <div className="relative isolate min-h-[80vh] flex items-center justify-center px-4 py-12">
                <BrandBackdrop pattern={false} />
                <div className="relative w-full max-w-md text-center px-6 py-12 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_24px_60px_-20px_rgba(34,57,69,0.35)]">
                    <div aria-hidden="true" className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                        <div className="h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300" />
                    </div>
                    <span className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#223945] to-blue-600 text-white flex items-center justify-center shadow-lg shadow-[#223945]/25">
                        <Scale className="w-7 h-7" />
                    </span>
                    <h1 className="mt-5 !text-2xl !font-extrabold !text-[#223945]">
                        {selectedCentros.length === 0 ? 'Compara centros lado a lado' : 'Te falta un centro'}
                    </h1>
                    <p className="mt-2 !text-sm text-neutral-500 max-w-xs mx-auto">
                        {selectedCentros.length === 0
                            ? 'Elige 2 o 3 de tus favoritos y verás en qué se parecen y en qué se diferencian.'
                            : 'Para comparar necesitas al menos dos centros. Elige otro desde tus favoritos.'}
                    </p>
                    <Link href="/favoritos" className="mt-7 inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-[#223945] via-[#2d4a5e] to-blue-600 text-white text-sm font-bold shadow-lg shadow-[#223945]/20 hover:-translate-y-0.5 transition-all">
                        <Heart className="w-4 h-4" />
                        Elegir en favoritos
                    </Link>
                </div>
            </div>
        );
    }

    // Columnas: en móvil la etiqueta va encima; en escritorio, a la izquierda
    const cols = { '--n': n } as React.CSSProperties;
    const gridResumen = 'grid gap-x-2 md:gap-x-4 grid-cols-[repeat(var(--n),minmax(0,1fr))] md:grid-cols-[10rem_repeat(var(--n),minmax(0,1fr))]';
    const gridOferta = 'grid items-center gap-x-1.5 md:gap-x-4 grid-cols-[minmax(0,1fr)_repeat(var(--n),2.25rem)] md:grid-cols-[minmax(0,1fr)_repeat(var(--n),8.5rem)]';

    return (
        <div className="relative isolate min-h-screen bg-brand-gradient pt-5 md:pt-12 pb-16 px-4 sm:px-6">
            <BrandBackdrop pattern={false} />
            <div className="max-w-6xl mx-auto">
                <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-[#223945] mb-5 text-sm font-semibold transition-colors group">
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Volver
                </button>

                {/* ── Cabecera ── */}
                <div className="relative flex md:items-end md:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                            <div aria-hidden="true" className="absolute inset-0 rounded-2xl bg-blue-500/30 blur-xl" />
                            <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#223945] to-blue-600 ring-4 ring-white shadow-lg shadow-[#223945]/25 flex items-center justify-center">
                                <Scale className="w-7 h-7 md:w-8 md:h-8 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="!text-[1.75rem] md:!text-4xl !font-extrabold tracking-tight !text-[#223945] !leading-tight">Comparador</h1>
                            <p className="!text-sm md:!text-base !text-neutral-500 font-medium">
                                {isLoading ? 'Preparando la comparación…' : `${n} centros, lado a lado · `}
                                {!isLoading && <Link href="/favoritos" className="text-blue-600 font-semibold hover:underline">Cambiar</Link>}
                            </p>
                        </div>
                    </div>

                        {!isLoading && details.length >= 2 && (
                            <div className="flex items-center gap-2 max-md:absolute max-md:right-0 max-md:-top-[3.15rem]">
                                <div className="relative" ref={shareMenuRef}>
                                    <button onClick={() => setShowShareMenu(!showShareMenu)} aria-label="Compartir comparación" className="flex items-center justify-center gap-2 w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-700 font-bold text-sm hover:bg-neutral-50 transition-all shadow-sm">
                                        <Share2 className="w-4 h-4" />
                                        <span className="hidden md:inline">Compartir</span>
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
                                <button onClick={generatePDF} disabled={generatingPdf} aria-label="Descargar PDF" className="flex items-center justify-center gap-2 w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2.5 rounded-xl bg-[#223945] text-white font-bold text-sm hover:bg-[#1a2c35] transition-all shadow-md disabled:opacity-50">
                                    {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                    <span className="hidden md:inline">{generatingPdf ? 'Generando...' : 'Descargar PDF'}</span>
                                </button>
                            </div>
                        )}
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-[#223945]" /></div>
                ) : (
                    <div style={cols} className="space-y-5">
                        {/* ── Los centros ── */}
                        <div className={gridResumen}>
                            <div className="hidden md:block" />
                            {details.map((d, i) => (
                                <motion.div
                                    key={d.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    className="relative flex flex-col rounded-2xl bg-white border border-neutral-200/80 shadow-sm p-3 pt-4 md:p-5 md:pt-6"
                                >
                                    <div aria-hidden="true" className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                                        <div className={`h-1.5 bg-gradient-to-r ${COLUMNAS[i].bar}`} />
                                    </div>
                                    <button
                                        onClick={() => removeFromCompare(d.id)}
                                        aria-label={`Quitar ${centroName(d)} de la comparación`}
                                        className="absolute top-2.5 right-2 md:top-4 md:right-3 p-1 rounded-full text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className={`w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl ${COLUMNAS[i].solid} text-white text-xs md:text-sm font-extrabold flex items-center justify-center shadow-md`}>
                                        {COLUMNAS[i].letra}
                                    </span>
                                    <span className="mt-2 md:mt-3 text-[10px] md:text-[11px] font-bold text-blue-600 uppercase tracking-wider truncate">{centroTipo(d.denominacion_generica)}</span>
                                    <Link href={`/centro/${d.id}`} className="mt-0.5 text-[13px] md:text-base font-extrabold text-[#111827] leading-tight line-clamp-3 hover:text-blue-700 transition-colors">
                                        {centroName(d)}
                                    </Link>
                                    <span className="mt-1.5 flex items-start gap-1 text-[11px] md:text-xs text-neutral-500 min-w-0">
                                        <MapPin className="w-3 h-3 mt-px shrink-0 text-rose-500" />
                                        <span className="line-clamp-2">{centroLugar(d)}</span>
                                    </span>
                                    <Link href={`/centro/${d.id}`} className="hidden md:inline-flex mt-auto pt-4 items-center gap-1 text-sm font-bold text-[#223945] hover:text-blue-700 group/ver">
                                        Ver centro <ArrowRight className="w-4 h-4 transition-transform group-hover/ver:translate-x-0.5" />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* ── De un vistazo ── */}
                        <section className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white shadow-sm p-4 md:p-6">
                            <h2 className="!text-base md:!text-lg !font-extrabold !text-[#223945] mb-1">De un vistazo</h2>
                            <div className="divide-y divide-neutral-100">
                                <FilaResumen label="Titularidad" grid={gridResumen}>
                                    {details.map(d => {
                                        const publico = d.naturaleza?.toUpperCase().includes('PÚBLICO');
                                        return (
                                            <span key={d.id} className={`justify-self-start px-2 py-0.5 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-wide ring-1 ${publico ? 'bg-blue-50 text-blue-700 ring-blue-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>
                                                {publico ? 'Público' : 'Privado'}
                                            </span>
                                        );
                                    })}
                                </FilaResumen>

                                {hayFP && (
                                    <FilaResumen label="Ciclos de FP" grid={gridResumen}>
                                        {resumen.map((r, i) => (
                                            <div key={i} className="min-w-0">
                                                <span className="flex items-baseline gap-1.5 flex-wrap">
                                                    <span className="text-xl md:text-2xl font-extrabold text-[#111827] tabular-nums leading-none">{r.ciclos}</span>
                                                    {r.ciclos === maxCiclos && resumen.filter(x => x.ciclos === maxCiclos).length === 1 && (
                                                        <span className="hidden md:inline px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wide">Más oferta</span>
                                                    )}
                                                </span>
                                                <span className="mt-2 block h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                                                    <span className={`block h-full rounded-full bg-gradient-to-r ${COLUMNAS[i].bar}`} style={{ width: `${(r.ciclos / maxCiclos) * 100}%` }} />
                                                </span>
                                            </div>
                                        ))}
                                    </FilaResumen>
                                )}

                                {hayFP && (
                                    <FilaResumen label="Por nivel" grid={gridResumen}>
                                        {resumen.map((r, i) => (
                                            <div key={i} className="flex flex-wrap gap-1">
                                                {r.niveles.length > 0 ? r.niveles.map(({ nivel, count }) => (
                                                    <span key={nivel.key} title={nivel.label} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] md:text-[11px] font-bold ${nivel.solid}`}>
                                                        <span className="tabular-nums">{count}</span>
                                                        <span className="opacity-80">{nivel.abbr}</span>
                                                    </span>
                                                )) : <Vacio />}
                                            </div>
                                        ))}
                                    </FilaResumen>
                                )}

                                {hayFP && (
                                    <FilaResumen label="Familias" grid={gridResumen}>
                                        {resumen.map((r, i) => (
                                            <span key={i} className="text-sm md:text-base font-bold text-[#223945] tabular-nums">{r.familias || <Vacio />}</span>
                                        ))}
                                    </FilaResumen>
                                )}

                                {resumen.some(r => r.distancia > 0) && (
                                    <FilaResumen label="A distancia" grid={gridResumen}>
                                        {resumen.map((r, i) => (
                                            <span key={i} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#223945]">
                                                {r.distancia > 0 ? <><Laptop className="w-4 h-4 text-blue-600" />{r.distancia}</> : <Vacio />}
                                            </span>
                                        ))}
                                    </FilaResumen>
                                )}

                                {resumen.some(r => r.ciclos === 0 && r.etapas.length > 0) && (
                                    <FilaResumen label="Etapas" grid={gridResumen}>
                                        {resumen.map((r, i) => (
                                            <div key={i} className="flex flex-wrap gap-1">
                                                {r.etapas.length > 0 ? r.etapas.map(e => (
                                                    <span key={e} className="px-1.5 py-0.5 rounded-md bg-[#223945]/[0.07] text-[10px] md:text-[11px] font-bold text-[#223945]">{e}</span>
                                                )) : <Vacio />}
                                            </div>
                                        ))}
                                    </FilaResumen>
                                )}

                                <FilaResumen label="Contacto" grid={gridResumen}>
                                    {details.map(d => (
                                        <div key={d.id} className="flex flex-wrap gap-1.5">
                                            {d.web && <Contacto href={d.web.startsWith('http') ? d.web : `https://${d.web}`} label="Web" icon={Globe} externo />}
                                            {d.telefono && <Contacto href={`tel:${d.telefono}`} label={`Llamar al ${d.telefono}`} icon={Phone} />}
                                            {d.email && <Contacto href={`mailto:${d.email}`} label={`Escribir a ${d.email}`} icon={Mail} />}
                                            {!d.web && !d.telefono && !d.email && <Vacio />}
                                        </div>
                                    ))}
                                </FilaResumen>
                            </div>
                        </section>

                        {/* ── Oferta de FP cruzada ── */}
                        {hayFP && (
                            <section className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white shadow-sm">
                                <div className="p-4 md:p-6 pb-3 md:pb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                                    <div>
                                        <h2 className="!text-base md:!text-lg !font-extrabold !text-[#223945] flex items-center gap-2">
                                            <GraduationCap className="w-5 h-5 text-blue-600" />
                                            Qué se puede estudiar
                                        </h2>
                                        <p className="!text-xs md:!text-sm !text-neutral-500 mt-0.5">
                                            {filasComunes > 0
                                                ? `${filasComunes} ${filasComunes === 1 ? 'ciclo se imparte' : 'ciclos se imparten'} en más de un centro`
                                                : 'No comparten ningún ciclo: cada centro tiene su propia oferta'}
                                        </p>
                                    </div>
                                    {filasComunes > 0 && (
                                        <div role="tablist" aria-label="Filtrar ciclos" className="inline-flex self-start p-1 rounded-xl bg-neutral-100">
                                            {[{ v: false, label: `Todos · ${totalFilas}` }, { v: true, label: `En común · ${filasComunes}` }].map(o => (
                                                <button
                                                    key={String(o.v)}
                                                    role="tab"
                                                    aria-selected={soloComun === o.v}
                                                    onClick={() => setSoloComun(o.v)}
                                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${soloComun === o.v ? 'bg-white text-[#223945] shadow-sm' : 'text-neutral-500 hover:text-[#223945]'}`}
                                                >
                                                    {o.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Cabecera fija de columnas */}
                                <div className={`${gridOferta} sticky top-[var(--mobile-header-height)] md:top-20 z-20 px-4 md:px-6 py-2.5 bg-white/95 backdrop-blur-md border-y border-neutral-100`}>
                                    <span className="text-[10px] md:text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Ciclo</span>
                                    {details.map((d, i) => (
                                        <span key={d.id} className="flex items-center justify-center md:justify-start gap-2 min-w-0" title={centroName(d)}>
                                            <span className={`w-6 h-6 shrink-0 rounded-md ${COLUMNAS[i].solid} text-white text-[11px] font-extrabold flex items-center justify-center`}>{COLUMNAS[i].letra}</span>
                                            <span className="hidden md:block truncate text-xs font-bold text-[#223945]">{centroName(d)}</span>
                                        </span>
                                    ))}
                                </div>

                                <div className="px-4 md:px-6 pb-4 md:pb-6">
                                    {familiasVisibles.map(f => (
                                        <div key={f.familia} className="pt-4">
                                            <h3 className="!text-[11px] md:!text-xs !font-extrabold !text-[#223945] uppercase tracking-wide flex items-center gap-2 mb-1.5">
                                                <span className="w-1 h-3.5 rounded-full bg-gradient-to-b from-blue-600 to-indigo-600" />
                                                {f.familia}
                                            </h3>
                                            <ul className="divide-y divide-neutral-100">
                                                {f.filas.map(r => {
                                                    const nivel = nivelFP(r.nivel);
                                                    const comun = r.en.filter(Boolean).length >= 2;
                                                    return (
                                                        <li key={r.key} className={`${gridOferta} py-2 -mx-2 px-2 rounded-lg ${comun ? 'bg-blue-50/60' : ''}`}>
                                                            <span className="flex items-start gap-2 min-w-0">
                                                                <span title={nivel?.label} className={`mt-px shrink-0 w-8 text-center py-0.5 rounded text-[9px] font-bold ${nivel?.solid ?? 'bg-neutral-600 text-white'}`}>
                                                                    {nivel?.abbr ?? '·'}
                                                                </span>
                                                                <span className="text-[13px] md:text-sm font-medium text-neutral-800 leading-snug">{r.nombre}</span>
                                                            </span>
                                                            {r.en.map((esta, i) => (
                                                                <span key={i} className="flex items-center justify-center md:justify-start">
                                                                    {esta ? (
                                                                        <span aria-label={`Se imparte en ${COLUMNAS[i].letra}`}>
                                                                            <span className={`w-6 h-6 rounded-full ${COLUMNAS[i].solid} text-white flex items-center justify-center shadow-sm`}>
                                                                                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                                                            </span>
                                                                        </span>
                                                                    ) : (
                                                                        <span aria-label={`No se imparte en ${COLUMNAS[i].letra}`} className="w-6 h-6 flex items-center justify-center">
                                                                            <span className="w-2.5 h-0.5 rounded-full bg-neutral-200" />
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            ))}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function FilaResumen({ label, grid, children }: { label: string; grid: string; children: React.ReactNode }) {
    return (
        <div className={`${grid} items-center gap-y-2 py-3.5`}>
            <span className="col-span-full md:col-span-1 text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-wider">{label}</span>
            {children}
        </div>
    );
}

function Contacto({ href, label, icon: Icon, externo }: { href: string; label: string; icon: typeof Globe; externo?: boolean }) {
    return (
        <a
            href={href}
            aria-label={label}
            title={label}
            {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-[#223945]/[0.07] text-[#223945] flex items-center justify-center hover:bg-[#223945] hover:text-white transition-colors"
        >
            <Icon className="w-4 h-4" />
        </a>
    );
}

function Vacio() {
    return <span className="text-neutral-300 font-bold" aria-label="Ninguno">—</span>;
}
