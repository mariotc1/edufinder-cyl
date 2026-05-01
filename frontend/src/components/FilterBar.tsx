'use client';

import { fetchCycleSuggestions, fetchCentroSuggestions, getSavedSearches, createSavedSearch, deleteSavedSearch, updateSavedSearch } from '@/services/api';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, MapPin, Building2, SlidersHorizontal, Trash2, X, Link2, Check, Bookmark, ChevronRight, RefreshCw } from 'lucide-react';
import { FilterOptions, SavedSearch } from '@/types';
import { useAuth } from '@/context/AuthContext';
import useSWR, { mutate } from 'swr';
import LocationSearchInput from './LocationSearchInput';

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
  isLoading: boolean;
  page?: number;
}

// COMPONENTE DE BARRA DE FILTROS AVANZADA
// Gestiona el estado de los filtros, autocompletado y geolocalización
export default function FilterBar({ onFilterChange, isLoading, page = 1 }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, openLoginModal } = useAuth();

  // Estado inicial de filtros: sincronizado con URL Params para persistencia
  const [filters, setFilters] = useState<FilterOptions>({
    q: searchParams.get('q') || '',
    provincia: searchParams.get('provincia') || '',
    tipo: searchParams.get('tipo') || '',
    naturaleza: searchParams.get('naturaleza') || '',
    familia: searchParams.get('familia') || '',
    ciclo: searchParams.get('ciclo') || '',
    nivel: searchParams.get('nivel') || '',
    modalidad: searchParams.get('modalidad') || '',
    radio: Number(searchParams.get('radio')) || 10,
    lat: searchParams.get('lat') ? Number(searchParams.get('lat')) : undefined,
    lng: searchParams.get('lng') ? Number(searchParams.get('lng')) : undefined,
    locationName: searchParams.get('locationName') || '',
  });

  const [geolocationStatus, setGeolocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isUsingMyLocation, setIsUsingMyLocation] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estado para búsquedas guardadas
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSavedDropdown, setShowSavedDropdown] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeSearch, setActiveSearch] = useState<SavedSearch | null>(null);
  const [mounted, setMounted] = useState(false);
  const savedDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar búsquedas guardadas solo si el usuario está autenticado
  const { data: savedSearches } = useSWR<SavedSearch[]>(
    user ? '/saved-searches' : null,
    getSavedSearches
  );
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const skipFetchRef = useRef(false);

  const [centroSuggestions, setCentroSuggestions] = useState<string[]>([]);
  const [showCentroSuggestions, setShowCentroSuggestions] = useState(false);
  const [isSearchingCentro, setIsSearchingCentro] = useState(false);
  const wrapperCentroRef = useRef<HTMLDivElement>(null);
  const skipFetchCentroRef = useRef(false);
  const prevFiltersRef = useRef(filters);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }

      if (wrapperCentroRef.current && !wrapperCentroRef.current.contains(event.target as Node)) {
        setShowCentroSuggestions(false);
      }

      if (savedDropdownRef.current && !savedDropdownRef.current.contains(event.target as Node)) {
        setShowSavedDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (skipFetchRef.current) {
        skipFetchRef.current = false;
        return;
    }

    const timer = setTimeout(async () => {
      if (filters.ciclo && filters.ciclo.length >= 2 && filters.tipo === 'FP') {
          setIsSearching(true);
          try {
              // Pasar los filtros actuales para mostrar solo ciclos que coincidan
              const results = await fetchCycleSuggestions(filters.ciclo, {
                nivel: filters.nivel,
                familia: filters.familia,
                modalidad: filters.modalidad,
              });
              setSuggestions(results);
              setShowSuggestions(true);

          } catch (error) {
              console.error("Error fetching suggestions", error);

          } finally {
              setIsSearching(false);
          }

      } else {
          setSuggestions([]);
          setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.ciclo, filters.tipo, filters.nivel, filters.familia, filters.modalidad]);

  useEffect(() => {
    if (skipFetchCentroRef.current) {
        skipFetchCentroRef.current = false;
        return;
    }

    // Debounce para búsqueda de centros por nombre (Autocomplete)
    const timer = setTimeout(async () => {
      if (filters.q && filters.q.length >= 2) {
          setIsSearchingCentro(true);

          try {
              // Pasar la provincia si está seleccionada para filtrar sugerencias
              const results = await fetchCentroSuggestions(filters.q, {
                provincia: filters.provincia,
              });
              setCentroSuggestions(results);
              setShowCentroSuggestions(true);

          } catch (error) {
              console.error("Error fetching centro suggestions", error);

          } finally {
              setIsSearchingCentro(false);
          }

      } else {
          setCentroSuggestions([]);
          setShowCentroSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.q, filters.provincia]);

  useEffect(() => {
    if (searchParams.get('lat') && searchParams.get('lng')) {
      // Si tiene locationName, es ubicación personalizada; si no, es "Mi ubicación"
      if (searchParams.get('locationName')) {
        setIsUsingMyLocation(false);
      } else {
        setIsUsingMyLocation(true);
      }
      setGeolocationStatus('success');
    }
  }, [searchParams]);

  useEffect(() => {
    // Efecto principal: Actualizar URL cuando cambian los filtros (con debounce de 400ms)
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.provincia) params.set('provincia', filters.provincia);
      if (filters.tipo) params.set('tipo', filters.tipo);
      if (filters.naturaleza) params.set('naturaleza', filters.naturaleza);
      if (filters.familia) params.set('familia', filters.familia);
      if (filters.ciclo) params.set('ciclo', filters.ciclo);
      if (filters.nivel) params.set('nivel', filters.nivel);
      if (filters.modalidad) params.set('modalidad', filters.modalidad);

      if (filters.lat && filters.lng) {
        params.set('lat', filters.lat.toString());
        params.set('lng', filters.lng.toString());
        params.set('radio', (filters.radio || 10).toString());
        if (filters.locationName) {
          params.set('locationName', filters.locationName);
        }
      }

      const filtersChanged = JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current);

      const pageInUrl = filtersChanged ? 1 : page;
      if (pageInUrl > 1) params.set('page', pageInUrl.toString());

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });

      if (filtersChanged) {
        onFilterChange(filters);
        prevFiltersRef.current = filters;
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [filters, pathname, router, onFilterChange, page]);

  const handleChange = (key: keyof FilterOptions, value: any) => {
    if (key === 'tipo' && value !== 'FP') {
       setFilters(prev => ({ 
         ...prev, 
         [key]: value,
         familia: '',
         ciclo: '',
         nivel: '',
         modalidad: ''
       }));
    } else {
       setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  // Handler para obtener ubicación del usuario (API Geolocation del navegador)
  const handleGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    setGeolocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFilters(prev => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          radio: prev.radio || 10,
          locationName: '', // Limpiar nombre de ubicación personalizada
        }));
        setGeolocationStatus('success');
        setIsUsingMyLocation(true);
      },
      (error) => {
        console.error(error);
        setGeolocationStatus('error');
        alert('No pudimos obtener tu ubicación.');
      }
    );
  }, []);

  // Handler para seleccionar ubicación personalizada
  const handleLocationSelect = useCallback((location: { lat: number; lng: number; name: string } | null) => {
    if (location) {
      setFilters(prev => ({
        ...prev,
        lat: location.lat,
        lng: location.lng,
        locationName: location.name,
        radio: prev.radio || 10,
      }));
      setGeolocationStatus('success');
      setIsUsingMyLocation(false);
    } else {
      // Limpiar ubicación
      setFilters(prev => {
        const { lat, lng, locationName, ...rest } = prev;
        return { ...rest, radio: 10 };
      });
      setGeolocationStatus('idle');
      setIsUsingMyLocation(false);
    }
  }, []);

  const clearGeolocation = useCallback(() => {
    setFilters(prev => {
        const { lat, lng, locationName, ...rest } = prev;
        return { ...rest, radio: 10 };
    });
    setGeolocationStatus('idle');
    setIsUsingMyLocation(false);
  }, []);

  const clearAll = () => {
      setFilters({
        radio: 10,
        naturaleza: ''
      });
      setGeolocationStatus('idle');
      setIsUsingMyLocation(false);
      setActiveSearch(null);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) return;

    setIsSaving(true);
    try {
      await createSavedSearch(searchName.trim(), filters);
      mutate('/saved-searches');
      setShowSaveModal(false);
      setSearchName('');
    } catch (err) {
      console.error('Error al guardar búsqueda:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplySavedSearch = (search: SavedSearch) => {
    setFilters({ ...search.filters, radio: search.filters.radio || 10 });
    if (search.filters.lat && search.filters.lng) {
      setGeolocationStatus('success');
    }
    setActiveSearch(search);
    setShowSavedDropdown(false);
  };

  const handleUpdateSavedSearch = async () => {
    if (!activeSearch) return;
    setIsUpdating(true);
    try {
      await updateSavedSearch(activeSearch.id, { filters });
      mutate('/saved-searches');
      setActiveSearch({ ...activeSearch, filters });
    } catch (err) {
      console.error('Error al actualizar búsqueda:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Compara los filtros actuales con la búsqueda activa para detectar cambios
  const hasChangesFromActive = (): boolean => {
    if (!activeSearch) return false;
    const activeFilters = activeSearch.filters;
    const keysToCompare: (keyof FilterOptions)[] = ['q', 'provincia', 'tipo', 'naturaleza', 'familia', 'ciclo', 'nivel', 'modalidad', 'lat', 'lng', 'radio'];

    for (const key of keysToCompare) {
      const current = filters[key];
      const active = activeFilters[key];
      // Normalizar valores vacíos
      const currentNorm = current === '' || current === undefined ? undefined : current;
      const activeNorm = active === '' || active === undefined ? undefined : active;
      if (currentNorm !== activeNorm) return true;
    }
    return false;
  };

  const filtersChanged = hasChangesFromActive();

  const handleDeleteSavedSearch = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteSavedSearch(id);
      mutate('/saved-searches');
    } catch (err) {
      console.error('Error al eliminar búsqueda:', err);
    }
  };

  const handleBookmarkClick = () => {
    if (!user) {
      openLoginModal();
      return;
    }
    if (savedSearches && savedSearches.length > 0) {
      setShowSavedDropdown(!showSavedDropdown);
    } else if (hasActiveFilters) {
      setShowSaveModal(true);
    }
  };

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

  const hasActiveFilters = Object.values(filters).some(val => val !== undefined && val !== '' && val !== 10) || geolocationStatus === 'success';
  
  const inputClasses = "w-full appearance-none bg-neutral-50 border border-neutral-200 text-neutral-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#223945]/20 focus:border-[#223945] transition-all font-medium text-sm hover:border-[#223945]/50 placeholder:text-neutral-400";
  const labelClasses = "text-[11px] font-bold text-[#223945] ml-1 uppercase tracking-wider mb-1 block opacity-80";

  return (
    <>
    <div className="relative z-30 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 transition-all hover:shadow-2xl">
       {/* Decorative top border/gradient - matching cards */}
       <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>

      <div className="flex flex-col gap-6 pt-2">
        
        {/* Top Row: Search & Location */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <div className="flex-1 md:flex-[1] relative group" ref={wrapperCentroRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-[#223945] transition-colors" />
            <input
              type="text"
              placeholder="Buscar centro..."
              className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#223945] focus:ring-4 focus:ring-[#223945]/10 transition-all outline-none font-medium placeholder:text-neutral-400 text-neutral-800 hover:border-[#223945]/50 text-sm"
              value={filters.q || ''}
              onChange={(e) => handleChange('q', e.target.value)}
              onFocus={() => { if(centroSuggestions.length > 0) setShowCentroSuggestions(true); }}
            />

            {/* Spinner / Clear Button */}
            {isSearchingCentro ? (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-[#223945]/30 border-t-[#223945] rounded-full animate-spin"></div>
                </div>
            ) : filters.q ? (
                <button
                    onClick={() => {
                        handleChange('q', '');
                        setCentroSuggestions([]);
                        setShowCentroSuggestions(false);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-400 hover:text-red-500 hover:bg-neutral-100 transition-all"
                    title="Borrar búsqueda"
                >
                    <X className="w-4 h-4" />
                </button>
            ) : null}

            {/* Premium Dropdown - Centro */}
            {showCentroSuggestions && centroSuggestions.length > 0 && (
                <div className="absolute z-[60] left-0 mt-2 w-[90vw] sm:w-[500px] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-neutral-100 ring-1 ring-black/5 max-h-[320px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 custom-scrollbar">
                    <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-neutral-50 px-4 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider z-10">
                        {filters.provincia ? `Centros en ${filters.provincia}` : 'Centros encontrados'}
                    </div>
                    <ul className="py-2">
                        {centroSuggestions.map((sug, i) => (
                            <li 
                                key={i}
                                onClick={() => {
                                    skipFetchCentroRef.current = true;
                                    handleChange('q', sug);
                                    setShowCentroSuggestions(false);
                                }}
                                className="px-4 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-neutral-50 hover:to-white transition-all flex items-start gap-3 group/item border-l-2 border-transparent hover:border-[#223945]"
                            >
                                <div className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-neutral-100 flex items-center justify-center group-hover/item:bg-[#223945] group-hover/item:text-white transition-all duration-300">
                                    <Building2 className="w-3 h-3 text-neutral-400 group-hover/item:text-white transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-neutral-700 group-hover/item:text-[#223945] leading-snug block break-words whitespace-normal">
                                        {sug}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
          
          {/* Buscador de ubicación + Botones */}
          <div className="w-full md:flex-[1] flex gap-2">
            {/* Buscador de ubicación inteligente */}
            <div className="flex-1">
              <LocationSearchInput
                onLocationSelect={handleLocationSelect}
                selectedLocation={
                  filters.lat && filters.lng && filters.locationName
                    ? { lat: filters.lat, lng: filters.lng, name: filters.locationName }
                    : null
                }
                onUseMyLocation={handleGeolocation}
                isUsingMyLocation={isUsingMyLocation && geolocationStatus === 'success'}
                isLoadingMyLocation={geolocationStatus === 'loading'}
              />
            </div>

            {/* Botón Búsquedas Guardadas */}
            <div className="relative flex-1 md:flex-initial" ref={savedDropdownRef}>
              <button
                onClick={handleBookmarkClick}
                className="w-full h-full px-4 py-3 rounded-xl transition-all border flex items-center justify-center gap-2 relative text-neutral-400 bg-neutral-50 border-neutral-200 hover:text-[#223945] hover:bg-[#223945]/5 hover:border-[#223945]/10"
                title="Búsquedas guardadas"
              >
                <Bookmark className="w-5 h-5" />
              </button>
              {/* Indicador de cambios pendientes - solo en cliente */}
              {mounted && activeSearch && filtersChanged && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white animate-pulse z-10" />
              )}

              {/* Dropdown de búsquedas guardadas - Fullscreen en móvil */}
              {showSavedDropdown && savedSearches && savedSearches.length > 0 && (
                <div className="fixed md:absolute inset-x-4 md:inset-x-auto md:right-0 md:left-auto top-auto mt-2 md:w-80 bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] border border-neutral-100 ring-1 ring-black/5 z-[60] animate-in fade-in zoom-in-95 duration-200">
                  <div className="bg-[#223945] px-4 py-4 flex items-center justify-between rounded-t-2xl">
                    <span className="text-sm font-bold text-white">Búsquedas guardadas</span>
                    <button
                      onClick={() => setShowSavedDropdown(false)}
                      className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all md:hidden"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Botón actualizar búsqueda activa si hay cambios */}
                  {activeSearch && filtersChanged && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUpdateSavedSearch(); }}
                      disabled={isUpdating}
                      className="w-full px-4 py-3 text-sm font-bold text-white bg-[#223945] hover:bg-[#1a2c35] transition-all border-b border-neutral-100 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Actualizar "{activeSearch.name}"
                    </button>
                  )}
                  {hasActiveFilters && (
                    <button
                      onClick={() => { setShowSavedDropdown(false); setShowSaveModal(true); }}
                      className="w-full px-4 py-3 text-sm font-bold text-[#223945] hover:bg-[#223945]/5 transition-all border-b border-neutral-100 flex items-center gap-2"
                    >
                      <Bookmark className="w-4 h-4" />
                      Guardar como nueva
                    </button>
                  )}
                  <ul className="py-2 max-h-[50vh] md:max-h-64 overflow-y-auto">
                    {savedSearches.map((search) => {
                      const isActive = activeSearch?.id === search.id;
                      return (
                        <li
                          key={search.id}
                          onClick={() => handleApplySavedSearch(search)}
                          className={`px-4 py-4 md:py-3 cursor-pointer hover:bg-neutral-50 active:bg-neutral-100 transition-all flex items-center justify-between group ${isActive ? 'bg-[#223945]/5 border-l-2 border-[#223945]' : ''}`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-lg ${isActive ? 'bg-[#223945] text-white' : 'bg-[#223945]/5'}`}>
                              <Bookmark className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#223945]'}`} />
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-sm font-medium ${isActive ? 'text-[#223945] font-bold' : 'text-neutral-700'}`}>{search.name}</span>
                              {isActive && <span className="text-[10px] text-[#223945]/60 font-medium">Activa</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleDeleteSavedSearch(search.id, e)}
                              className="p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Eliminar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Botones condicionales: Compartir y Limpiar */}
            {hasActiveFilters && (
              <>
                <button
                    onClick={handleShare}
                    className={`flex-1 md:flex-initial px-4 py-3 rounded-xl transition-all border flex items-center justify-center gap-2 font-bold ${
                      copied
                        ? 'text-green-600 bg-green-50 border-green-200'
                        : 'text-neutral-500 bg-neutral-50 border-neutral-200 hover:text-[#223945] hover:bg-[#223945]/5 hover:border-[#223945]/20'
                    }`}
                    title={copied ? "Enlace copiado" : "Copiar enlace de búsqueda"}
                >
                    {copied ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
                    <span className="hidden md:inline text-sm">{copied ? 'Copiado' : 'Copiar enlace'}</span>
                </button>
                <button
                    onClick={clearAll}
                    className="flex-1 md:flex-initial px-4 py-3 text-neutral-400 bg-neutral-50 border border-neutral-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all hover:border-red-100 flex items-center justify-center gap-2"
                    title="Limpiar filtros"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Radius Slider (Conditional) - Mostrar cuando hay ubicación activa */}
        {(geolocationStatus === 'success' || (filters.lat && filters.lng)) && (
             <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-xl border border-blue-100/50 flex flex-col sm:flex-row gap-4 items-center animate-in zoom-in-95 duration-200 shadow-inner">
                <div className="flex items-center gap-2 text-[#223945] min-w-[160px]">
                    <MapPin className="w-4 h-4" />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold">Radio: {filters.radio} km</span>
                        <span className="text-[10px] text-neutral-500 truncate max-w-[140px]">
                            {isUsingMyLocation ? 'Desde tu ubicación' : filters.locationName ? `Desde ${filters.locationName.split(',')[0]}` : ''}
                        </span>
                    </div>
                </div>
                <div className="flex-grow w-full px-2">
                    <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        step="1"
                        value={filters.radio || 10}
                        onChange={(e) => handleChange('radio', Number(e.target.value))}
                        className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#223945] hover:accent-[#1a2c35] focus:outline-none focus:ring-2 focus:ring-[#223945]/20"
                        style={{
                            backgroundImage: `linear-gradient(to right, #223945 0%, #223945 ${(filters.radio!/100)*100}%, #e5e5e5 ${(filters.radio!/100)*100}%, #e5e5e5 100%)`
                        }}
                    />
                     <div className="flex justify-between text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-wider">
                        <span>1 km</span>
                        <span>50 km</span>
                        <span>100 km</span>
                    </div>
                </div>
            </div>
        )}

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="space-y-1">
            <label className={labelClasses}>Provincia</label>
            <div className="relative">
                <select 
                className={inputClasses}
                value={filters.provincia || ''}
                onChange={(e) => handleChange('provincia', e.target.value)}
                aria-label="Seleccionar provincia"
                >
                <option value="">Todas las provincias</option>
                {provincias.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#223945]">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClasses}>Tipo</label>
            <div className="relative">
                <select
                className={inputClasses}
                value={filters.tipo || ''}
                onChange={(e) => handleChange('tipo', e.target.value)}
                aria-label="Seleccionar tipo de enseñanza"
                >
                <option value="">Todos los tipos</option>
                {tiposEnsenanza.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#223945]">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClasses}>Titularidad</label>
            <div className="relative">
                <select
                className={inputClasses}
                value={filters.naturaleza || ''}
                onChange={(e) => handleChange('naturaleza', e.target.value)}
                aria-label="Seleccionar titularidad del centro"
                >
                <option value="">Todos</option>
                <option value="PÚBLICO">Público</option>
                <option value="PRIVADO">Privado</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#223945]">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>
          </div>

        </div>

        {/* FP Conditional Filters - Dedicated Row */}
          {filters.tipo === 'FP' && (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-neutral-100 animate-in slide-in-from-top-2 fade-in duration-300">
               {/* Ciclo Name Search - Autocomplete */}
                <div className="space-y-1" ref={wrapperRef}>
                 <label className={labelClasses}>Nombre del Ciclo</label>
                  <div className="relative group">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#223945] transition-colors" />
                     <input 
                       type="text"
                       placeholder="Ej: Desarrollo Web" 
                       className={`w-full bg-neutral-50 border border-neutral-200 text-neutral-700 py-3 pl-10 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#223945]/20 focus:border-[#223945] transition-all font-medium text-sm hover:border-[#223945]/50 placeholder:text-neutral-400`}
                       value={filters.ciclo || ''}
                       onChange={(e) => handleChange('ciclo', e.target.value)}
                       onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
                     />
                     
                     {/* Loading Spinner */}
                     {isSearching ? (
                         <div className="absolute right-3 top-1/2 -translate-y-1/2">
                             <div className="w-4 h-4 border-2 border-[#223945]/30 border-t-[#223945] rounded-full animate-spin"></div>
                         </div>
                     ) : filters.ciclo ? (
                        // Clear Button (X)
                        <button
                            onClick={() => {
                                handleChange('ciclo', '');
                                setSuggestions([]);
                                setShowSuggestions(false);
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-400 hover:text-red-500 hover:bg-neutral-100 transition-all"
                            title="Borrar búsqueda"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                     ) : null}
 
                     {/* Premium Dropdown */}
                     {showSuggestions && suggestions.length > 0 && (
                         <div className="absolute z-50 left-0 mt-2 w-[90vw] sm:w-[500px] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-neutral-100 ring-1 ring-black/5 max-h-[320px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 custom-scrollbar">
                             <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-neutral-50 px-4 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider z-10">
                                 Sugerencias encontradas
                             </div>
                             <ul className="py-2">
                                 {suggestions.map((sug, i) => (
                                     <li 
                                         key={i}
                                         onClick={() => {
                                             skipFetchRef.current = true; 
                                             handleChange('ciclo', sug);
                                             setShowSuggestions(false);
                                         }}
                                         className="px-4 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-neutral-50 hover:to-white transition-all flex items-start gap-3 group/item border-l-2 border-transparent hover:border-[#223945]"
                                     >
                                         <div className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-neutral-100 flex items-center justify-center group-hover/item:bg-[#223945] group-hover/item:text-white transition-all duration-300">
                                             <Search className="w-3 h-3 text-neutral-400 group-hover/item:text-white transition-colors" />
                                         </div>
                                         <div className="flex-1 min-w-0">
                                             <span className="text-sm font-medium text-neutral-700 group-hover/item:text-[#223945] leading-snug block break-words whitespace-normal">
                                                 {sug}
                                             </span>
                                         </div>
                                     </li>
                                 ))}
                             </ul>
                         </div>
                     )}
                 </div>
               </div>

               <div className="space-y-1">
                <label className={labelClasses}>Familia</label>
                 <div className="relative">
                    <select 
                    className={inputClasses}
                    value={filters.familia || ''}
                    onChange={(e) => handleChange('familia', e.target.value)}
                    aria-label="Seleccionar familia profesional"
                    >
                    <option value="">Todas</option>
                    {familiasFP.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#223945]">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
              </div>

               <div className="space-y-1">
                <label className={labelClasses}>Nivel</label>
                <div className="relative">
                    <select 
                    className={inputClasses}
                    value={filters.nivel || ''}
                    onChange={(e) => handleChange('nivel', e.target.value)}
                    aria-label="Seleccionar nivel educativo"
                    >
                    <option value="">Todos</option>
                    <option value="BASICA">FP Básica</option>
                    <option value="GM">Grado Medio</option>
                    <option value="GS">Grado Superior</option>
                    <option value="CE">Curso de Especialización</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#223945]">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
              </div>

              <div className="space-y-1">
                 <label className={labelClasses}>Modalidad</label>
                 <div className="relative">
                    <select 
                    className={inputClasses}
                    value={filters.modalidad || ''}
                    onChange={(e) => handleChange('modalidad', e.target.value)}
                    aria-label="Seleccionar modalidad"
                    >
                    <option value="">Todas</option>
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="DISTANCIA">Distancia</option>
                    </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#223945]">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
              </div>
            </div>
          )}

      </div>

    </div>

      {/* Modal para guardar búsqueda - Portal para fullscreen real */}
      {showSaveModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999]">
          {/* Backdrop con blur fullscreen */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowSaveModal(false)}
          />

          {/* Contenedor centrado */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all animate-in zoom-in-95 fade-in duration-300 ring-1 ring-black/5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setShowSaveModal(false)}
                className="absolute right-4 top-4 z-20 p-2 rounded-full bg-white/20 text-white hover:text-white hover:bg-white/30 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header con color */}
              <div className="bg-[#223945] px-6 pt-10 pb-6 rounded-t-3xl text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <Bookmark className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold !text-white">Guardar búsqueda</h3>
                <p className="text-sm !text-white mt-2">Dale un nombre para acceder rápidamente a estos filtros</p>
              </div>

              {/* Contenido */}
              <div className="p-6">
                <label className="text-xs font-bold text-[#223945] uppercase tracking-wider mb-2 block">
                  Nombre de la búsqueda
                </label>
                <input
                  type="text"
                  placeholder="Ej: FP Informática Valladolid"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveSearch()}
                  className="w-full px-4 py-3.5 rounded-xl bg-neutral-50 border-2 border-neutral-200 focus:border-[#223945] focus:ring-4 focus:ring-[#223945]/10 outline-none transition-all text-sm font-medium"
                  autoFocus
                />
              </div>

              {/* Acciones */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-4 py-3 text-sm font-bold text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 rounded-xl transition-all border border-neutral-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveSearch}
                  disabled={!searchName.trim() || isSaving}
                  className="flex-1 px-6 py-3 bg-[#223945] text-white rounded-xl text-sm font-bold hover:bg-[#1a2c35] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/30 hover:-translate-y-0.5"
                >
                  {isSaving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}</>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}