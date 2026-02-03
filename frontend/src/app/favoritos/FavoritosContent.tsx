'use client';

import { Suspense, useState, useCallback } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, School, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';
import CentroCard from '@/components/CentroCard';
import CentroCardSkeleton from '@/components/ui/CentroCardSkeleton';
import { Centro } from '@/types';
import axios from '@/lib/axios';

const fetchFavorites = async (url: string) => {
  const response = await axios.get(url);
  return response.data;
};

export default function FavoritosContent() {
    const { data, error, isLoading, mutate } = useSWR('/favoritos', fetchFavorites, {
        revalidateOnFocus: true,
        shouldRetryOnError: false 
    });

    const getCentros = useCallback(() => {
        if (!data) return [];
        const rawList = Array.isArray(data) ? data : (data.data || []);
        
        return rawList.map((item: any) => item.centro).filter(Boolean);
    }, [data]);

    const centros = getCentros();

    const handleToggle = async () => {
        setTimeout(() => {
            mutate();
        }, 500);
    };

    const router = useRouter();

    return (
        <div className="min-h-screen bg-brand-gradient pt-20 pb-12 px-4 sm:px-6">
             <div className="max-w-7xl mx-auto">
                <button 
                    onClick={() => router.back()} 
                    className="inline-flex items-center gap-2 text-neutral-500 hover:text-[#223945] mb-8 font-bold transition-colors text-sm uppercase tracking-wide group"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Volver
                </button>

                <div className="mb-8">
                     <h1 className="text-2xl md:text-3xl font-bold text-[#223945] mb-2 flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-[#223945] to-[#374f5e] text-white rounded-xl shadow-lg shadow-[#223945]/20">
                            <Heart className="w-6 h-6 fill-white" />
                        </div>
                        Mis Favoritos
                     </h1>
                     <p className="text-neutral-500 max-w-2xl text-sm pl-[3.5rem] leading-relaxed">
                        Tu colección de centros favoritos, accede rápidamente a los que mas te importan
                     </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                             <CentroCardSkeleton key={`fav-skeleton-${i}`} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-24 bg-white/50 backdrop-blur-md rounded-3xl shadow-sm border border-white/60 max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                           <Loader2 className="w-10 h-10 text-red-400 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#223945] mb-2">Error al cargar favoritos</h2>
                        <p className="text-neutral-500 mb-8">
                            Es posible que tu sesión haya expirado o haya un problema de conexión.
                        </p>
                         <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-[#223945] text-white rounded-full font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all">
                            Iniciar sesión nuevamente
                        </Link>
                    </div>
                ) : centros.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-24 px-4 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="relative mb-8">
                            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center z-10 relative shadow-sm border border-neutral-100">
                                <Heart className="w-14 h-14 text-neutral-300" />
                            </div>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-[#223945] mb-3 tracking-tight">
                            Tu lista está vacía
                        </h2>
                        <p className="text-neutral-500 max-w-md text-sm mb-10 leading-relaxed">
                            Aún no has guardado ningún centro. Explora el mapa o usa el buscador para encontrar tu centro ideal.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link 
                                href="/" 
                                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#223945] text-white rounded-xl font-bold shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all uppercase tracking-wide text-xs"
                            >
                                <School className="w-4 h-4" />
                                Ir al buscador
                            </Link>
                            <Link 
                                href="/mapa" 
                                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-[#223945] border border-neutral-200 rounded-xl font-bold hover:bg-neutral-50 hover:border-neutral-300 transition-all uppercase tracking-wide text-xs shadow-sm"
                            >
                                Ver mapa
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                         {centros.map((centro: Centro, index: number) => (
                             <CentroCard
                                key={centro.id}
                                centro={centro}
                                index={index}
                                initialIsFavorite={true}
                                onToggle={handleToggle}
                             />
                         ))}
                    </div>
                )}
             </div>
        </div>
    );
}