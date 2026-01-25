'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Building2, BookOpen, GraduationCap, School, SlidersHorizontal, Trash2 } from 'lucide-react';
import { FilterOptions } from '@/types';

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
  isLoading: boolean;
}

export default function FilterBar({ onFilterChange, isLoading }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    q: '',
    provincia: '',
    tipo: '',
    familia: '',
    nivel: '',
    modalidad: '',
    radio: 10, // Default 10km
  });

  const [geolocationStatus, setGeolocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const provincias = ['AVILA', 'BURGOS', 'LEON', 'PALENCIA', 'SALAMANCA', 'SEGOVIA', 'SORIA', 'VALLADOLID', 'ZAMORA'];
  
  // Opciones de tipo de enseñanza limpias y mapeadas al backend
  const tiposEnsenanza = [
    { value: 'FP', label: 'Formación Profesional' },
    { value: 'ESO', label: 'ESO / Bachillerato' },
    { value: 'PRIMARIA', label: 'Infantil y Primaria' },
    { value: 'ESPECIAL', label: 'Educación Especial' },
    // Eliminado: PARTICIPAS
  ];
  
  const familiasFP = [
    'ADMINISTRACIÓN Y GESTIÓN', 'INFORMÁTICA Y COMUNICACIONES', 'SANIDAD', 'COMERCIO Y MARKETING', 
    'ELECTRICIDAD Y ELECTRÓNICA', 'HOTELERÍA Y TURISMO', 'SERVICIOS SOCIOCULTURALES Y A LA COMUNIDAD',
    'TRANSPORTE Y MANTENIMIENTO DE VEHÍCULOS', 'INSTALACIÓN Y MANTENIMIENTO', 'ACTIVIDADES FÍSICAS Y DEPORTIVAS',
    'IMAGEN PERSONAL', 'AGRARIA', 'HOSTELERÍA Y TURISMO'
    // Se pueden añadir más según necesidad
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, onFilterChange]);

  const handleChange = (key: keyof FilterOptions, value: any) => {
    // Si cambia el tipo y deja de ser FP, limpiar filtros específicos de FP
    if (key === 'tipo' && value !== 'FP') {
       setFilters(prev => ({ 
         ...prev, 
         [key]: value,
         familia: '',
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
        const newFilters = { 
          ...filters, 
          lat: latitude, 
          lng: longitude, 
          radio: filters.radio || 10 
        };
        setFilters(newFilters);
        setGeolocationStatus('success');
        onFilterChange(newFilters);
      },
      (error) => {
        console.error(error);
        setGeolocationStatus('error');
        alert('No pudimos obtener tu ubicación.');
      }
    );
  };

  const clearGeolocation = () => {
    const { lat, lng, radio, ...rest } = filters;
    // Mantener radio en el estado local por si lo reactiva, pero quitar lat/lng
    setFilters({ ...rest, radio: 10 });
    setGeolocationStatus('idle');
    onFilterChange(rest);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 sm:p-8">
      <div className="space-y-6">
        
        {/* Row 1: Search, Geo & Radius */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-grow">
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
              <Search className="w-4 h-4 text-primary-600" />
              Buscar centro o ciclo
            </label>
            <input 
              type="text"
              placeholder="Ej: IES Galileo, Desarrollo de Aplicaciones..." 
              className="input w-full"
              value={filters.q || ''}
              onChange={(e) => handleChange('q', e.target.value)}
            />
          </div>
          
          <div className="lg:w-1/3 flex flex-col gap-2">
             {/* Geolocation Button */}
             <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 h-5 mb-2">
                 Ubicación
             </label>
             <div className="flex gap-2">
                {geolocationStatus === 'success' ? (
                  <button 
                    onClick={clearGeolocation}
                    className="btn-outline flex-grow flex items-center justify-center gap-2 text-red-600 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300"
                    title="Quitar ubicación"
                  >
                    <Trash2 className="w-4 h-4" />
                    Quitar ubicación
                  </button>
                ) : (
                  <button 
                    onClick={handleGeolocation}
                    disabled={geolocationStatus === 'loading'}
                    className="btn-primary flex-grow flex items-center justify-center gap-2"
                  >
                    {geolocationStatus === 'loading' ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                    Cerca de mí
                  </button>
                )}
             </div>
          </div>
        </div>

        {/* Radius Slider (Only visible if Geo active) */}
        {geolocationStatus === 'success' && (
            <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 animate-fadeIn">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-primary-900 flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4" />
                        Radio de búsqueda
                    </label>
                    <span className="text-sm font-bold text-primary-700 bg-white px-2 py-0.5 rounded shadow-sm border border-primary-100">
                        {filters.radio} km
                    </span>
                </div>
                <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    step="1"
                    value={filters.radio || 10}
                    onChange={(e) => handleChange('radio', Number(e.target.value))}
                    className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-primary-500 mt-1">
                    <span>1 km</span>
                    <span>100 km</span>
                </div>
            </div>
        )}

        <hr className="border-neutral-100" />

        {/* Row 2: Main Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Provincia */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Provincia</label>
            <select 
              className="select w-full"
              value={filters.provincia || ''}
              onChange={(e) => handleChange('provincia', e.target.value)}
            >
              <option value="">Todas</option>
              {provincias.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Tipo Enseñanza */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Tipo de Enseñanza</label>
            <select 
              className="select w-full"
              value={filters.tipo || ''}
              onChange={(e) => handleChange('tipo', e.target.value)}
            >
              <option value="">Todos</option>
              {tiposEnsenanza.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Conditional Filters for FP */}
          {filters.tipo === 'FP' && (
            <>
              <div className="animate-fadeIn">
                <label className="block text-xs font-medium text-neutral-500 mb-1">Familia Profesional</label>
                <select 
                  className="select w-full"
                  value={filters.familia || ''}
                  onChange={(e) => handleChange('familia', e.target.value)}
                >
                  <option value="">Todas</option>
                  {familiasFP.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

               <div className="animate-fadeIn">
                <label className="block text-xs font-medium text-neutral-500 mb-1">Nivel</label>
                <select 
                  className="select w-full"
                  value={filters.nivel || ''}
                  onChange={(e) => handleChange('nivel', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="BASICA">FP Básica</option>
                  <option value="GM">Grado Medio</option>
                  <option value="GS">Grado Superior</option>
                  <option value="CE">Curso de Especialización</option>
                </select>
              </div>

              {/* Modalidad - Solo visible si es FP */}
              <div className="animate-fadeIn">
                <label className="block text-xs font-medium text-neutral-500 mb-1">Modalidad</label>
                <select 
                  className="select w-full"
                  value={filters.modalidad || ''}
                  onChange={(e) => handleChange('modalidad', e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="DISTANCIA">Distancia</option>
                </select>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
