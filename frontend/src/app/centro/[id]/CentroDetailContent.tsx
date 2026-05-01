'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import api from '@/lib/axios';
import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Mail, Phone, MapPin, Globe, BookOpen, ChevronLeft, Heart, Share2, Copy, CheckCircle, ChevronDown, GraduationCap } from 'lucide-react';
import { useFavorite } from '@/hooks/useFavorite';
import { useCicloFavorite } from '@/hooks/useCicloFavorite';
import { useVisitedCenters } from '@/hooks/useVisitedCenters';
import { motion, AnimatePresence } from 'framer-motion';
import CentroDetailSkeleton from '@/components/CentroDetailSkeleton';
import { CicloFP } from '@/types';


const Map = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => <div className="h-64 md:h-full bg-neutral-100 animate-pulse rounded-xl flex items-center justify-center text-neutral-500">Cargando mapa...</div>
});

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function CentroDetailContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params.id;
    const { data: centro, error } = useSWR(id ? `/centros/${id}` : null, fetcher);
    const { data: ciclos } = useSWR(id ? `/centros/${id}/ciclos` : null, fetcher);

    const headerRef = useRef<HTMLDivElement>(null);
    const shareMenuRef = useRef<HTMLDivElement>(null);

    const { data: favoritesData } = useSWR('/favoritos', fetcher);

    const [calculatedIsFavorite, setCalculatedIsFavorite] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    // Mapeo de parámetros de URL a palabras clave para buscar en los nombres de nivel
    const urlParamToKeywords: Record<string, string[]> = {
        // Abreviaturas
        'GS': ['GRADO SUPERIOR', 'SUPERIOR'],
        'GM': ['GRADO MEDIO', 'MEDIO'],
        'FPB': ['FP BÁSICA', 'BÁSICA', 'FORMACIÓN PROFESIONAL BÁSICA', 'BASICA', 'GRADO BÁSICO', 'PROFESIONAL BÁSICA', 'F.P. BÁSICA', 'CICLO FORMATIVO BÁSICO', 'CICLOS FORMATIVOS DE GRADO BÁSICO'],
        'CE': ['CURSO DE ESPECIALIZACIÓN', 'ESPECIALIZACIÓN', 'ESPECIALIZACION'],
        // Variantes de URL usadas en FilterBar
        'BASICA': ['FP BÁSICA', 'BÁSICA', 'FORMACIÓN PROFESIONAL BÁSICA', 'BASICA', 'GRADO BÁSICO', 'PROFESIONAL BÁSICA', 'F.P. BÁSICA', 'CICLO FORMATIVO BÁSICO', 'CICLOS FORMATIVOS DE GRADO BÁSICO'],
        'SUPERIOR': ['GRADO SUPERIOR', 'SUPERIOR'],
        'MEDIO': ['GRADO MEDIO', 'MEDIO'],
        'ESPECIALIZACION': ['CURSO DE ESPECIALIZACIÓN', 'ESPECIALIZACIÓN', 'ESPECIALIZACION'],
    };

    // Normalizar texto removiendo acentos para comparaciones
    const normalizeText = (text: string): string => {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    };

    // Función para encontrar el nivel real en los datos dado un parámetro de URL
    const findMatchingLevel = (urlParam: string | null, levelKeys: string[]): string | null => {
        if (!urlParam) return null;
        const param = urlParam.toUpperCase();
        const paramNormalized = normalizeText(param);

        // Si el parámetro coincide exactamente con una clave existente
        if (levelKeys.includes(param)) return param;

        // Buscar usando las palabras clave
        const keywords = urlParamToKeywords[param];
        if (keywords) {
            for (const levelKey of levelKeys) {
                const levelKeyNormalized = normalizeText(levelKey);
                for (const keyword of keywords) {
                    const keywordNormalized = normalizeText(keyword);
                    // Comparar tanto con y sin acentos
                    if (levelKey.includes(keyword) || keyword.includes(levelKey) ||
                        levelKeyNormalized.includes(keywordNormalized) || keywordNormalized.includes(levelKeyNormalized)) {
                        return levelKey;
                    }
                }
            }
        }

        // Buscar si el nivel contiene "BÁSIC" o "BASIC" para FP Básica
        if (paramNormalized === 'BASICA') {
            for (const levelKey of levelKeys) {
                const normalized = normalizeText(levelKey);
                if (normalized.includes('BASIC') || normalized.includes('BASICO')) {
                    return levelKey;
                }
            }
        }

        // Último intento: buscar coincidencia parcial
        for (const levelKey of levelKeys) {
            const levelKeyNormalized = normalizeText(levelKey);
            if (levelKeyNormalized.includes(paramNormalized) || paramNormalized.includes(levelKeyNormalized)) {
                return levelKey;
            }
        }

        return null;
    };

    // Acordeones: cerrados por defecto, se abren según filtros de URL
    const nivelFromUrl = searchParams.get('nivel');
    const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});
    const [isDesktop, setIsDesktop] = useState(false);

    // Hook para gestionar historial de centros visitados
    const { addVisitedCenter } = useVisitedCenters();

    // Detectar si estamos en desktop para renderizar el mapa solo ahí
    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    // Guardar centro en el historial de visitados (localStorage)
    useEffect(() => {
        if (centro?.data) {
            addVisitedCenter(centro.data);
        }
    }, [centro]);

    // Abrir acordeón según el nivel de la URL cuando se carguen los ciclos
    useEffect(() => {
        if (ciclos?.data && nivelFromUrl) {
            const currentGrouped = ciclos.data.reduce((acc: Record<string, CicloFP[]>, ciclo: CicloFP) => {
                const nivel = ciclo.nivel_educativo?.toUpperCase() || 'OTROS';
                if (!acc[nivel]) acc[nivel] = [];
                acc[nivel].push(ciclo);
                return acc;
            }, {} as Record<string, CicloFP[]>);

            const levelKeys = Object.keys(currentGrouped);
            const matchedLevel = findMatchingLevel(nivelFromUrl, levelKeys);

            if (matchedLevel) {
                setExpandedLevels(prev => ({ ...prev, [matchedLevel]: true }));
            }
        }
    }, [ciclos, nivelFromUrl]);

    // Cerrar menú de compartir al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
                setShowShareMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getShareUrl = () => window.location.href;

    const handleToggleShareMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowShareMenu(!showShareMenu);
    };

    const handleCopyLink = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(getShareUrl());
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                setShowShareMenu(false);
            }, 1500);
        } catch (err) {
            console.error('Error copying link:', err);
        }
    };

    const handleShareWhatsApp = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const c = centro?.data;
        const text = `Mira este centro que he encontrado en EduFinder CyL:\n\n${c?.nombre}\n${c?.localidad}, ${c?.provincia}\n\nEchale un vistazo: ${getShareUrl()}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        setShowShareMenu(false);
    };

    const handleShareNative = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const c = centro?.data;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: c?.nombre || 'Centro Educativo',
                    text: `${c?.nombre} - ${c?.localidad}, ${c?.provincia}`,
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

    const toggleLevel = (level: string) => {
        setExpandedLevels(prev => ({ ...prev, [level]: !prev[level] }));
    };

    useEffect(() => {
        if (favoritesData && centro) {
            const favArray = Array.isArray(favoritesData) ? favoritesData : favoritesData.data || [];
            const isFav = favArray.some((fav: any) => fav.centro_id === centro.data.id || fav.centro.id === centro.data.id);
            setCalculatedIsFavorite(isFav);
        }
    }, [favoritesData, centro]);

    const favoriteLogic = useFavorite({
        centro: centro?.data,
        initialIsFavorite: calculatedIsFavorite
    });

    // Hook para gestionar ciclos favoritos
    const { toggleCiclo, isCicloFavorito } = useCicloFavorite({
        centroId: centro?.data?.id || 0
    });

    if (error) return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-700 font-medium">Error al cargar el centro educativo</p>
            </div>
        </div>
    );

    if (!centro) return <CentroDetailSkeleton />;

    const c = centro.data;

    const getNaturalezaBadge = (naturaleza: string) => {
        switch (naturaleza?.toUpperCase()) {
            case 'PÚBLICO': return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100';
            case 'PRIVADO': return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getLevelColor = (nivel: string) => {
        const n = normalizeText(nivel || '');
        if (n.includes('SUPERIOR')) return 'bg-purple-600 text-white border-purple-600 shadow-sm';
        if (n.includes('MEDIO')) return 'bg-amber-500 text-white border-amber-500 shadow-sm';
        if (n.includes('BASIC') || n.includes('BASICO')) return 'bg-blue-600 text-white border-blue-600 shadow-sm';
        if (n.includes('ESPECIALIZACION')) return 'bg-rose-600 text-white border-rose-600 shadow-sm';
        return 'bg-neutral-600 text-white border-neutral-600';
    };

    const getLevelBackground = (nivel: string) => {
        const n = normalizeText(nivel || '');
        if (n.includes('SUPERIOR')) return 'bg-purple-50 border-purple-100';
        if (n.includes('MEDIO')) return 'bg-amber-50 border-amber-100';
        if (n.includes('BASIC') || n.includes('BASICO')) return 'bg-blue-50 border-blue-100';
        if (n.includes('ESPECIALIZACION')) return 'bg-rose-50 border-rose-100';
        return 'bg-neutral-50 border-neutral-100';
    };

    const getLevelAbbreviation = (nivel: string) => {
        const n = normalizeText(nivel || '');
        if (n.includes('SUPERIOR')) return 'GS';
        if (n.includes('MEDIO')) return 'GM';
        if (n.includes('BASIC') || n.includes('BASICO')) return 'FPB';
        if (n.includes('ESPECIALIZACION')) return 'CE';
        return nivel?.substring(0, 2)?.toUpperCase() || '';
    };

    const getMapsLink = (mode: 'driving' | 'walking' | 'transit') => {
        const destination = `${c.latitud},${c.longitud}`;
        return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=${mode}`;
    };

    // Agrupar ciclos por nivel educativo
    const groupedCiclos = ciclos?.data?.reduce((acc: Record<string, CicloFP[]>, ciclo: CicloFP) => {
        const nivel = ciclo.nivel_educativo?.toUpperCase() || 'OTROS';
        if (!acc[nivel]) acc[nivel] = [];
        acc[nivel].push(ciclo);
        return acc;
    }, {} as Record<string, CicloFP[]>) || {};

    const levelOrder = ['FP BÁSICA', 'FORMACIÓN PROFESIONAL BÁSICA', 'GRADO MEDIO', 'GRADO SUPERIOR', 'CURSO DE ESPECIALIZACIÓN', 'OTROS'];
    const sortedLevels = Object.keys(groupedCiclos).sort((a, b) => {
        const indexA = levelOrder.indexOf(a) === -1 ? 999 : levelOrder.indexOf(a);
        const indexB = levelOrder.indexOf(b) === -1 ? 999 : levelOrder.indexOf(b);
        return indexA - indexB;
    });

    const totalCiclos = ciclos?.data?.length || 0;

    // Verificar si hay coordenadas válidas para el mapa
    const hasValidCoords = c && c.latitud && c.longitud &&
        Number.isFinite(parseFloat(String(c.latitud))) &&
        Number.isFinite(parseFloat(String(c.longitud)));

    // Función helper para renderizar el mapa en DESKTOP
    const renderDesktopMap = () => {
        // No renderizar el Map si no estamos en desktop
        if (!isDesktop) {
            return (
                <div className="h-full flex items-center justify-center bg-neutral-100">
                    <div className="animate-pulse text-neutral-400">Cargando...</div>
                </div>
            );
        }

        if (!hasValidCoords) {
            return (
                <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 p-8">
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-200 text-center max-w-sm">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-8 h-8 text-neutral-400" />
                        </div>
                        <h4 className="font-bold text-neutral-700 mb-2">Ubicación no disponible</h4>
                        <p className="text-sm text-neutral-500 mb-4">No se han encontrado coordenadas para este centro</p>
                        {c.direccion && (
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.direccion + ', ' + c.localidad)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#223945] text-white rounded-lg font-medium hover:bg-[#1a2d38] transition-colors"
                            >
                                <MapPin className="w-4 h-4" />
                                Buscar en Maps
                            </a>
                        )}
                    </div>
                </div>
            );
        }

        const lat = parseFloat(String(c.latitud));
        const lng = parseFloat(String(c.longitud));

        return (
            <>
                <div className="absolute inset-0 z-0">
                    <Map
                        centros={[c]}
                        center={[lat, lng] as [number, number]}
                        zoom={15}
                        favoriteIds={(favoritesData ? (Array.isArray(favoritesData) ? favoritesData : favoritesData.data || []) : []).map((f: { centro_id?: number; centro?: { id: number } }) => f.centro_id || f.centro?.id)}
                    />
                </div>
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                <div className="absolute bottom-4 left-4 z-10 w-[calc(100%-2rem)]">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-white/50">
                        <div className="flex items-center gap-2 pl-2">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <p className="text-xs font-bold text-[#223945] uppercase tracking-wide">Ubicación</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <a href={getMapsLink('driving')} target="_blank" rel="noreferrer" title="Coche" className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-[#223945] transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>
                            </a>
                            <a href={getMapsLink('transit')} target="_blank" rel="noreferrer" title="Transporte" className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-[#223945] transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="3" rx="2" /><path d="M8 21v-2" /><path d="M16 21v-2" /><path d="M4 11h16" /></svg>
                            </a>
                            <a href={getMapsLink('walking')} target="_blank" rel="noreferrer" title="Andando" className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-[#223945] transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><path d="m9 20 3-6 3 6"/><path d="m6 15 3-3 3 3 3-3 3 3"/></svg>
                            </a>
                            <div className="w-px h-4 bg-neutral-200 mx-1"></div>
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${c.latitud},${c.longitud}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#223945] text-white hover:bg-black transition-all text-xs font-bold">
                                Abrir Maps
                            </a>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="min-h-screen bg-brand-gradient py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-neutral-500 hover:text-[#223945] font-bold mb-8 transition-colors text-sm uppercase tracking-wide cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Volver
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Info */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Header Card */}
                        <div
                            ref={headerRef}
                            className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-100 shadow-xl shadow-neutral-200/50 relative"
                        >
                            {/* Decorative Top Gradient */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300 rounded-t-2xl"></div>

                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ${getNaturalezaBadge(c.naturaleza)}`}>
                                            {c.naturaleza || 'Sin especificar'}
                                        </span>
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-2 font-heading leading-tight">
                                        {c.nombre}
                                    </h1>
                                    <p className="text-base md:text-lg text-neutral-500 font-medium">{c.denominacion_generica}</p>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex items-center gap-2 shrink-0 self-start">
                                    {/* Botón Compartir con menú desplegable */}
                                    <div className="relative" ref={shareMenuRef}>
                                        <motion.button
                                            onClick={handleToggleShareMenu}
                                            whileTap={{ scale: 0.9 }}
                                            className={`p-3 rounded-full border shadow-sm hover:shadow-md transition-all ${
                                                showShareMenu
                                                    ? 'bg-[#223945]/10 border-[#223945]/30 text-[#223945]'
                                                    : 'bg-white border-neutral-200 text-neutral-400 hover:text-[#223945] hover:border-[#223945]/30'
                                            }`}
                                            aria-label="Compartir centro"
                                            title="Compartir"
                                        >
                                            <Share2 className="w-5 h-5" />
                                        </motion.button>

                                        <AnimatePresence>
                                            {showShareMenu && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-52 sm:w-56 bg-white rounded-xl shadow-2xl border border-neutral-100 overflow-hidden z-50"
                                                >
                                                    <div className="p-1.5">
                                                        <button
                                                            onClick={handleCopyLink}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                                                        >
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${copied ? 'bg-green-100' : 'bg-neutral-100'}`}>
                                                                {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-neutral-600" />}
                                                            </div>
                                                            <span className="text-sm font-medium text-neutral-700">
                                                                {copied ? '¡Enlace copiado!' : 'Copiar enlace'}
                                                            </span>
                                                        </button>
                                                        <button
                                                            onClick={handleShareWhatsApp}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                                                <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                                </svg>
                                                            </div>
                                                            <span className="text-sm font-medium text-neutral-700">WhatsApp</span>
                                                        </button>
                                                        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                                                            <button
                                                                onClick={handleShareNative}
                                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                                                            >
                                                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                                    <Share2 className="w-4 h-4 text-blue-600" />
                                                                </div>
                                                                <span className="text-sm font-medium text-neutral-700">Más opciones...</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Botón Favoritos */}
                                    <motion.button
                                        onClick={(e) => favoriteLogic.toggleFavorite(e, headerRef.current!)}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-3 rounded-full bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-all group"
                                        title={favoriteLogic.isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
                                        disabled={favoriteLogic.loading}
                                    >
                                        <Heart className={`w-5 h-5 transition-colors ${favoriteLogic.isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-400 group-hover:text-red-400'}`} />
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        {/* Ubicación para móvil - Tarjeta con enlace a Google Maps */}
                        <div className="lg:hidden">
                            <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden">
                                {/* Header con imagen estática de mapa */}
                                <div className="relative h-32 bg-gradient-to-br from-[#223945] to-blue-600 overflow-hidden">
                                    <div className="absolute inset-0 opacity-20">
                                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                                            </pattern>
                                            <rect width="100" height="100" fill="url(#grid)" />
                                        </svg>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                                            <MapPin className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Contenido */}
                                <div className="p-4">
                                    <h4 className="font-bold text-[#223945] mb-1">Ubicación del centro</h4>
                                    <p className="text-sm text-neutral-600 mb-4">{c.direccion}, {c.localidad}</p>

                                    {/* Botones de navegación */}
                                    <div className="flex gap-2">
                                        <a
                                            href={getMapsLink('driving')}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors text-sm font-medium text-neutral-700"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>
                                            Coche
                                        </a>
                                        <a
                                            href={getMapsLink('walking')}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors text-sm font-medium text-neutral-700"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><path d="m9 20 3-6 3 6"/><path d="m6 15 3-3 3 3 3-3 3 3"/></svg>
                                            Andando
                                        </a>
                                    </div>

                                    {/* Botón principal */}
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${c.latitud},${c.longitud}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-3 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#223945] hover:bg-[#1a2d38] text-white font-bold transition-colors"
                                    >
                                        <MapPin className="w-4 h-4" />
                                        Abrir en Google Maps
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Contact Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Address */}
                            <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Dirección</h4>
                                        <p className="font-bold text-neutral-800 leading-snug text-sm">{c.direccion}</p>
                                        <p className="text-xs text-neutral-500 mt-0.5">{c.codigo_postal}, {c.localidad}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Phone */}
                            {c.telefono && (
                                <a href={`tel:${c.telefono}`} className="bg-white/80 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-all block">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Teléfono</h4>
                                            <p className="font-bold text-neutral-800">{c.telefono}</p>
                                        </div>
                                    </div>
                                </a>
                            )}

                            {/* Email */}
                            {c.email && (
                                <a href={`mailto:${c.email}`} className="bg-white/80 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-all block sm:col-span-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Correo Electrónico</h4>
                                            <p className="font-bold text-neutral-800 truncate text-sm">{c.email}</p>
                                        </div>
                                    </div>
                                </a>
                            )}

                            {/* Web */}
                            {c.web && (
                                <a href={c.web} target="_blank" rel="noreferrer" className="bg-white/80 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-all block sm:col-span-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Sitio Web</h4>
                                            <p className="font-bold text-neutral-800 truncate text-sm">{c.web}</p>
                                        </div>
                                    </div>
                                </a>
                            )}
                        </div>

                        {/* Educational Offer (Ciclos) - Con acordeones por nivel */}
                        {ciclos && ciclos.data.length > 0 && (
                            <div className="bg-white rounded-2xl p-5 sm:p-8 border border-neutral-100 shadow-lg">
                                {/* Header */}
                                <div className="mb-5">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <h3 className="text-xl font-bold text-[#223945] flex items-center gap-3">
                                            <div className="p-2 bg-[#223945] text-white rounded-lg shrink-0">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            Oferta Educativa
                                        </h3>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-full shrink-0">
                                            <GraduationCap className="w-4 h-4 text-[#223945]" />
                                            <span className="text-sm font-bold text-[#223945]">{totalCiclos} ciclos</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-neutral-500 ml-12 mb-3">Pulsa en cada nivel para ver los ciclos disponibles</p>

                                    {/* Quick Stats - Siempre en fila, compactos */}
                                    <div className="flex items-center gap-1.5 ml-12 flex-wrap">
                                        {sortedLevels.map(level => (
                                            <span
                                                key={level}
                                                className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getLevelColor(level)}`}
                                            >
                                                {groupedCiclos[level].length} {getLevelAbbreviation(level)}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Acordeones por nivel */}
                                <div className="space-y-3">
                                    {sortedLevels.map(level => (
                                        <div key={level} className={`rounded-xl border overflow-hidden ${getLevelBackground(level)}`}>
                                            {/* Header del acordeón */}
                                            <button
                                                onClick={() => toggleLevel(level)}
                                                className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getLevelColor(level)}`}>
                                                        {level}
                                                    </span>
                                                    <span className="text-sm font-medium text-neutral-600">
                                                        {groupedCiclos[level].length} {groupedCiclos[level].length === 1 ? 'ciclo' : 'ciclos'}
                                                    </span>
                                                </div>
                                                <motion.div
                                                    animate={{ rotate: expandedLevels[level] ? 180 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <ChevronDown className="w-5 h-5 text-neutral-400" />
                                                </motion.div>
                                            </button>

                                            {/* Contenido del acordeón */}
                                            <AnimatePresence initial={false}>
                                                {expandedLevels[level] && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="p-4 pt-0 space-y-2">
                                                            {groupedCiclos[level].map((ciclo: CicloFP) => {
                                                                const isFavorito = isCicloFavorito(ciclo.id);
                                                                return (
                                                                    <div
                                                                        key={ciclo.id}
                                                                        className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-white/50 shadow-sm hover:shadow-md transition-all"
                                                                    >
                                                                        <div className="flex items-start justify-between gap-3">
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center gap-2 mb-2">
                                                                                    <span className="text-xs font-bold text-[#223945] bg-white px-2 py-0.5 rounded border border-neutral-200/50 uppercase tracking-wide">
                                                                                        {ciclo.modalidad}
                                                                                    </span>
                                                                                </div>
                                                                                <h4 className="font-bold text-[#111827] leading-snug">{ciclo.ciclo_formativo}</h4>
                                                                                <p className="text-sm text-neutral-500 mt-1">
                                                                                    {ciclo.familia_profesional}
                                                                                </p>
                                                                            </div>
                                                                            <motion.button
                                                                                onClick={() => toggleCiclo(ciclo.id)}
                                                                                whileTap={{ scale: 0.85 }}
                                                                                className={`p-2 rounded-full shrink-0 transition-all ${
                                                                                    isFavorito
                                                                                        ? 'bg-red-50 text-red-500'
                                                                                        : 'bg-neutral-100 text-neutral-400 hover:bg-red-50 hover:text-red-400'
                                                                                }`}
                                                                                title={isFavorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                                                                            >
                                                                                <Heart className={`w-4 h-4 ${isFavorito ? 'fill-current' : ''}`} />
                                                                            </motion.button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Map - Solo visible en desktop */}
                    <div className="hidden lg:block lg:col-span-5 relative">
                        <div className="sticky top-28 space-y-4">
                            <div className="bg-white rounded-2xl shadow-xl shadow-neutral-200/40 border border-neutral-100 overflow-hidden h-[700px] relative z-0">
                                {renderDesktopMap()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}