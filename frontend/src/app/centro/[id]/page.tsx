'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import api from '@/lib/axios';
import dynamic from 'next/dynamic';
import { Mail, Phone, MapPin, Globe, Star, BookOpen, Building2, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Dynamic import map to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), { 
    ssr: false,
    loading: () => <div className="h-64 md:h-full bg-neutral-100 animate-pulse rounded-xl flex items-center justify-center text-neutral-500">Cargando mapa...</div>
});

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function CentroDetail() {
    const params = useParams();
    const id = params.id;
    const { data: centro, error } = useSWR(id ? `/centros/${id}` : null, fetcher);
    const { data: ciclos } = useSWR(id ? `/centros/${id}/ciclos` : null, fetcher);
    
    // Favorites logic
    const [isFavorite, setIsFavorite] = useState(false);
    const [loadingFav, setLoadingFav] = useState(false);

    const toggleFavorite = async () => {
        setLoadingFav(true);
        try {
            if (isFavorite) {
                await api.delete(`/favoritos/${id}`);
                setIsFavorite(false);
            } else {
                await api.post(`/favoritos/${id}`);
                setIsFavorite(true);
            }
        } catch (e) {
            alert('Debes iniciar sesión para guardar favoritos');
        } finally {
            setLoadingFav(false);
        }
    };

    const { data: favoritos } = useSWR('/favoritos', fetcher);
    
    useEffect(() => {
        if (favoritos && centro) {
            // Favoritos API returns array directly now
            const favArray = Array.isArray(favoritos) ? favoritos : favoritos.data || [];
            setIsFavorite(favArray.some((fav: any) => fav.centro_id === centro.data.id || fav.centro.id === centro.data.id));
        }
    }, [favoritos, centro]);

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
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
                <p className="text-neutral-600">Cargando información del centro...</p>
            </div>
        </div>
    );

    const c = centro.data;

    // Badge color based on naturaleza
    const getNaturalezaBadge = (naturaleza: string) => {
        switch (naturaleza?.toUpperCase()) {
            case 'PÚBLICO':
                return 'bg-primary-100 text-primary-800 border border-primary-200';
            case 'PRIVADO':
                return 'bg-secondary-100 text-secondary-800 border border-secondary-200';
            case 'CONCERTADO':
                return 'bg-success-100 text-success-700 border border-success-200';
            default:
                return 'bg-neutral-100 text-neutral-700 border border-neutral-200';
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

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 font-medium mb-6 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Volver a resultados
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Info */}
                    <div className="space-y-6">
                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`badge ${getNaturalezaBadge(c.naturaleza)}`}>
                                    {c.naturaleza || 'Sin especificar'}
                                </span>
                                <span className="text-sm text-neutral-600">{c.denominacion_generica}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
                                {c.nombre}
                            </h1>
                        </div>

                        {/* Contact Information Card */}
                        <div className="card p-6 space-y-4">
                            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary-600" />
                                Información de contacto
                            </h3>
                            
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 text-neutral-700">
                                    <MapPin className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">{c.direccion}</p>
                                        <p className="text-sm text-neutral-600">{c.codigo_postal}, {c.localidad} ({c.provincia})</p>
                                    </div>
                                </div>
                                
                                {c.telefono && (
                                    <div className="flex items-center gap-3 text-neutral-700">
                                        <Phone className="w-5 h-5 text-secondary-600 flex-shrink-0" />
                                        <a href={`tel:${c.telefono}`} className="hover:text-primary-600 transition-colors">
                                            {c.telefono}
                                        </a>
                                    </div>
                                )}
                                
                                {c.email && (
                                    <div className="flex items-center gap-3 text-neutral-700">
                                        <Mail className="w-5 h-5 text-success-600 flex-shrink-0" />
                                        <a href={`mailto:${c.email}`} className="hover:text-primary-600 transition-colors break-all">
                                            {c.email}
                                        </a>
                                    </div>
                                )}
                                
                                {c.web && (
                                    <div className="flex items-center gap-3 text-neutral-700">
                                        <Globe className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                        <a 
                                            href={c.web} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="hover:text-primary-600 transition-colors truncate"
                                        >
                                            Visitar sitio web
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Favorites Button */}
                        <button 
                            onClick={toggleFavorite}
                            disabled={loadingFav}
                            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                                isFavorite 
                                ? 'bg-secondary-500 hover:bg-secondary-600 text-white shadow-md' 
                                : 'bg-white border-2 border-neutral-300 text-neutral-700 hover:border-secondary-500 hover:text-secondary-600'
                            }`}
                        >
                            <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                            {isFavorite ? 'Guardado en favoritos' : 'Añadir a favoritos'}
                        </button>
                        
                        {/* FP Cycles */}
                        {ciclos && ciclos.data.length > 0 && (
                            <div className="card p-6">
                                <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-primary-600" />
                                    Oferta de Formación Profesional
                                </h3>
                                <div className="space-y-3">
                                    {ciclos.data.map((ciclo: any) => (
                                        <div 
                                            key={ciclo.id} 
                                            className={`border p-4 rounded-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${getLevelBackground(ciclo.nivel_educativo)}`}
                                        >
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`badge ${getLevelColor(ciclo.nivel_educativo)}`}>
                                                        {ciclo.nivel_educativo}
                                                    </span>
                                                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide bg-white px-2 py-0.5 rounded border border-neutral-200">
                                                        {ciclo.modalidad}
                                                    </span>
                                                </div>
                                                <p className="font-bold text-neutral-900 text-lg">{ciclo.ciclo_formativo}</p>
                                                <p className="text-sm text-neutral-600 mt-1 flex items-center gap-1">
                                                     Familia: <span className="font-medium text-primary-700">{ciclo.familia_profesional}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Map */}
                    <div className="h-[400px] lg:h-auto lg:sticky lg:top-24">
                        <div className="card overflow-hidden h-full">
                            {c.latitud && c.longitud ? (
                                <Map centros={[c]} center={[parseFloat(c.latitud), parseFloat(c.longitud)]} zoom={15} />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center bg-neutral-50 text-neutral-500 p-8 text-center">
                                    <MapPin className="w-12 h-12 mb-3 text-neutral-400" />
                                    <p className="font-medium">Ubicación no disponible</p>
                                    <p className="text-sm">No hay coordenadas para este centro</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
