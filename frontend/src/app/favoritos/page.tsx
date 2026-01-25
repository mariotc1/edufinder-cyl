'use client';

import useSWR from 'swr';
import api from '@/lib/axios';
import Link from 'next/link';
import { Star, MapPin, Loader2, Heart, Building2 } from 'lucide-react';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function Favoritos() {
    const { data, error, isLoading } = useSWR('/favoritos', fetcher);

    if (error) return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
                <p className="text-red-700 font-medium text-lg">Error al cargar favoritos</p>
                <p className="text-red-500 mt-2">Posiblemente tu sesión ha expirado.</p>
                <Link href="/login" className="btn-primary mt-4 inline-block">Iniciar Sesión</Link>
            </div>
        </div>
    );

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-40">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
            <p className="text-neutral-600 font-medium">Cargando tus favoritos...</p>
        </div>
    );

    // Backend returns array directly [ {id: 1, centro: {...}}, ... ]
    const favoritosList = Array.isArray(data) ? data : (data?.data || []);

    const getNaturalezaBadge = (naturaleza: string) => {
        switch (naturaleza?.toUpperCase()) {
            case 'PÚBLICO': return 'bg-primary-100 text-primary-800 border-primary-200';
            case 'PRIVADO': return 'bg-secondary-100 text-secondary-800 border-secondary-200';
            case 'CONCERTADO': return 'bg-success-100 text-success-700 border-success-200';
            default: return 'bg-neutral-100 text-neutral-700 border-neutral-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                             <Star className="w-8 h-8 text-yellow-500 fill-current" />
                        </div>
                        Mis Centros Favoritos
                    </h1>
                    <p className="mt-2 text-neutral-600 text-lg">
                        Gestiona y accede rápidamente a los centros que has guardado.
                    </p>
                </div>

                {favoritosList.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-10 h-10 text-neutral-400" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">No tienes favoritos todavía</h3>
                        <p className="text-neutral-500 max-w-md mx-auto mb-8">
                            explora nuestra lista de centros y pulsa el icono de corazón para guardarlos aquí.
                        </p>
                        <Link href="/" className="btn-primary inline-flex items-center gap-2">
                            Explorar Centros
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoritosList.map((fav: any) => {
                             const centro = fav.centro;
                             return (
                                <div 
                                    key={fav.id}
                                    className="card group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary-500"
                                >
                                    <div className="p-6 h-full flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`badge ${getNaturalezaBadge(centro.naturaleza)}`}>
                                                {centro.naturaleza || 'Centro'}
                                            </span>
                                            {/* Since we don't have distance here, maybe showing nature/type is enough */}
                                        </div>
                                        
                                        <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary-700 transition-colors line-clamp-2">
                                            {centro.nombre}
                                        </h3>
                                        
                                        <div className="space-y-2 mb-6">
                                            <p className="text-sm text-neutral-600 flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-1">{centro.localidad} ({centro.provincia})</span>
                                            </p>
                                            <p className="text-xs text-neutral-500 flex items-center gap-2">
                                                 <Building2 className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                                                 <span className="line-clamp-1">{centro.denominacion_generica}</span>
                                            </p>
                                        </div>

                                        <Link 
                                            href={`/centro/${centro.id}`} 
                                            className="btn-outline w-full text-center block mt-auto group-hover:bg-primary-50 group-hover:text-primary-700 group-hover:border-primary-200"
                                        >
                                            Ver Detalles
                                        </Link>
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
