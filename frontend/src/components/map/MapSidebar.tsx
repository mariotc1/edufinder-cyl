import { MapPin, Navigation, Layers, Search, ChevronDown, ChevronUp, X, Building2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FilterOptions } from '@/types';
import { fetchCentroSuggestions } from '@/services/api';

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

// COMPONENTE BARRA LATERAL DEL MAPA
// Contiene filtros, controles de radio y lista resumen de centros visibles
export default function MapSidebar({ radius, setRadius, filters, setFilters, onLocateUser, onClearLocation, userLocation, centerCount, loading }: MapSidebarProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [sections, setSections] = useState({
        filters: true,
        config: false
    });

    // Estados para el modal de búsqueda
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const modalInputRef = useRef<HTMLInputElement>(null);

    // Control de colapso/expansión de la barra lateral
    const toggleSection = (section: 'filters' | 'config') => {
        setSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Focus en el input del modal cuando se abre
    useEffect(() => {
        if (showSearchModal && modalInputRef.current) {
            modalInputRef.current.focus();
        }
    }, [showSearchModal]);

    // Cerrar modal con Escape
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape' && showSearchModal) {
                setShowSearchModal(false);
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showSearchModal]);

    // Debounce para búsqueda de centros en el modal
    useEffect(() => {
        if (!showSearchModal) return;

        const timer = setTimeout(async () => {
            if (searchQuery && searchQuery.length >= 2) {
                setIsSearching(true);
                try {
                    const results = await fetchCentroSuggestions(searchQuery, {
                        provincia: filters.provincia,
                    });
                    setSuggestions(results);
                } catch (error) {
                    console.error("Error fetching centro suggestions", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, filters.provincia, showSearchModal]);

    // Abrir modal de búsqueda
    const openSearchModal = () => {
        setSearchQuery(filters.q || '');
        setShowSearchModal(true);
    };

    // Seleccionar un centro de las sugerencias
    const selectCentro = (nombre: string) => {
        setFilters({ ...filters, q: nombre });
        setShowSearchModal(false);
        setSearchQuery('');
        setSuggestions([]);
    };

    // Limpiar búsqueda
    const clearSearch = () => {
        setFilters({ ...filters, q: undefined });
        setSearchQuery('');
        setSuggestions([]);
    };

    const provincias = ['AVILA', 'BURGOS', 'LEON', 'PALENCIA', 'SALAMANCA', 'SEGOVIA', 'SORIA', 'VALLADOLID', 'ZAMORA'];

    const handleChange = (key: keyof FilterOptions, value: any) => {
        const newValue = value === "" ? undefined : value;
        setFilters({ ...filters, [key]: newValue });
    };

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
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl animate-in fade-in transition-all">
                                <div className="flex items-center gap-2.5 text-green-700">
                                    <div className="relative">
                                        <Navigation className="w-4 h-4 fill-current" />
                                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold leading-tight">Ubicación Activa</span>
                                </div>
                                <button 
                                    onClick={onClearLocation} 
                                    className="p-1.5 text-green-600 hover:text-red-500 hover:bg-green-100 rounded-lg transition-colors group"
                                    title="Desactivar ubicación"
                                >
                                    <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </button>
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
                        <div className={`space-y-3 transition-all duration-300 ${!userLocation ? 'opacity-50 blur-[1px] pointer-events-none' : 'opacity-100'}`}>
                             <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Radio de Búsqueda</label>
                                <span className="text-xs font-bold text-white bg-[#223945] px-2 py-0.5 rounded shadow-sm">{radius} km</span>
                            </div>
                            <div className="relative h-6 flex items-center">
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="100" 
                                    value={radius} 
                                    onChange={(e) => setRadius(parseInt(e.target.value))}
                                    className="absolute w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#223945]/20 z-10 custom-range-slider"
                                    style={{
                                        background: `linear-gradient(to right, #223945 ${radius}%, #e5e5e5 ${radius}%)`
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: FILTERS */}
                    <div className="bg-white border-b border-neutral-100">
                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-2 pb-2">
                                <span className="font-bold text-sm text-[#223945]">Filtros</span>
                            </div>

                            {/* Provincia */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">Provincia</label>
                                <div className={selectContainerClass}>
                                    <select
                                        className={selectClass}
                                        value={filters.provincia || ''}
                                        onChange={(e) => handleChange('provincia', e.target.value)}
                                        aria-label="Seleccionar provincia"
                                    >
                                        <option value="">Todas</option>
                                        {provincias.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <div className={iconClass}><ChevronDown className="w-4 h-4" /></div>
                                </div>
                            </div>

                             {/* Botón para abrir modal de búsqueda */}
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">Centro</label>
                                <button
                                    onClick={openSearchModal}
                                    className="w-full flex items-center gap-2 pl-3 pr-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-[#223945]/50 hover:bg-white transition-all text-left group"
                                >
                                    <Search className="w-4 h-4 text-neutral-400 group-hover:text-[#223945] transition-colors flex-shrink-0" />
                                    {filters.q ? (
                                        <span className="text-sm font-medium text-neutral-800 truncate flex-1">{filters.q}</span>
                                    ) : (
                                        <span className="text-sm font-medium text-neutral-400 flex-1">Buscar centro...</span>
                                    )}
                                    {filters.q && (
                                        <span
                                            onClick={(e) => { e.stopPropagation(); clearSearch(); }}
                                            className="p-1 rounded-full text-neutral-400 hover:text-red-500 hover:bg-neutral-100 transition-all flex-shrink-0"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </span>
                                    )}
                                </button>
                             </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Modal de Búsqueda tipo Spotlight/Command Palette */}
            {showSearchModal && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[9999]">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setShowSearchModal(false)}
                    />

                    {/* Modal Container - Centrado en pantalla */}
                    <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg">
                        <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden animate-in zoom-in-95 fade-in duration-200">

                            {/* Header con Input de búsqueda */}
                            <div className="relative border-b border-neutral-100">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <input
                                    ref={modalInputRef}
                                    type="text"
                                    placeholder="Buscar centro educativo..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 text-base font-medium text-neutral-800 placeholder:text-neutral-400 outline-none bg-transparent"
                                />
                                {isSearching ? (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-5 h-5 border-2 border-[#223945]/30 border-t-[#223945] rounded-full animate-spin"></div>
                                    </div>
                                ) : searchQuery ? (
                                    <button
                                        onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-400 hover:text-red-500 hover:bg-neutral-100 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                ) : null}
                            </div>

                            {/* Filtro activo indicator */}
                            {filters.provincia && (
                                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                    <span className="text-xs font-medium text-blue-700">
                                        Buscando en {filters.provincia}
                                    </span>
                                </div>
                            )}

                            {/* Lista de sugerencias */}
                            <div className="max-h-[50vh] overflow-y-auto">
                                {suggestions.length > 0 ? (
                                    <ul className="py-2">
                                        {suggestions.map((sug, i) => (
                                            <li
                                                key={i}
                                                onClick={() => selectCentro(sug)}
                                                className="px-4 py-3 cursor-pointer hover:bg-neutral-50 transition-all flex items-start gap-3 group border-l-4 border-transparent hover:border-[#223945]"
                                            >
                                                <div className="mt-0.5 w-8 h-8 shrink-0 rounded-xl bg-neutral-100 flex items-center justify-center group-hover:bg-[#223945] transition-all duration-200">
                                                    <Building2 className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-sm font-medium text-neutral-800 group-hover:text-[#223945] leading-snug block">
                                                        {sug}
                                                    </span>
                                                    <span className="text-xs text-neutral-400 mt-0.5 block">
                                                        Centro educativo
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : searchQuery.length >= 2 && !isSearching ? (
                                    <div className="py-12 text-center">
                                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 flex items-center justify-center">
                                            <Search className="w-6 h-6 text-neutral-400" />
                                        </div>
                                        <p className="text-sm font-medium text-neutral-600">No se encontraron centros</p>
                                        <p className="text-xs text-neutral-400 mt-1">Prueba con otro término de búsqueda</p>
                                    </div>
                                ) : (
                                    <div className="py-10 px-6 text-center">
                                        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#223945]/10 to-blue-100 flex items-center justify-center">
                                            <Search className="w-6 h-6 text-[#223945]/60" />
                                        </div>
                                        <p className="text-sm font-medium text-neutral-600 mb-1">Busca un centro educativo</p>
                                        <p className="text-xs text-neutral-400">Escribe el nombre del centro que quieres encontrar</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer con instrucciones */}
                            <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-neutral-400">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-white rounded border border-neutral-200 font-mono text-[10px]">ESC</kbd>
                                        <span>cerrar</span>
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowSearchModal(false)}
                                    className="text-xs font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
