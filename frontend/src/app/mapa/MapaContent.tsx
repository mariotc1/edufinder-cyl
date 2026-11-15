'use client';

import { startTransition, useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/axios';
import dynamic from 'next/dynamic';
import MapSidebar from '@/components/map/MapSidebar';
import { useSearchParams } from 'next/navigation';

import { FilterOptions } from '@/types';

const Map = dynamic(() => import('@/components/Map'), { 
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-neutral-100">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#223945]/20 border-t-[#223945] rounded-full animate-spin"></div>
                <p className="font-bold text-[#223945] animate-pulse">Cargando Mapa...</p>
            </div>
        </div>
    )
});

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function MapaContent() {
    const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
    const [radius, setRadius] = useState(50); // Default 50km
    const [filters, setFilters] = useState<FilterOptions>({});
    const [status, setStatus] = useState<'idle' | 'locating'>('idle');

    const queryParams = new URLSearchParams();
    queryParams.append('map', 'true');
    
    if (userLocation) {
        queryParams.append('lat', userLocation.lat.toString());
        queryParams.append('lon', userLocation.lon.toString());
        queryParams.append('radius', radius.toString());
    }

    Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value));
    });

    const apiUrl = `/centros?${queryParams.toString()}`;

    const { data, isLoading } = useSWR(apiUrl, fetcher, {
        keepPreviousData: true,
        revalidateOnFocus: false
    });

    const { data: favoritesData } = useSWR('/favoritos', fetcher);
    const favoriteIds = (favoritesData && (Array.isArray(favoritesData) ? favoritesData : favoritesData?.data) || [])
        .map((fav: any) => fav.centro_id || fav.centro?.id)
        .filter(Boolean);

    const handleLocateUser = () => {
        setStatus('locating');
        if (navigator.geolocation) {
             navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                    setStatus('idle');
                    if (!userLocation) setRadius(20);
                },
                (error) => {
                    console.error("Error getting location", error);
                    setStatus('idle');
                    alert("No pudimos obtener tu ubicación.");
                }
            );
        } else {
            alert("No geolocation support");
            setStatus('idle');
        }
    };

    const handleClearLocation = () => {
        setUserLocation(null);
        setRadius(50); 
        setFilters(prev => {
             const { lat, lng, ...rest } = prev; 
             return rest;
        });
    };

    const searchParams = useSearchParams();
    // ?favoritos=1 → muestra solo los centros guardados por el usuario
    const [soloFavoritos, setSoloFavoritos] = useState(() => searchParams.get('favoritos') === '1');
    const centroIdParam = searchParams.get('centro');
    const focusCenterId = centroIdParam ? parseInt(centroIdParam) : undefined;

    const centrosVisibles = soloFavoritos
        ? (data?.data || []).filter((c: any) => favoriteIds.includes(c.id))
        : (data?.data || []);

    let mapCenter: [number, number] | undefined = undefined;
    if (focusCenterId && data?.data) {
        const target = data.data.find((c: any) => c.id === focusCenterId);
        if (target && target.latitud && target.longitud) {
             mapCenter = [parseFloat(target.latitud), parseFloat(target.longitud)];
        }
    }

    return (
        <div className="h-[calc(100dvh-var(--bottom-nav-height)-var(--mobile-header-height))] md:h-[calc(100vh-80px)] w-full relative bg-neutral-100 overflow-hidden">

            {/* Initial load overlay — shown while fetching all centers for the first time */}
            {isLoading && !data && (
                <div className="absolute inset-0 z-[500] bg-neutral-100 flex flex-col items-center justify-center gap-4">
                    <div className="w-14 h-14 border-4 border-[#223945]/20 border-t-[#223945] rounded-full animate-spin" />
                    <div className="text-center px-8">
                        <p className="font-bold text-[#223945] text-base">Cargando el mapa</p>
                        <p className="text-neutral-500 text-sm mt-1.5">Preparando todos los centros de Castilla y León</p>
                    </div>
                </div>
            )}

            {/* Filter update pill — shown while reloading with existing data visible */}
            {isLoading && data && (
                <div className="absolute top-3 right-3 z-[500] bg-white/95 shadow-md rounded-full px-3 py-1.5 flex items-center gap-2 pointer-events-none">
                    <div className="w-3.5 h-3.5 border-2 border-[#223945]/30 border-t-[#223945] rounded-full animate-spin" />
                    <span className="text-xs font-bold text-[#223945]">Actualizando...</span>
                </div>
            )}

            {/* Sidebar Controls */}
            <MapSidebar 
                radius={radius} 
                setRadius={setRadius}
                filters={filters}
                setFilters={setFilters} 
                onLocateUser={handleLocateUser}
                onClearLocation={handleClearLocation}
                userLocation={userLocation}
                centerCount={centrosVisibles.length}
                loading={isLoading || status === 'locating'}
            />

            {/* Map Container */}
            {/* Aviso de modo "solo favoritos" */}
            {soloFavoritos && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 md:left-auto md:right-5 md:translate-x-0 md:top-5 z-[1000] flex items-center gap-2 pl-3.5 pr-1.5 py-1.5 rounded-full bg-[#223945] text-white shadow-lg whitespace-nowrap">
                    <span className="text-sm font-bold">Tus favoritos</span>
                    <button
                        onClick={() => setSoloFavoritos(false)}
                        className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-xs font-bold transition-colors"
                    >
                        Ver todos
                    </button>
                </div>
            )}

            <Map 
                centros={centrosVisibles} 
                fitToCentros={soloFavoritos}
                userLocation={userLocation}
                radius={radius}
                favoriteIds={favoriteIds}
                center={mapCenter}
                zoom={mapCenter ? 16 : undefined}
                focusCenterId={focusCenterId}
            />
        </div>
    );
}