'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import api from '@/lib/axios';
import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Mail, Phone, MapPin, Globe, ChevronLeft, Heart, Share2, Copy, CheckCircle, Navigation, GraduationCap, type LucideIcon } from 'lucide-react';
import { useFavorite } from '@/hooks/useFavorite';
import { useCicloFavorite } from '@/hooks/useCicloFavorite';
import { useVisitedCenters } from '@/hooks/useVisitedCenters';
import { useFavoritesAnimation } from '@/context/FavoritesAnimationContext';
import { motion, AnimatePresence } from 'framer-motion';
import CentroDetailSkeleton from '@/components/CentroDetailSkeleton';
import InterestBadges from '@/components/InterestBadges';
import StaticMap from '@/components/StaticMap';
import Link from 'next/link';
import { CicloFP } from '@/types';
import { centroName, centroLugar, centroEtapas, titleCase, formatLocalidad, nivelFP, NIVELES_FP, denominacionDe } from '@/lib/centro-format';
import { estiloTipo } from '@/lib/centro-estilo';


const Map = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => <div className="h-64 md:h-full bg-neutral-100 animate-pulse rounded-xl flex items-center justify-center text-neutral-500">Cargando mapa...</div>
});

const fetcher = (url: string) => api.get(url).then(res => res.data);

// Traduce el parámetro ?nivel de la búsqueda (GM, GS, FPB, CE...) a la clave de NIVELES_FP
function nivelKeyFromParam(param: string | null): string | null {
    if (!param) return null;
    const p = param.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    if (p === 'GM' || p.includes('MEDIO')) return 'MEDIO';
    if (p === 'GS' || p.includes('SUPERIOR')) return 'SUPERIOR';
    if (p === 'FPB' || p.includes('BASIC')) return 'BASIC';
    if (p === 'CE' || p.includes('ESPECIALIZA')) return 'ESPECIALIZA';
    return null;
}

// Botón de acción rápida (Llamar, Correo, Web, Cómo llegar). Se atenúa si el dato no existe.
// Todas con el color principal de la web; "Ruta" destaca como acción principal
const QUICK_TONES = {
    soft: 'bg-white text-[#223945] ring-[#223945]/10 shadow-sm hover:ring-[#223945]/30 hover:shadow-md',
    brand: 'bg-gradient-to-br from-[#223945] to-blue-700 text-white ring-transparent shadow-lg shadow-[#223945]/25 hover:shadow-[#223945]/40',
} as const;

function QuickAction({ href, icon: Icon, label, external, tone }: { href?: string; icon: LucideIcon; label: string; external?: boolean; tone: keyof typeof QUICK_TONES }) {
    const content = (
        <>
            <Icon className="w-5 h-5" />
            <span className="text-[11px] sm:text-xs font-bold text-center leading-tight px-1">{label}</span>
        </>
    );
    const base = 'flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-2xl ring-1 transition-all';
    if (!href) {
        return <span className={`${base} bg-neutral-50 text-neutral-300 ring-neutral-100 cursor-not-allowed`} aria-disabled="true">{content}</span>;
    }
    return (
        <motion.a
            href={href}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={`${base} ${QUICK_TONES[tone]}`}
        >
            {content}
        </motion.a>
    );
}

function ContactRow({ icon: Icon, label, value, href, external }: { icon: LucideIcon; label: string; value: string; href?: string; external?: boolean }) {
    return (
        <div className="flex items-center gap-3">
            <span className="p-1.5 bg-white rounded-lg shrink-0 ring-1 ring-[#223945]/10">
                <Icon className="w-3.5 h-3.5 text-[#223945]" />
            </span>
            <dt className="sr-only">{label}</dt>
            <dd className="min-w-0 break-words font-medium text-neutral-800">
                {href ? (
                    <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="hover:text-blue-700 hover:underline underline-offset-2">
                        {value}
                    </a>
                ) : value}
            </dd>
        </div>
    );
}

export default function CentroDetailContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params.id;
    const { data: centro, error, mutate: mutateCentro } = useSWR(id ? `/centros/${id}` : null, fetcher);
    const { data: ciclos } = useSWR(id ? `/centros/${id}/ciclos` : null, fetcher);

    const headerRef = useRef<HTMLDivElement>(null);
    const shareMenuRef = useRef<HTMLDivElement>(null);

    const { data: favoritesData } = useSWR('/favoritos', fetcher);

    const [calculatedIsFavorite, setCalculatedIsFavorite] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    // Nivel de FP preseleccionado si se llega desde una búsqueda filtrada (?nivel=GM)
    const nivelFromUrl = searchParams.get('nivel');
    const [nivelActivo, setNivelActivo] = useState<string | null>(() => nivelKeyFromParam(nivelFromUrl));
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
        const text = `Mira este centro que he encontrado en EduFinder CyL:\n\n${c ? centroName(c) : ''}\n${c ? centroLugar(c) : ''}\n\nEchale un vistazo: ${getShareUrl()}`;
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
                    title: c ? centroName(c) : 'Centro Educativo',
                    text: `${c ? centroName(c) : ''} - ${c ? centroLugar(c) : ''}`,
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

    // Animación de favoritos
    const { triggerAnimation } = useFavoritesAnimation();

    // Handler para toggle de ciclo con animación
    const handleToggleCiclo = (cicloId: number, cicloNombre: string, elementRef: HTMLElement | null) => {
        const wasLiked = isCicloFavorito(cicloId);

        // Disparar animación solo si se está añadiendo a favoritos
        if (!wasLiked && elementRef) {
            const rect = elementRef.getBoundingClientRect();
            triggerAnimation(rect, {
                title: cicloNombre,
                naturaleza: centro?.data?.naturaleza || ''
            });
        }

        toggleCiclo(cicloId);
    };

    if (error) {
        const notFound = error?.response?.status === 404;
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4 py-10 bg-brand-gradient">
                <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-100 p-8 text-center max-w-md w-full">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>
                    <div className="w-16 h-16 rounded-2xl bg-[#223945]/[0.06] flex items-center justify-center mx-auto mb-5">
                        <MapPin className="w-8 h-8 text-[#223945]" />
                    </div>
                    <h1 className="!text-xl !font-bold !text-[#223945]">
                        {notFound ? 'Este centro no existe' : 'No hemos podido cargar el centro'}
                    </h1>
                    <p className="mt-2 text-sm text-neutral-500">
                        {notFound ? 'Puede que el enlace sea antiguo o que el centro se haya dado de baja.' : 'Revisa tu conexión e inténtalo de nuevo.'}
                    </p>
                    <div className="mt-6 flex flex-col gap-2.5">
                        {!notFound && (
                            <button onClick={() => mutateCentro()} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#223945] to-blue-700 text-white font-bold shadow-lg shadow-[#223945]/20 active:scale-[0.98] transition-transform">
                                Reintentar
                            </button>
                        )}
                        <button onClick={() => router.push('/')} className="w-full py-3 rounded-xl bg-neutral-100 text-[#223945] font-bold active:scale-[0.98] transition-transform">
                            Buscar otros centros
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!centro) return <CentroDetailSkeleton />;

    const c = centro.data;

    const getMapsLink = (mode: 'driving' | 'walking' | 'transit') => {
        const destination = `${c.latitud},${c.longitud}`;
        return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=${mode}`;
    };

    // Datos formateados para lectura
    const nombre = centroName(c);
    const estilo = estiloTipo(denominacionDe(c));
    const TipoIcon = estilo.icon;
    const tipo = estilo.label;
    const lugar = centroLugar(c);
    const etapas = centroEtapas(denominacionDe(c));
    const esPublico = c.naturaleza?.toUpperCase().includes('PÚBLICO');
    const codigoPostal = c.codigo_postal ? String(c.codigo_postal).padStart(5, '0') : '';
    const direccion = [titleCase(c.direccion), [codigoPostal, formatLocalidad(c.localidad)].filter(Boolean).join(' ')].filter(Boolean).join(', ');
    const webUrl = c.web ? (/^https?:\/\//i.test(c.web) ? c.web : `http://${c.web}`) : null;

    // Ciclos ordenados por nivel (Básico → Especialización) y conteo por nivel para el selector
    const listaCiclos: CicloFP[] = [...(ciclos?.data ?? [])].sort((a: CicloFP, b: CicloFP) => {
        const ia = NIVELES_FP.findIndex(n => n.key === nivelFP(a.nivel_educativo)?.key);
        const ib = NIVELES_FP.findIndex(n => n.key === nivelFP(b.nivel_educativo)?.key);
        return ia - ib || a.ciclo_formativo.localeCompare(b.ciclo_formativo, 'es');
    });
    const nivelesDisponibles = NIVELES_FP
        .map(n => ({ ...n, count: listaCiclos.filter(ci => nivelFP(ci.nivel_educativo)?.key === n.key).length }))
        .filter(n => n.count > 0);
    const nivelSeleccionado = nivelesDisponibles.some(n => n.key === nivelActivo) ? nivelActivo : null;
    const ciclosFiltrados = nivelSeleccionado
        ? listaCiclos.filter(ci => nivelFP(ci.nivel_educativo)?.key === nivelSeleccionado)
        : listaCiclos;
    const totalCiclos = listaCiclos.length;

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
                    className="inline-flex items-center gap-2 text-neutral-500 hover:text-[#223945] font-semibold mb-8 transition-colors text-sm md:font-bold md:uppercase md:tracking-wide cursor-pointer group"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Volver
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Info */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Cabecera: qué es, cómo se llama, dónde está */}
                        <div
                            ref={headerRef}
                            className={`relative bg-white bg-gradient-to-b ${estilo.header} via-white via-40% to-white rounded-3xl p-5 sm:p-6 md:p-8 ring-1 ring-neutral-200/80 shadow-xl shadow-neutral-200/50`}
                        >
                            <div>
                                <div>
                                    <div className="flex items-center gap-3 sm:gap-4 pr-24 sm:pr-28">
                                        <span className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${estilo.tile} text-white flex items-center justify-center shadow-lg`}>
                                            <TipoIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                                        </span>
                                        <div className="min-w-0">
                                            <span className={`block text-xs sm:text-sm font-extrabold uppercase tracking-wider ${estilo.text}`}>{tipo}</span>
                                            <span className={`mt-1.5 inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                                                esPublico ? 'bg-blue-600 text-white' : 'bg-amber-400 text-amber-950'
                                            }`}>
                                                {esPublico ? 'Público' : c.naturaleza ? 'Privado' : 'Sin especificar'}
                                            </span>
                                        </div>
                                    </div>
                                    <h1 className="mt-5 !text-3xl md:!text-4xl !font-extrabold tracking-tight !text-[#111827] !leading-tight">
                                        {nombre}
                                    </h1>
                                    <p className="mt-2 flex items-center gap-1.5 !text-base font-medium text-neutral-500">
                                        <MapPin className="w-4 h-4 text-rose-500" />
                                        {lugar}
                                    </p>
                                    {c.interest_badges && c.interest_badges.length > 0 && (
                                        <div className="mt-4">
                                            <InterestBadges badges={c.interest_badges} size="md" />
                                        </div>
                                    )}
                                </div>

                                {/* Botones de acción */}
                                <div className="absolute top-5 right-5 sm:top-6 sm:right-6 md:top-8 md:right-8 z-20 flex items-center gap-0.5 p-1 rounded-full bg-white/90 backdrop-blur-sm ring-1 ring-neutral-200/80 shadow-sm">
                                    {/* Botón Compartir con menú desplegable */}
                                    <div className="relative" ref={shareMenuRef}>
                                        <motion.button
                                            onClick={handleToggleShareMenu}
                                            whileTap={{ scale: 0.9 }}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                                showShareMenu ? 'bg-[#223945]/10 text-[#223945]' : 'text-neutral-400 hover:bg-[#223945]/5 hover:text-[#223945]'
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
                                                    className="absolute right-0 mt-2 w-52 sm:w-56 bg-white rounded-xl shadow-2xl border border-neutral-100 overflow-hidden z-50"
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
                                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors group"
                                        title={favoriteLogic.isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
                                        disabled={favoriteLogic.loading}
                                    >
                                        <Heart className={`w-5 h-5 transition-colors ${favoriteLogic.isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-400 group-hover:text-red-400'}`} />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Acciones rápidas */}
                            <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
                                <QuickAction href={c.telefono ? `tel:${c.telefono}` : undefined} icon={Phone} label="Llamar" tone="soft" />
                                <QuickAction href={c.email ? `mailto:${c.email}` : undefined} icon={Mail} label="Correo" tone="soft" />
                                <QuickAction href={webUrl ?? undefined} icon={Globe} label="Web" external tone="soft" />
                                <QuickAction
                                    href={hasValidCoords
                                        ? `https://www.google.com/maps/dir/?api=1&destination=${c.latitud},${c.longitud}`
                                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`}
                                    icon={Navigation}
                                    label="Ruta"
                                    external
                                    tone="brand"
                                />
                            </div>

                            {/* Datos de contacto en texto, para copiar */}
                            <dl className="mt-4 p-4 rounded-2xl bg-[#223945]/[0.04] space-y-3 text-sm">
                                <ContactRow icon={MapPin} label="Dirección" value={direccion} />
                                {c.telefono && <ContactRow icon={Phone} label="Teléfono" value={String(c.telefono)} href={`tel:${c.telefono}`} />}
                                {c.email && <ContactRow icon={Mail} label="Correo" value={c.email} href={`mailto:${c.email}`} />}
                                {webUrl && <ContactRow icon={Globe} label="Web" value={c.web.replace(/^https?:\/\//i, '').replace(/\/$/, '')} href={webUrl} external />}
                            </dl>
                        </div>

                        {/* Mapa en móvil: vista previa estática + accesos a ruta y al mapa de la app */}
                        {hasValidCoords && (
                            <div className="lg:hidden bg-white rounded-3xl border border-neutral-100 shadow-lg overflow-hidden">
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${c.latitud},${c.longitud}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Cómo llegar a ${nombre}`}
                                    className="block active:opacity-90 transition-opacity"
                                >
                                    <StaticMap lat={parseFloat(String(c.latitud))} lng={parseFloat(String(c.longitud))} className="h-44" />
                                </a>
                                <div className="p-4 flex items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="!text-sm font-bold !text-[#223945] truncate">{titleCase(c.direccion) || lugar}</p>
                                        <p className="!text-xs !text-neutral-500 truncate">{[codigoPostal, lugar].filter(Boolean).join(' · ')}</p>
                                    </div>
                                    <Link
                                        href={`/mapa?centro=${c.id}`}
                                        className="shrink-0 px-3.5 py-2 rounded-full bg-neutral-100 text-[#223945] text-xs font-bold active:scale-95 transition-transform"
                                    >
                                        Ver en mapa
                                    </Link>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${c.latitud},${c.longitud}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#223945] to-blue-700 text-white text-xs font-bold shadow-md shadow-[#223945]/20 active:scale-95 transition-transform"
                                    >
                                        <Navigation className="w-3.5 h-3.5" />
                                        Ir
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Qué puedes estudiar aquí */}
                        <section className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-100 shadow-lg">
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="flex items-center gap-3 !text-xl md:!text-2xl !font-bold tracking-tight !text-[#223945]">
                                    <span className="p-2 bg-[#223945] text-white rounded-xl shrink-0 shadow-sm">
                                        <GraduationCap className="w-5 h-5" />
                                    </span>
                                    Qué puedes estudiar aquí
                                </h2>
                                {totalCiclos > 0 && (
                                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#223945] to-[#345165] text-white text-xs sm:text-sm font-bold tabular-nums whitespace-nowrap shadow-md">
                                        {totalCiclos} {totalCiclos === 1 ? 'ciclo' : 'ciclos'}
                                    </span>
                                )}
                            </div>

                            {!ciclos ? (
                                <div className="mt-5 space-y-3">
                                    {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-neutral-100 rounded-xl animate-pulse" />)}
                                </div>
                            ) : totalCiclos > 0 ? (
                                <>
                                    {/* Selector de nivel (segmented control) */}
                                    {nivelesDisponibles.length > 1 && (
                                        <div className="mt-5">
                                            <div role="tablist" aria-label="Filtrar por nivel" className="flex flex-wrap gap-2">
                                                {[{ key: null, short: 'Todos', count: totalCiclos, solid: 'bg-[#223945] text-white' }, ...nivelesDisponibles].map(n => {
                                                    const active = nivelSeleccionado === n.key;
                                                    return (
                                                        <button
                                                            key={n.key ?? 'todos'}
                                                            role="tab"
                                                            aria-selected={active}
                                                            onClick={() => setNivelActivo(n.key)}
                                                            className={`px-3.5 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
                                                                active ? `${n.solid} shadow-md` : 'bg-neutral-100 text-neutral-500 hover:text-neutral-800'
                                                            }`}
                                                        >
                                                            {n.short} <span className={active ? 'opacity-70' : 'text-neutral-400'}>{n.count}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <ul className="mt-5 space-y-2">
                                        {ciclosFiltrados.map((ciclo: CicloFP) => {
                                            const isFavorito = isCicloFavorito(ciclo.id);
                                            const distancia = ciclo.modalidad && !ciclo.modalidad.toLowerCase().startsWith('presencial');
                                            const nivel = nivelFP(ciclo.nivel_educativo);
                                            return (
                                                <li
                                                    key={ciclo.id}
                                                    className={`flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border transition-shadow hover:shadow-md ${nivel?.soft ?? 'bg-neutral-50 border-neutral-100'}`}
                                                    data-ciclo-card
                                                >
                                                    <span className={`hidden sm:inline-flex shrink-0 w-11 justify-center text-[11px] font-bold py-1 rounded-full shadow-sm ${nivel?.solid ?? 'bg-neutral-600 text-white'}`}>
                                                        {nivel?.abbr ?? '—'}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="!text-[15px] font-bold !text-neutral-900 !leading-snug">{ciclo.ciclo_formativo}</p>
                                                        <p className="!text-sm !text-neutral-600 mt-0.5">
                                                            <span className="sm:hidden font-semibold">{nivel?.short ?? ciclo.nivel_educativo} · </span>
                                                            {ciclo.familia_profesional}
                                                            {distancia && (
                                                                <span className="ml-2 px-2 py-0.5 rounded-full bg-white text-[#223945] ring-1 ring-[#223945]/15 text-xs font-bold">A distancia</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <motion.button
                                                        onClick={(e) => {
                                                            const cardEl = (e.currentTarget as HTMLElement).closest('[data-ciclo-card]') as HTMLElement;
                                                            handleToggleCiclo(ciclo.id, ciclo.ciclo_formativo, cardEl);
                                                        }}
                                                        whileTap={{ scale: 0.85 }}
                                                        animate={isFavorito ? { scale: [1, 1.2, 1] } : {}}
                                                        transition={{ duration: 0.3 }}
                                                        className={`p-2 rounded-full shrink-0 transition-colors ${
                                                            isFavorito ? 'text-red-500 bg-white shadow-sm' : 'text-neutral-400 bg-white/70 hover:text-red-500 hover:bg-white'
                                                        }`}
                                                        aria-label={isFavorito ? 'Quitar de favoritos' : 'Guardar ciclo en favoritos'}
                                                    >
                                                        <Heart className={`w-5 h-5 ${isFavorito ? 'fill-current' : ''}`} />
                                                    </motion.button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </>
                            ) : (
                                <div className="mt-5">
                                    {etapas.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {etapas.map(e => (
                                                <span key={e} className={`px-3.5 py-1.5 rounded-xl ring-1 text-sm font-bold ${estilo.chip}`}>{e}</span>
                                            ))}
                                        </div>
                                    )}
                                    <p className="mt-4 !text-sm text-neutral-500">
                                        Este centro no imparte Formación Profesional. Para conocer su oferta concreta, contacta directamente con el centro.
                                    </p>
                                </div>
                            )}

                            {totalCiclos > 0 && (
                                <p className="mt-4 !text-xs text-neutral-400">Guarda los ciclos que te interesen con el corazón para compararlos después.</p>
                            )}
                        </section>
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