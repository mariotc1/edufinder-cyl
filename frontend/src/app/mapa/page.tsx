'use client';

import useSWR from 'swr';
import api from '@/lib/axios';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { 
    ssr: false,
    loading: () => <div className="h-full flex items-center justify-center bg-slate-900 text-cyan-500">Cargando Mapa...</div>
});

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function MapaPage() {
    const { data } = useSWR('/centros?map=true', fetcher);

    return (
        <div className="h-[calc(100vh-64px)] w-full relative">
            <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur p-4 rounded-lg border border-slate-700 shadow-xl max-w-xs">
                <h1 className="text-lg font-bold text-white mb-2">Mapa Interactivo</h1>
                <p className="text-sm text-slate-400">Mostrando {data?.data?.length || 0} centros destacados.</p>
            </div>
            <Map centros={data?.data || []} zoom={8} />
        </div>
    );
}
