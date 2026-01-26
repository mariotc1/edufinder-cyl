'use client';

import useSWR from 'swr';
import api from '@/lib/axios';
import Link from 'next/link';
import { Heart, School } from 'lucide-react';
import CentroCard from '@/components/CentroCard';
import { Centro } from '@/types';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function Favoritos() {
    const { data, error, isLoading, mutate } = useSWR('/favoritos', fetcher);

    if (error) return (
        <div className="flex items-center justify-center min-h-screen bg-brand-gradient">
            <div className="bg-white/80 backdrop-blur-md border border-red-100 rounded-xl p-8 max-w-md mx-auto text-center shadow-lg">
                <p className="text-red-600 font-bold text-lg mb-2">Error al cargar favoritos</p>
                <p className="text-neutral-500 mb-4 text-sm">Posiblemente tu sesión ha expirado.</p>
                <Link href="/login" className="inline-flex items-center justify-center bg-[#223945] text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all">
                    Iniciar Sesión
                </Link>
            </div>
        </div>
    );

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-brand-gradient">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-[#223945] mb-4"></div>
            <p className="text-[#223945] font-bold">Cargando tus favoritos...</p>
        </div>
    );

    // Backend returns array directly [ {id: 1, centro: {...}}, ... ]
    const favoritosList = Array.isArray(data) ? data : (data?.data || []);

    return (
        <div className="min-h-screen bg-brand-gradient pt-28 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#111827] flex items-center gap-3 mb-2 font-heading tracking-tight">
                        <div className="p-2.5 bg-[#223945] rounded-xl shadow-md text-white">
                             <Heart className="w-8 h-8 fill-current" />
                        </div>
                        Mis Centros Favoritos
                    </h1>
                    <p className="text-neutral-600 text-lg ml-1 max-w-2xl leading-relaxed">
                        Gestiona tu colección personal de centros educativos guardados.
                    </p>
                </div>

                {favoritosList.length === 0 ? (
                    <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/50 p-16 text-center shadow-xl animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-neutral-100">
                            <Heart className="w-10 h-10 text-neutral-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#223945] mb-3">No tienes favoritos todavía</h3>
                        <p className="text-neutral-500 max-w-md mx-auto mb-8 leading-relaxed">
                            Explora nuestra lista de centros y pulsa el icono de corazón para guardarlos aquí.
                        </p>
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 bg-[#223945] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all"
                        >
                            <School className="w-5 h-5" />
                            Explorar Centros
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {favoritosList.map((fav: { id: number; centro: Centro }, index: number) => (
                             <CentroCard 
                                key={fav.id} 
                                centro={fav.centro} 
                                index={index}
                                initialIsFavorite={true}
                                onToggle={(isActive) => {
                                    if (!isActive) {
                                        // Instant removal from UI (Optimistic UI)
                                        // Filter current data to remove this item
                                        mutate(
                                            (currentData: any) => {
                                                if (!currentData) return [];
                                                // Handle potential data structures (array or paginated object if any)
                                                // Assuming simple array based on earlier code
                                                if (Array.isArray(currentData)) {
                                                    return currentData.filter((item: any) => item.id !== fav.id);
                                                }
                                                // If data structure is { data: [...] }, handle that
                                                if (currentData.data && Array.isArray(currentData.data)) {
                                                    return { ...currentData, data: currentData.data.filter((item: any) => item.id !== fav.id) };
                                                }
                                                return currentData;
                                            },
                                            false // false = do not revalidate immediately
                                        );
                                    }
                                }}
                             />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
