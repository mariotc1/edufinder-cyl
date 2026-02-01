'use client';

import { fetchCycleSuggestions } from '@/services/api';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, MapPin, Building2, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { FilterOptions } from '@/types';

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
  isLoading: boolean;
}

export default function FilterBar({ onFilterChange, isLoading }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Inicializar estado desde URL
  const [filters, setFilters] = useState<FilterOptions>({
    q: searchParams.get('q') || '',
    provincia: searchParams.get('provincia') || '',
    tipo: searchParams.get('tipo') || '',
    familia: searchParams.get('familia') || '',
    ciclo: searchParams.get('ciclo') || '',
    nivel: searchParams.get('nivel') || '',
    modalidad: searchParams.get('modalidad') || '',
    radio: Number(searchParams.get('radio')) || 10,
    lat: searchParams.get('lat') ? Number(searchParams.get('lat')) : undefined,
    lng: searchParams.get('lng') ? Number(searchParams.get('lng')) : undefined,
  });

  const [geolocationStatus, setGeolocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // Autocomplete States
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const skipFetchRef = useRef(false);

  // Click Outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Suggestions Logic
  useEffect(() => {
    // If we just selected an item, skip the fetch that would triggered by the value change
    if (skipFetchRef.current) {
        skipFetchRef.current = false;
        return;
    }

    const timer = setTimeout(async () => {
      if (filters.ciclo && filters.ciclo.length >= 2 && filters.tipo === 'FP') {
          setIsSearching(true);
          try {
              const results = await fetchCycleSuggestions(filters.ciclo);
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
  }, [filters.ciclo, filters.tipo]);

  // Recuperar estado geo si hay coordenadas en URL
  useEffect(() => {
    if (searchParams.get('lat') && searchParams.get('lng')) {
      setGeolocationStatus('success');
    }
  }, [searchParams]);

  // Sincronizar URL cuando cambian los filtros (con debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.provincia) params.set('provincia', filters.provincia);
      if (filters.tipo) params.set('tipo', filters.tipo);
      if (filters.familia) params.set('familia', filters.familia);
      if (filters.ciclo) params.set('ciclo', filters.ciclo);
      if (filters.nivel) params.set('nivel', filters.nivel);
      if (filters.modalidad) params.set('modalidad', filters.modalidad);
      
      if (filters.lat && filters.lng) {
        params.set('lat', filters.lat.toString());
        params.set('lng', filters.lng.toString());
        params.set('radio', (filters.radio || 10).toString());
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      onFilterChange(filters);
    }, 400);

    return () => clearTimeout(timer);
  }, [filters, pathname, router, onFilterChange]);

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

  const handleGeolocation = () => {
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
          radio: prev.radio || 10 
        }));
        setGeolocationStatus('success');
      },
      (error) => {
        console.error(error);
        setGeolocationStatus('error');
        alert('No pudimos obtener tu ubicación.');
      }
    );
  };

  const clearGeolocation = () => {
    setFilters(prev => {
        const { lat, lng, ...rest } = prev;
        return rest;
    });
    setGeolocationStatus('idle');
  };

  const clearAll = () => {
      setFilters({
        radio: 10
      });
      setGeolocationStatus('idle');
  };

  // Data Selectors
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
  
  // Clases comunes para inputs y selects
  const inputClasses = "w-full appearance-none bg-neutral-50 border border-neutral-200 text-neutral-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#223945]/20 focus:border-[#223945] transition-all font-medium text-sm hover:border-[#223945]/50 placeholder:text-neutral-400";
  const labelClasses = "text-[11px] font-bold text-[#223945] ml-1 uppercase tracking-wider mb-1 block opacity-80";

  return (
    <div className="relative z-30 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 transition-all hover:shadow-2xl">
       {/* Decorative top border/gradient - matching cards */}
       <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>

      <div className="flex flex-col gap-6 pt-2">
        
        {/* Top Row: Search & Location */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <div className="flex-grow relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-[#223945] transition-colors" />
            <input 
              type="text"
              placeholder="Buscar por nombre, localidad..." 
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#223945] focus:ring-4 focus:ring-[#223945]/10 transition-all outline-none font-medium placeholder:text-neutral-400 text-neutral-800 hover:border-[#223945]/50"
              value={filters.q || ''}
              onChange={(e) => handleChange('q', e.target.value)}
            />
          </div>
          
          <div className="flex-shrink-0 flex gap-2">
            {geolocationStatus === 'success' ? (
               <div className="flex items-center gap-2 bg-[#223945]/10 text-[#223945] px-4 py-2 rounded-xl border border-[#223945]/20 animate-in fade-in slide-in-from-bottom-2">
                 <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-bold">Cerca de mí</span>
                 </div>
                 <div className="h-4 w-px bg-[#223945]/20 mx-1"></div>
                 <button 
                   onClick={clearGeolocation} 
                   className="p-1 hover:bg-white rounded-full transition-colors text-[#223945]/60 hover:text-red-500"
                   title="Desactivar ubicación"
                 >
                   <X className="w-4 h-4" />
                 </button>
               </div>
            ) : (
              <button 
                onClick={handleGeolocation}
                disabled={geolocationStatus === 'loading'}
                className="bg-[#223945] text-white px-6 py-3.5 rounded-xl shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all active:translate-y-0 flex items-center gap-2 whitespace-nowrap font-bold text-sm"
              >
                {geolocationStatus === 'loading' ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                <span>Cerca de mí</span>
              </button>
            )}

            {/* Clear All Button */}
            {hasActiveFilters && (
                <button 
                    onClick={clearAll}
                    className="p-3.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                    title="Limpiar filtros"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            )}
          </div>
        </div>

        {/* Radius Slider (Conditional) */}
        {geolocationStatus === 'success' && (
             <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-xl border border-blue-100/50 flex flex-col sm:flex-row gap-4 items-center animate-in zoom-in-95 duration-200 shadow-inner">
                <div className="flex items-center gap-2 text-[#223945] min-w-[140px]">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="text-sm font-bold">Radio: {filters.radio} km</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="space-y-1">
            <label className={labelClasses}>Provincia</label>
            <div className="relative">
                <select 
                className={inputClasses}
                value={filters.provincia || ''}
                onChange={(e) => handleChange('provincia', e.target.value)}
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
                >
                <option value="">Todos los tipos</option>
                {tiposEnsenanza.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
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
                                             skipFetchRef.current = true; // Prevent re-open
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
  );
}

// Added simplified ChevronDown component since it was missing in imports but used in replacement
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
