'use client';

import { MapPin, Navigation, Layers, Search } from 'lucide-react';
import { useState } from 'react';

interface MapSidebarProps {
    radius: number;
    setRadius: (radius: number) => void;
    filters: FilterOptions;
    setFilters: (filters: FilterOptions) => void;
    onLocateUser: () => void;
    userLocation: { lat: number, lon: number } | null;
    centerCount: number;
    loading: boolean;
}

import { FilterOptions } from '@/types';

export default function MapSidebar({ radius, setRadius, filters, setFilters, onLocateUser, userLocation, centerCount, loading }: MapSidebarProps) {
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
                    {/* Search & Basic Filters */}
                    <div className="space-y-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#223945] transition-colors" />
                            <input 
                                type="text"
                                placeholder="Nombre, localidad..."
                                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#223945] outline-none transition-all placeholder:text-neutral-400"
                                value={filters.q || ''}
                                onChange={(e) => handleChange('q', e.target.value)}
                            />
                        </div>

                         <select 
                            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#223945] outline-none transition-all appearance-none cursor-pointer text-neutral-700"
                            value={filters.provincia || ''}
                            onChange={(e) => handleChange('provincia', e.target.value)}
                        >
                            <option value="">Todas las provincias</option>
                            {provincias.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    <div className="h-px bg-neutral-100 w-full" />

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
                            {userLocation ? 'Ubicación y Radio' : 'Usar mi ubicación GPS'}
                        </button>
                    </div>

                    {/* Radius Slider */}
                    <div className={`space-y-4 transition-opacity duration-300 ${!userLocation ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Radio: {radius} km</label>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max="100" 
                            value={radius} 
                            onChange={(e) => setRadius(parseInt(e.target.value))}
                            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#223945]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
