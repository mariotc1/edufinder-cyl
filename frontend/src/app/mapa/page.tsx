'use client';

import { useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/axios';
import dynamic from 'next/dynamic';
import MapSidebar from '@/components/map/MapSidebar';

import { FilterOptions } from '@/types';

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
    const [filters, setFilters] = useState<FilterOptions>({});
    const [status, setStatus] = useState<'idle' | 'locating'>('idle');

    // Debounce params construction (Optional but good practice, here direct for simplicity)
    const queryParams = new URLSearchParams();
    queryParams.append('map', 'true');
    if (userLocation) {
        queryParams.append('lat', userLocation.lat.toString());
        queryParams.append('lon', userLocation.lon.toString());
        queryParams.append('radius', radius.toString());
    }
    // Add all active filters to query
    Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value));
    });

    const apiUrl = `/centros?${queryParams.toString()}`;

    const { data, isLoading } = useSWR(apiUrl, fetcher, {
        keepPreviousData: true,
        revalidateOnFocus: false
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
        setRadius(50); // Reset radius or keep it, user choice. Resetting feels cleaner.
        setFilters(prev => {
             // Use 'lng' to match FilterOptions interface
             const { lat, lng, ...rest } = prev; 
             return rest;
        });
    };

    return (
        <div className="h-[calc(100vh-80px)] w-full relative bg-neutral-100 overflow-hidden">
            {/* Sidebar Controls */}
            <MapSidebar 
                radius={radius} 
                setRadius={setRadius}
                filters={filters}
                setFilters={setFilters} 
                onLocateUser={handleLocateUser}
                onClearLocation={handleClearLocation}
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
