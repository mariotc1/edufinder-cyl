'use client';

import { MapPin, Navigation, Layers, Search } from 'lucide-react';
import { useState } from 'react';

interface MapSidebarProps {
    radius: number;
    setRadius: (radius: number) => void;
    filters: FilterOptions;
    setFilters: (filters: FilterOptions) => void;
    onLocateUser: () => void;
    onClearLocation: () => void;
    userLocation: { lat: number, lon: number } | null;
    centerCount: number;
    loading: boolean;
}

import { FilterOptions } from '@/types';

export default function MapSidebar({ radius, setRadius, filters, setFilters, onLocateUser, onClearLocation, userLocation, centerCount, loading }: MapSidebarProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    // Data Selectors (Duplicated from FilterBar for consistency)
    const provincias = ['AVILA', 'BURGOS', 'LEON', 'PALENCIA', 'SALAMANCA', 'SEGOVIA', 'SORIA', 'VALLADOLID', 'ZAMORA'];
    const tiposEnsenanza = [
        { value: 'FP', label: 'Formación Profesional' },
        { value: 'ESO', label: 'ESO / Bachillerato' },
        { value: 'PRIMARIA', label: 'Infantil y Primaria' },
        { value: 'ESPECIAL', label: 'Educación Especial' },
    ];
    const familiasFP = [
        'ADMINISTRACIÓN Y GESTIÓN', 'INFORMÁTICA Y COMUNICACIONES', 'SANIDAD', 'COMERCIO Y MARKETING', 
        'ELECTRICIDAD Y ELECTRÓNICA', 'HOTELERÍA Y TURISMO', 'SERVICIOS SOCIOCULTURALES Y A LA COMUNIDAD',
        'TRANSPORTE Y MANTENIMIENTO DE VEHÍCULOS', 'INSTALACIÓN Y MANTENIMIENTO', 'ACTIVIDADES FÍSICAS Y DEPORTIVAS',
        'IMAGEN PERSONAL', 'AGRARIA', 'HOSTELERÍA Y TURISMO'
    ];
    const niveles = [
        { value: 'BASICA', label: 'FP Básica' },
        { value: 'GM', label: 'Grado Medio' },
        { value: 'GS', label: 'Grado Superior' },
        { value: 'CE', label: 'Curso de Especialización' },
    ];
    const modalidades = [
        { value: 'PRESENCIAL', label: 'Presencial' },
        { value: 'DISTANCIA', label: 'Distancia' },
    ];

    // Handle Filter Changes with Dependency Clearing logic
    const handleChange = (key: keyof FilterOptions, value: any) => {
        if (key === 'tipo' && value !== 'FP') {
             // If switching away from FP, clear specific FP fields
             setFilters({
                 ...filters,
                 [key]: value,
                 familia: '',
                 nivel: '',
                 modalidad: ''
             });
        } else {
            setFilters({ ...filters, [key]: value });
        }
    };

    return (
        <div className={`absolute bottom-0 left-0 right-0 md:top-24 md:left-6 md:right-auto md:bottom-auto z-[1000] transition-all duration-300 ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-60px)] md:translate-y-0'}`}>
            <div className="bg-white/95 backdrop-blur-md border border-white/20 shadow-xl rounded-t-2xl md:rounded-2xl w-full md:w-80 overflow-hidden flex flex-col max-h-[80vh] md:max-h-[calc(100vh-120px)]">
                {/* Header */}
                <div 
                    className="p-4 border-b border-neutral-100 flex items-center justify-between cursor-pointer md:cursor-default shrink-0"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#223945]/10 rounded-lg text-[#223945]">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-[#223945]">Filtros Avanzados</h2>
                            <p className="text-xs text-neutral-500 font-medium">
                                {loading ? 'Buscando...' : `${centerCount} centros encontrados`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
                {/* Content - Scrollable */}
                <div className="p-5 space-y-6 overflow-y-auto custom-scrollbar">
                    
                    {/* Location Control */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Tu Ubicación</label>
                        
                        {userLocation ? (
                            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2">
                                <button 
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-green-50 text-green-700 border border-green-200 shadow-sm cursor-default"
                                >
                                    <Navigation className="w-4 h-4 fill-current" />
                                    Ubicación Activa
                                </button>
                                <button 
                                    onClick={onClearLocation} 
                                    className="text-xs text-red-500 hover:text-red-600 font-medium hover:underline text-center"
                                >
                                    Desactivar mi ubicación
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={onLocateUser}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-[#223945] text-white shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all"
                            >
                                <Navigation className="w-4 h-4" />
                                Usar mi ubicación GPS
                            </button>
                        )}
                    </div>

                    <div className="h-px bg-neutral-100 w-full" />

                    {/* Radius Slider */}
                    <div className={`space-y-4 transition-all duration-300 ${!userLocation ? 'opacity-50 pointer-events-none grayscale blur-[1px]' : 'opacity-100'}`}>
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Radio de Búsqueda</label>
                            <span className="text-sm font-bold text-[#223945]">{radius} km</span>
                        </div>
                        <div className="relative flex items-center">
                             <input 
                                type="range" 
                                min="1" 
                                max="100" 
                                value={radius} 
                                onChange={(e) => setRadius(parseInt(e.target.value))}
                                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#223945]"
                            />
                        </div>
                        <p className="text-[10px] text-neutral-400 text-center">
                            Ajusta el radio para buscar centros cerca de ti
                        </p>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}
