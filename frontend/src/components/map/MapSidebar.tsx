'use client';

import { MapPin, Navigation, Layers, Search } from 'lucide-react';
import { useState } from 'react';

interface MapSidebarProps {
    radius: number;
    setRadius: (radius: number) => void;
    onLocateUser: () => void;
    userLocation: { lat: number, lon: number } | null;
    centerCount: number;
    loading: boolean;
}

export default function MapSidebar({ radius, setRadius, onLocateUser, userLocation, centerCount, loading }: MapSidebarProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className={`absolute bottom-0 left-0 right-0 md:top-24 md:left-6 md:right-auto md:bottom-auto z-[1000] transition-all duration-300 ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-60px)] md:translate-y-0'}`}>
            <div className="bg-white/95 backdrop-blur-md border border-white/20 shadow-xl rounded-t-2xl md:rounded-2xl w-full md:w-80 overflow-hidden">
                {/* Header / Handle for Mobile */}
                <div 
                    className="p-4 border-b border-neutral-100 flex items-center justify-between cursor-pointer md:cursor-default"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#223945]/10 rounded-lg text-[#223945]">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-[#223945]">Explorar Centros</h2>
                            <p className="text-xs text-neutral-500 font-medium">
                                {loading ? 'Buscando...' : `${centerCount} centros encontrados`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-6">
                    {/* Location Control */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Tu Ubicación</label>
                        <button 
                            onClick={onLocateUser}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all
                                ${userLocation 
                                    ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm' 
                                    : 'bg-[#223945] text-white shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5'
                                }`}
                        >
                            <Navigation className={`w-4 h-4 ${userLocation ? 'fill-current' : ''}`} />
                            {userLocation ? 'Ubicación Actualizada' : 'Usar mi ubicación GPS'}
                        </button>
                    </div>

                    {/* Radius Slider */}
                    <div className={`space-y-4 transition-opacity duration-300 ${!userLocation ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Radio de Búsqueda</label>
                            <span className="text-sm font-bold text-[#223945] bg-[#223945]/5 px-2 py-1 rounded-md">
                                {radius} km
                            </span>
                        </div>
                        <div className="relative h-6 flex items-center">
                             <input 
                                type="range" 
                                min="1" 
                                max="100" 
                                value={radius} 
                                onChange={(e) => setRadius(parseInt(e.target.value))}
                                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#223945]"
                            />
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                            Ajusta el radio para encontrar centros educativos cerca de tu posición actual.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
