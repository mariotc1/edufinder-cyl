import { MapPin, Navigation, Layers, Search, ChevronDown, X, Building2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { FilterOptions } from '@/types';
import { fetchCentroSuggestions } from '@/services/api';
import { titleCase } from '@/lib/centro-format';
import { formatNumber } from '@/lib/utils';
import { TIPO_TILES, PillSelect } from '@/components/filters/FilterControls';

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

    // En móvil el panel arranca plegado (bottom sheet) para que el mapa sea protagonista
    useEffect(() => {
        if (window.matchMedia('(max-width: 767px)').matches) {
            const id = requestAnimationFrame(() => setIsExpanded(false));
            return () => cancelAnimationFrame(id);
        }
    }, []);

    // Estados para el modal de búsqueda
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const modalInputRef = useRef<HTMLInputElement>(null);


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

    const activeFilters = [filters.tipo, filters.provincia, filters.naturaleza, filters.q].filter(Boolean).length;

    return (
        <>
        <div className={`absolute bottom-0 left-0 right-0 md:top-5 md:left-5 md:right-auto md:bottom-auto z-[1000] transition-transform duration-300 ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-76px)] md:translate-y-0'}`}>
            <div className="relative bg-white/95 backdrop-blur-xl border border-white/70 shadow-[0_20px_50px_-15px_rgba(34,57,69,0.35)] rounded-t-3xl md:rounded-3xl w-full md:w-[340px] overflow-hidden flex flex-col max-h-[70dvh] md:max-h-[calc(100dvh-7.5rem)]">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300 z-10" />

                {/* Asa de la bottom sheet (móvil) */}
                <span aria-hidden="true" className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-neutral-300 z-10" />

                {/* Cabecera: título + nº de centros visibles */}
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-expanded={isExpanded}
                    className="w-full px-5 pt-6 pb-4 flex items-center justify-between text-left"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#223945] to-blue-700 text-white flex items-center justify-center shadow-md shadow-[#223945]/25">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="!text-lg !font-extrabold !text-[#223945] !leading-tight">Explora el mapa</h2>
                            <p className="!text-xs !text-neutral-500 font-medium flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                                {loading ? 'Actualizando…' : `${formatNumber(centerCount)} ${centerCount === 1 ? 'centro' : 'centros'}`}
                            </p>
                        </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform ${isExpanded ? '' : 'rotate-180'}`} />
                </button>

                {/* Contenido */}
                <div className={`overflow-y-auto px-5 pb-5 space-y-4 ${isExpanded ? '' : 'hidden'}`}>
                    {/* Buscar un centro por nombre (abre el buscador tipo Spotlight) */}
                    <button
                        type="button"
                        onClick={openSearchModal}
                        className="w-full h-11 flex items-center gap-2.5 px-3.5 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-[#223945]/40 hover:bg-white transition-all text-left group"
                    >
                        <Search className="w-4 h-4 text-neutral-400 group-hover:text-[#223945] transition-colors shrink-0" />
                        <span className={`flex-1 truncate text-sm font-medium ${filters.q ? 'text-neutral-800' : 'text-neutral-400'}`}>
                            {filters.q ? titleCase(filters.q) : 'Buscar un centro…'}
                        </span>
                        {filters.q && (
                            <span
                                role="button"
                                aria-label="Quitar búsqueda"
                                onClick={(e) => { e.stopPropagation(); clearSearch(); }}
                                className="p-1 rounded-full text-neutral-400 hover:text-red-500 hover:bg-neutral-100 transition-all shrink-0"
                            >
                                <X className="w-3.5 h-3.5" />
                            </span>
                        )}
                    </button>

                    {/* Cerca de mí + radio */}
                    {userLocation ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between h-10 pl-3.5 pr-1.5 rounded-xl bg-[#223945] text-white">
                                <span className="flex items-center gap-2 text-sm font-bold">
                                    <Navigation className="w-4 h-4 fill-current" />
                                    Cerca de ti
                                </span>
                                <button onClick={onClearLocation} aria-label="Quitar ubicación" className="p-1.5 rounded-lg hover:bg-white/15 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-3 pl-3.5 pr-1.5 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200">
                                <span className="text-[11px] font-bold text-[#223945]/70 uppercase tracking-wider shrink-0">Radio</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={radius}
                                    onChange={(e) => setRadius(parseInt(e.target.value))}
                                    aria-label="Radio de búsqueda en kilómetros"
                                    className="custom-range-slider flex-1 min-w-0 h-1.5 rounded-full appearance-none cursor-pointer focus:outline-none"
                                    style={{ background: `linear-gradient(to right, #223945 ${radius}%, #e5e7eb ${radius}%)` }}
                                />
                                <span className="shrink-0 min-w-[4rem] text-center px-2 py-1 rounded-lg bg-white border border-neutral-200 text-[#223945] text-sm font-bold tabular-nums">
                                    {radius} km
                                </span>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={onLocateUser}
                            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#223945] via-[#2d4a5e] to-blue-600 text-white text-sm font-bold shadow-lg shadow-[#223945]/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
                        >
                            <Navigation className="w-4 h-4" />
                            Centros cerca de mí
                        </button>
                    )}

                    {/* ¿Qué quieres estudiar? */}
                    <div>
                        <p className="!text-[11px] !font-bold !text-[#223945]/80 uppercase tracking-wider mb-2 ml-0.5">¿Qué quieres estudiar?</p>
                        <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Tipo de enseñanza">
                            {TIPO_TILES.map(t => {
                                const active = filters.tipo === t.value;
                                const Icon = t.icon;
                                return (
                                    <button
                                        key={t.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        onClick={() => handleChange('tipo', active ? '' : t.value)}
                                        className={`flex flex-col items-center justify-center gap-1 min-h-[4.25rem] px-1 py-2 rounded-2xl border transition-all active:scale-95 ${
                                            active
                                                ? 'bg-gradient-to-br from-[#223945] to-blue-700 border-transparent text-white shadow-md shadow-[#223945]/25'
                                                : 'bg-white border-neutral-200 text-[#223945] hover:border-[#223945]/30'
                                        }`}
                                    >
                                        <Icon className={`w-[18px] h-[18px] ${active ? 'text-white' : 'text-blue-600'}`} />
                                        <span className="text-[10.5px] font-bold leading-[1.15] text-center">{t.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Provincia y titularidad */}
                    <div className="flex flex-wrap gap-2">
                        <PillSelect
                            label="Provincia"
                            value={filters.provincia || ''}
                            onChange={(v) => handleChange('provincia', v)}
                            options={provincias.map(p => ({ value: p, label: titleCase(p) }))}
                        />
                        <PillSelect
                            label="Titularidad"
                            value={filters.naturaleza || ''}
                            onChange={(v) => handleChange('naturaleza', v)}
                            options={[{ value: 'PÚBLICO', label: 'Público' }, { value: 'PRIVADO', label: 'Privado' }]}
                        />
                    </div>

                    {activeFilters > 0 && (
                        <button
                            type="button"
                            onClick={() => setFilters({})}
                            className="w-full flex items-center justify-center gap-1.5 pt-1 text-sm font-medium text-neutral-400 hover:text-red-500 transition-colors"
                        >
                            Limpiar {activeFilters} {activeFilters === 1 ? 'filtro' : 'filtros'}
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Modal de Búsqueda tipo Spotlight/Command Palette */}
        {showSearchModal && (
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
                </div>
            )}
        </>
    );
}
