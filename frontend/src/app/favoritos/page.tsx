'use client';

import useSWR from 'swr';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star, MapPin, Loader2 } from 'lucide-react';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function Favoritos() {
    const { data, error, isLoading } = useSWR('/favoritos', fetcher);

    if (error) return <div className="text-center p-10 text-red-400">Error al cargar favoritos (¿Has iniciado sesión?)</div>;
    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-cyan-500 w-10 h-10" /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Star className="text-yellow-400 fill-current" /> Mis Centros Favoritos
            </h1>

            {data.data.length === 0 ? (
                <div className="text-center text-slate-500 py-20 bg-slate-900 rounded-xl border border-slate-800">
                    <p>No tienes favoritos guardados aún.</p>
                    <Link href="/" className="text-cyan-500 hover:underline mt-2 inline-block">Explorar centros</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.data.map((centro: any) => (
                         <motion.div 
                            key={centro.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-pink-500/50 transition-all hover:shadow-[0_0_20px_rgba(236,72,153,0.1)] flex flex-col"
                         >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-mono text-pink-400 bg-pink-950/30 px-2 py-1 rounded">
                                    {centro.naturaleza}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-100 mb-2 truncate">
                                {centro.nombre}
                            </h3>
                            <p className="text-sm text-slate-400 mb-4 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> {centro.localidad}
                            </p>
                            <Link 
                                href={`/centro/${centro.id}`} 
                                className="mt-auto w-full text-center bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg font-medium transition-colors"
                            >
                                Ver Detalles
                            </Link>
                         </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
