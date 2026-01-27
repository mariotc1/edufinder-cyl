'use client';

import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import api from '@/lib/axios';
import dynamic from 'next/dynamic';
import { Mail, Phone, MapPin, Globe, Star, BookOpen, Building2, ChevronLeft, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';


// Dynamic import map to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => <div className="h-64 md:h-full bg-neutral-100 animate-pulse rounded-xl flex items-center justify-center text-neutral-500">Cargando mapa...</div>
});

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function CentroDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    const { data: centro, error } = useSWR(id ? `/centros/${id}` : null, fetcher);
    const { data: ciclos } = useSWR(id ? `/centros/${id}/ciclos` : null, fetcher);

    // Auth & Favorites logic
    const { user, openLoginModal } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [loadingFav, setLoadingFav] = useState(false);

    // Initial check
    const { data: favoritesData } = useSWR('/favoritos', fetcher);
    useEffect(() => {
        if (favoritesData && centro) {
            const favArray = Array.isArray(favoritesData) ? favoritesData : favoritesData.data || [];
            setIsFavorite(favArray.some((fav: any) => fav.centro_id === centro.data.id || fav.centro.id === centro.data.id));
        }
    }, [favoritesData, centro]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        
        if (!user) {
            openLoginModal();
            return;
        }

        if (loadingFav) return;

        // Optimistic UI
        const newStatus = !isFavorite;
        setIsFavorite(newStatus);
        setLoadingFav(true);

        try {
            if (newStatus) {
                await api.post(`/favoritos/${id}`);
            } else {
                await api.delete(`/favoritos/${id}`);
            }
        } catch (e) {
            // Revert
            setIsFavorite(!newStatus);
            // No alert needed, just revert
        } finally {
            setLoadingFav(false);
        }
    };

    if (error) return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-700 font-medium">Error al cargar el centro educativo</p>
            </div>
        </div>
    );

    if (!centro) return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-[#223945] mb-4"></div>
                <p className="text-[#223945] font-bold">Cargando información...</p>
            </div>
        </div>
    );

    const c = centro.data;

    // Badge Logic (Synced with CentroCard)
    const getNaturalezaBadge = (naturaleza: string) => {
        switch (naturaleza?.toUpperCase()) {
            case 'PÚBLICO': return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100';
            case 'PRIVADO': return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-100';
            case 'CONCERTADO': return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getLevelColor = (nivel: string) => {
        switch (nivel?.toUpperCase()) {
            case 'GRADO SUPERIOR': return 'bg-purple-600 text-white border-purple-600 shadow-sm';
            case 'GRADO MEDIO': return 'bg-amber-500 text-white border-amber-500 shadow-sm';
            case 'FP BÁSICA': return 'bg-blue-600 text-white border-blue-600 shadow-sm';
            default: return 'bg-neutral-600 text-white border-neutral-600';
        }
    };

    const getLevelBackground = (nivel: string) => {
        switch (nivel?.toUpperCase()) {
            case 'GRADO SUPERIOR': return 'bg-purple-50 border-purple-100';
            case 'GRADO MEDIO': return 'bg-amber-50 border-amber-100';
            case 'FP BÁSICA': return 'bg-blue-50 border-blue-100';
            default: return 'bg-neutral-50 border-neutral-100';
        }
    };

    const getMapsLink = (mode: 'driving' | 'walking' | 'transit') => {
        const destination = `${c.latitud},${c.longitud}`;
        return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=${mode}`;
    };

    return (
        <div className="min-h-screen bg-brand-gradient py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-neutral-500 hover:text-[#223945] font-bold mb-8 transition-colors text-sm uppercase tracking-wide cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Volver a resultados
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Info (Now 7/12) */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Header Card */}
                        <div className="bg-white rounded-2xl p-8 border border-neutral-100 shadow-xl shadow-neutral-200/50 relative overflow-hidden">
                            {/* Decorative Top Gradient */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>

                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ${getNaturalezaBadge(c.naturaleza)}`}>
                                            {c.naturaleza || 'Sin especificar'}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-[#111827] mb-2 font-heading leading-tight">
                                        {c.nombre}
                                    </h1>
                                    <p className="text-lg text-neutral-500 font-medium">{c.denominacion_generica}</p>
                                </div>
                                <button
                                    onClick={toggleFavorite}
                                    className="shrink-0 p-3 rounded-full bg-white border border-neutral-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all group"
                                    title={isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
                                >
                                    <Heart className={`w-8 h-8 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-300 group-hover:text-red-400'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Pro Contact Grid - NO HOVER EFFECTS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Address */}
                            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg transition-colors">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Dirección</h4>
                                        <p className="font-bold text-neutral-800 leading-snug">{c.direccion}</p>
                                        <p className="text-sm text-neutral-500 mt-0.5">{c.codigo_postal}, {c.localidad}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Phone */}
                            {c.telefono && (
                                <a href={`tel:${c.telefono}`} className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-all group block">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg transition-colors">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Teléfono</h4>
                                            <p className="font-bold text-neutral-800 text-lg">{c.telefono}</p>
                                        </div>
                                    </div>
                                </a>
                            )}
                            {/* Email */}
                            {c.email && (
                                <a href={`mailto:${c.email}`} className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-all group block md:col-span-2">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg transition-colors">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Correo Electrónico</h4>
                                            <p className="font-bold text-neutral-800 truncate">{c.email}</p>
                                        </div>
                                    </div>
                                </a>
                            )}
                            {/* Web */}
                            {c.web && (
                                <a href={c.web} target="_blank" rel="noreferrer" className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-all group block md:col-span-2">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg transition-colors">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Sitio Web</h4>
                                            <p className="font-bold text-neutral-800 truncate">{c.web}</p>
                                        </div>
                                    </div>
                                </a>
                            )}
                        </div>

                        {/* Educational Offer (Ciclos) */}
                        {ciclos && ciclos.data.length > 0 && (
                            <div className="bg-white rounded-2xl p-8 border border-neutral-100 shadow-lg">
                                <h3 className="text-xl font-bold text-[#223945] mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-[#223945] text-white rounded-lg">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    Oferta Educativa
                                </h3>

                                <div className="space-y-4">
                                    {ciclos.data.map((ciclo: any) => (
                                        <div
                                            key={ciclo.id}
                                            className={`p-5 rounded-xl border transition-all hover:-translate-y-1 hover:shadow-md ${getLevelBackground(ciclo.nivel_educativo)}`}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                        <span className={`badge ${getLevelColor(ciclo.nivel_educativo)} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide`}>
                                                            {ciclo.nivel_educativo}
                                                        </span>
                                                        <span className="text-xs font-bold text-[#223945] bg-white/80 px-2.5 py-1 rounded-md border border-neutral-200/50 uppercase tracking-wide">
                                                            {ciclo.modalidad}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-[#111827] text-lg leading-snug">{ciclo.ciclo_formativo}</h4>
                                                    <p className="text-sm text-neutral-600 mt-2 font-medium">
                                                        Familia Profesional: <span className="text-[#223945]">{ciclo.familia_profesional}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Refined Map & Directions - Sticky */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-28 space-y-4">
                            {/* Map Card - ENLARGED to 600px -> Reduced to 500px for alignment */}
                            <div className="bg-white rounded-2xl shadow-xl shadow-neutral-200/40 border border-neutral-100 overflow-hidden h-[700px] relative group z-0">
                                {c.latitud && c.longitud ? (
                                    <>
                                        <div className="absolute inset-0 z-0">
                                            <Map centros={[c]} center={[parseFloat(c.latitud), parseFloat(c.longitud)]} zoom={15} />
                                        </div>
                                        {/* Overlay gradient for map bottom */}
                                        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                                        <div className="absolute bottom-4 left-4 z-10 w-[calc(100%-2rem)]">
                                            {/* Minimalist Glass Directions Bar */}
                                            <div className="flex items-center justify-between p-2 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-white/50">
                                                <div className="flex items-center gap-2 pl-2">
                                                    <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                                                    <p className="text-xs font-bold text-[#223945] uppercase tracking-wide">Ubicación Exacta</p>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <a
                                                        href={getMapsLink('driving')}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        title="Cómo llegar en Coche"
                                                        className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-[#223945] transition-all"
                                                    >
                                                        <span className="sr-only">Coche</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /><path d="M2 12h12" /></svg>
                                                    </a>
                                                    <a
                                                        href={getMapsLink('transit')}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        title="Cómo llegar en Transporte Público"
                                                        className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-[#223945] transition-all"
                                                    >
                                                        <span className="sr-only">Transporte Público</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="3" rx="2" /><path d="M8 21v-2" /><path d="M16 21v-2" /><path d="M4 11h16" /><path d="M10 15.5V17" /><path d="M14 15.5V17" /></svg>
                                                    </a>
                                                    <a
                                                        href={getMapsLink('walking')}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        title="Cómo llegar Andando"
                                                        className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-[#223945] transition-all"
                                                    >
                                                        <span className="sr-only">Andando</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0" /><path d="M13 31.6V12h3" /><path d="M8 19l4 1 2-2" /></svg>
                                                    </a>
                                                    <div className="w-px h-4 bg-neutral-200 mx-1"></div>
                                                    <a
                                                        href={`https://www.google.com/maps/dir/?api=1&destination=${c.latitud},${c.longitud}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        title="Abrir en Google Maps"
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#223945] text-white hover:bg-black transition-all text-xs font-bold ml-1"
                                                    >
                                                        <span>IR</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center bg-neutral-50 text-neutral-400 p-8 text-center border-dashed border-2 border-neutral-200 m-4 rounded-xl">
                                        <MapPin className="w-16 h-16 mb-4 opacity-50" />
                                        <p className="font-bold text-lg text-neutral-500">Ubicación no disponible</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
