'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import api from '@/lib/axios';
import dynamic from 'next/dynamic';
import { Mail, Phone, MapPin, Globe, Star, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';

// Dynamic import map to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), { 
    ssr: false,
    loading: () => <div className="h-64 md:h-full bg-slate-800 animate-pulse rounded-lg"></div>
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
            alert('Debes iniciar sesión');
        } finally {
            setLoadingFav(false);
        }
    };

    // Check if favorite initially (needs user context or specific endpoint, for MVP simplified)
    // Actually /favoritos endpoint lists all. We can check if ID is in list.
    const { data: favoritos } = useSWR('/favoritos', fetcher);
    
    useEffect(() => {
        if (favoritos && centro) {
            setIsFavorite(favoritos.data.some((fav: any) => fav.id === centro.data.id));
        }
    }, [favoritos, centro]);


    if (error) return <div className="p-10 text-center text-red-500">Error al cargar el centro</div>;
    if (!centro) return <div className="p-10 text-center text-cyan-500">Cargando...</div>;

    const c = centro.data;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Info */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500 mb-2">
                            {c.nombre}
                        </h1>
                        <p className="text-slate-400 text-lg">{c.denominacion_generica} • {c.naturaleza}</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
                        <div className="flex items-center gap-3 text-slate-300">
                            <MapPin className="text-cyan-500" />
                            <span>{c.direccion}, {c.codigo_postal}, {c.localidad} ({c.provincia})</span>
                        </div>
                        {c.telefono && (
                             <div className="flex items-center gap-3 text-slate-300">
                                <Phone className="text-violet-500" />
                                <span>{c.telefono}</span>
                            </div>
                        )}
                        {c.email && (
                             <div className="flex items-center gap-3 text-slate-300">
                                <Mail className="text-pink-500" />
                                <a href={`mailto:${c.email}`} className="hover:text-pink-400 transition">{c.email}</a>
                            </div>
                        )}
                        {c.web && (
                             <div className="flex items-center gap-3 text-slate-300">
                                <Globe className="text-cyan-500" />
                                <a href={c.web} target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition truncate max-w-xs">{c.web}</a>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={toggleFavorite}
                        disabled={loadingFav}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all w-full justify-center ${
                            isFavorite 
                            ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white shadow-lg' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                    >
                        <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                        {isFavorite ? 'En Favoritos' : 'Añadir a Favoritos'}
                    </button>
                    
                    {/* Oferta FP */}
                    {ciclos && ciclos.data.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <BookOpen className="text-violet-500" /> Oferta Educativa FP
                            </h3>
                            <div className="space-y-3">
                                {ciclos.data.map((ciclo: any) => (
                                    <div key={ciclo.id} className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-violet-500 hover:bg-slate-800 transition">
                                        <p className="font-bold text-slate-200">{ciclo.ciclo_formativo}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-1 rounded">
                                                {ciclo.nivel_educativo}
                                            </span>
                                            <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">
                                                {ciclo.familia_profesional}
                                            </span>
                                            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                                                {ciclo.modalidad}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Map */}
                <div className="h-[400px] lg:h-auto rounded-xl overflow-hidden border border-slate-700 shadow-2xl relative">
                    {c.latitud && c.longitud ? (
                         <Map centros={[c]} center={[parseFloat(c.latitud), parseFloat(c.longitud)]} zoom={15} />
                    ) : (
                        <div className="h-full flex items-center justify-center bg-slate-900 text-slate-500">
                            Sin ubicación disponible
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
