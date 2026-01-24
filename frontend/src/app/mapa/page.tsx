'use client';

import useSWR from 'swr';
import api from '@/lib/axios';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

const Map = dynamic(() => import('@/components/Map'), { 
    ssr: false,
    loading: () => <div className="h-full flex items-center justify-center bg-neutral-100 text-neutral-600">Cargando mapa interactivo...</div>
});

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function MapaPage() {
    const { data } = useSWR('/centros?map=true', fetcher);

    return (
        <div className="h-[calc(100vh-80px)] w-full relative bg-neutral-50">
            <div className="absolute bottom-6 left-6 z-10 card p-5 max-w-xs shadow-lg animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    <h1 className="text-lg font-bold text-neutral-900">Mapa Interactivo</h1>
                </div>
                <p className="text-sm text-neutral-600">
                    Mostrando <span className="font-semibold text-primary-700">{data?.data?.length || 0}</span> centros educativos
                </p>
            </div>
            <Map centros={data?.data || []} zoom={8} />
        </div>
    );
}
