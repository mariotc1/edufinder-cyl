'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Building2, BookOpen, GraduationCap, School } from 'lucide-react';
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
  });

  const [geolocationStatus, setGeolocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const provincias = ['AVILA', 'BURGOS', 'LEON', 'PALENCIA', 'SALAMANCA', 'SEGOVIA', 'SORIA', 'VALLADOLID', 'ZAMORA'];
  const tipos = ['FP', 'ESO', 'BACHILLERATO', 'PRIMARIA', 'INFANTIL', 'PARTICIPAS'];
  
  // TODO: Estas listas podrían venir del backend en un endpoint de "metadata" o "facets"
  const familiasFP = [
    'ADMINISTRACIÓN Y GESTIÓN', 'INFORMÁTICA Y COMUNICACIONES', 'SANIDAD', 'COMERCIO Y MARKETING', 
    'ELECTRICIDAD Y ELECTRÓNICA', 'HOTELERÍA Y TURISMO', 'SERVICIOS SOCIOCULTURALES Y A LA COMUNIDAD'
  ];

  useEffect(() => {
    // Debounce para la búsqueda de texto
    const timer = setTimeout(() => {
      onFilterChange(filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, onFilterChange]);

  const handleChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
          radio: 10 // Radio por defecto 10km, podría ser configurable
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
    setFilters(rest);
    setGeolocationStatus('idle');
    onFilterChange(rest);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 sm:p-8">
      <div className="space-y-6">
        
        {/* Row 1: Search & Geo */}
        <div className="flex flex-col md:flex-row gap-4">
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
          
          <div className="md:w-1/3 flex items-end">
            {geolocationStatus === 'success' ? (
              <button 
                onClick={clearGeolocation}
                className="btn-outline w-full flex items-center justify-center gap-2 text-primary-700 bg-primary-50 border-primary-200"
              >
                <MapPin className="w-4 h-4" />
                Ubicación activada (10km)
              </button>
            ) : (
              <button 
                onClick={handleGeolocation}
                disabled={geolocationStatus === 'loading'}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {geolocationStatus === 'loading' ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                Buscar cerca de mí
              </button>
            )}
          </div>
        </div>

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
              <option value="FP">Formación Profesional</option>
              {tipos.filter(t => t !== 'FP').map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Conditional Filters for FP */}
          {filters.tipo === 'FP' && (
            <>
              <div>
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

               <div>
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
            </>
          )}

          {/* Modalidad (Opcional, si hay espacio) */}
           <div>
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

        </div>
      </div>
    </div>
  );
}
