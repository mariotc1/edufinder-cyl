import { MapPin, Navigation, Layers, Search, ChevronDown, ChevronUp, Settings, Filter } from 'lucide-react';
import { useState } from 'react';
import { FilterOptions } from '@/types';

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

export default function MapSidebar({ radius, setRadius, filters, setFilters, onLocateUser, onClearLocation, userLocation, centerCount, loading }: MapSidebarProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [sections, setSections] = useState({
        filters: true,
        config: false
    });

    const toggleSection = (section: 'filters' | 'config') => {
        setSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Data Selectors
    const provincias = ['AVILA', 'BURGOS', 'LEON', 'PALENCIA', 'SALAMANCA', 'SEGOVIA', 'SORIA', 'VALLADOLID', 'ZAMORA'];

    // Handle Filter Changes
    const handleChange = (key: keyof FilterOptions, value: any) => {
        const newValue = value === "" ? undefined : value;
        setFilters({ ...filters, [key]: newValue });
    };

    // Shared Styles
    const selectContainerClass = "relative";
    const selectClass = "w-full appearance-none bg-neutral-50 border border-neutral-200 text-neutral-700 py-2.5 px-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#223945]/20 focus:border-[#223945] text-sm font-medium transition-all hover:border-[#223945]/50 cursor-pointer";
    const iconClass = "pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500";

    return (
        <div className={`absolute bottom-0 left-0 right-0 md:top-24 md:left-6 md:right-auto md:bottom-auto z-[1000] transition-transform duration-300 ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-60px)] md:translate-y-0'}`}>
            <div className="bg-white/95 backdrop-blur-md border border-white/20 shadow-xl rounded-t-2xl md:rounded-2xl w-full md:w-80 overflow-hidden flex flex-col max-h-[85vh] md:max-h-[calc(100vh-140px)] relative transition-all">
                
                {/* Visual Polish: Gradient Top Border */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300 z-10"></div>

                {/* Header Toggle */}
                <div 
                    className="p-4 border-b border-neutral-100 flex items-center justify-between cursor-pointer group bg-white/50 hover:bg-white transition-colors mt-1.5"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#223945]/10 rounded-lg text-[#223945] group-hover:bg-[#223945] group-hover:text-white transition-colors">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-[#223945] leading-tight">Explorador</h2>
                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide">
                                {loading ? 'Actualizando...' : `${centerCount} centros`}
                            </p>
                        </div>
                    </div>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronUp className="w-5 h-5 text-neutral-400" />}
                </div>

                {/* Scrollable Content */}
                <div className={`overflow-y-auto custom-scrollbar bg-neutral-50/50 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    
                    {/* SECTION 1: QUICK CONTROLS (Location & Radius) - Always Visible at Top */}
                    <div className="p-4 bg-white border-b border-neutral-100 space-y-4">
                        {/* Location Toggle */}
                        {userLocation ? (
                            <div className="flex items-center justify-between gap-3 p-3 bg-green-50 border border-green-200 rounded-xl animate-in fade-in">
                                <div className="flex items-center gap-2 text-green-700">
                                    <Navigation className="w-4 h-4 fill-current" />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold leading-tight">Ubicación Activa</span>
                                        <button onClick={onClearLocation} className="text-[10px] hover:underline text-left opacity-80">Desactivar</button>
                                    </div>
                                </div>
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                        ) : (
                            <button 
                                onClick={onLocateUser}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-[#223945] text-white shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all active:translate-y-0"
                            >
                                <Navigation className="w-4 h-4" />
                                Usar mi ubicación GPS
                            </button>
                        )}

                        {/* Radius Slider (Only if location active) */}
                        <div className={`space-y-2 transition-all duration-300 ${!userLocation ? 'opacity-50 blur-[1px] pointer-events-none' : 'opacity-100'}`}>
                             <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Radio de Búsqueda</label>
                                <span className="text-xs font-bold text-[#223945] bg-neutral-100 px-2 py-0.5 rounded">{radius} km</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="100" 
                                value={radius} 
                                onChange={(e) => setRadius(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#223945]"
                            />
                        </div>
                    </div>

                    {/* SECTION 2: FILTERS */}
                    <div className="bg-white border-b border-neutral-100">
                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-2 pb-2">
                                <Filter className="w-4 h-4 text-[#223945]" />
                                <span className="font-bold text-sm text-[#223945]">Filtros</span>
                            </div>

                             {/* Search Input */}
                             <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#223945] transition-colors" />
                                <input 
                                type="text"
                                placeholder="Buscar centro..." 
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#223945] focus:ring-2 focus:ring-[#223945]/10 transition-all outline-none text-sm font-medium placeholder:text-neutral-400 text-neutral-800"
                                value={filters.q || ''}
                                onChange={(e) => handleChange('q', e.target.value)}
                                />
                            </div>

                            {/* Provincia */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">Provincia</label>
                                <div className={selectContainerClass}>
                                    <select 
                                        className={selectClass}
                                        value={filters.provincia || ''}
                                        onChange={(e) => handleChange('provincia', e.target.value)}
                                    >
                                        <option value="">Todas</option>
                                        {provincias.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <div className={iconClass}><ChevronDown className="w-4 h-4" /></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
