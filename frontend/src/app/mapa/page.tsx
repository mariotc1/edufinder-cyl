'use client';

import { useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/axios';
import dynamic from 'next/dynamic';
import MapSidebar from '@/components/map/MapSidebar';

// Dynamic import with custom loading
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

export default function MapaPage() {
    const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
    const [radius, setRadius] = useState(50); // Default 50km
    const [status, setStatus] = useState<'idle' | 'locating'>('idle');

    // Construct API URL based on active filters
    const apiUrl = userLocation 
        ? `/centros?map=true&lat=${userLocation.lat}&lon=${userLocation.lon}&radius=${radius}`
        : '/centros?map=true';

    const { data, isLoading } = useSWR(apiUrl, fetcher, {
        keepPreviousData: true // Smooth transitions
    });

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
                    // Reset value to reasonable default when locating first time
                    if (!userLocation) setRadius(20);
                },
                (error) => {
                    console.error("Error getting location", error);
                    setStatus('idle');
                    alert("No pudimos obtener tu ubicación. Por favor revisa los permisos del navegador.");
                }
            );
        } else {
            alert("Tu navegador no soporta geolocalización.");
            setStatus('idle');
        }
    };

    return (
        <div className="h-[calc(100vh-80px)] w-full relative bg-neutral-100 overflow-hidden">
            {/* Sidebar Controls */}
            <MapSidebar 
                radius={radius} 
                setRadius={setRadius} 
                onLocateUser={handleLocateUser}
                userLocation={userLocation}
                centerCount={data?.data?.length || 0}
                loading={isLoading || status === 'locating'}
            />

            {/* Map Container */}
            <Map 
                centros={data?.data || []} 
                userLocation={userLocation}
                radius={radius}
            />
        </div>
    );
}
