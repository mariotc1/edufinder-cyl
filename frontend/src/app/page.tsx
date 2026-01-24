'use client';

import { useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/axios';
import Link from 'next/link';
import { Search, MapPin, Building2, ChevronLeft, ChevronRight } from 'lucide-react';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function Home() {
  const [search, setSearch] = useState('');
  const [provincia, setProvincia] = useState('');
  const [naturaleza, setNaturaleza] = useState('');
  const [page, setPage] = useState(1);

  const { data, error, isLoading } = useSWR(`/centros?page=${page}&q=${search}&provincia=${provincia}&naturaleza=${naturaleza}`, fetcher);

  const provincias = ['AVILA', 'BURGOS', 'LEON', 'PALENCIA', 'SALAMANCA', 'SEGOVIA', 'SORIA', 'VALLADOLID', 'ZAMORA'];
  
  // Badge color based on naturaleza
  const getNaturalezaBadge = (naturaleza: string) => {
    switch (naturaleza?.toUpperCase()) {
      case 'PÚBLICO':
        return 'bg-primary-100 text-primary-800 border border-primary-200';
      case 'PRIVADO':
        return 'bg-secondary-100 text-secondary-800 border border-secondary-200';
      case 'CONCERTADO':
        return 'bg-success-100 text-success-700 border border-success-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border border-neutral-200';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-4">
              Encuentra tu centro educativo
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 max-w-3xl mx-auto">
              Explora centros de primaria, secundaria, bachillerato y ciclos de Formación Profesional en Castilla y León
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 sm:p-8">
              <div className="space-y-5">
                {/* Search Input */}
                <div>
                  <label htmlFor="search" className="block text-sm font-semibold text-neutral-700 mb-2">
                    Buscar centro educativo
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input 
                      id="search"
                      type="text"
                      placeholder="Nombre del centro, localidad..." 
                      className="input pl-12"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="provincia" className="block text-sm font-semibold text-neutral-700 mb-2">
                      Provincia
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5 pointer-events-none" />
                      <select 
                        id="provincia"
                        className="select pl-12"
                        value={provincia}
                        onChange={(e) => setProvincia(e.target.value)}
                      >
                        <option value="">Todas las provincias</option>
                        {provincias.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="naturaleza" className="block text-sm font-semibold text-neutral-700 mb-2">
                      Tipo de centro
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5 pointer-events-none" />
                      <select 
                        id="naturaleza"
                        className="select pl-12"
                        value={naturaleza}
                        onChange={(e) => setNaturaleza(e.target.value)}
                      >
                        <option value="">Todos los tipos</option>
                        <option value="PÚBLICO">Público</option>
                        <option value="PRIVADO">Privado</option>
                        <option value="CONCERTADO">Concertado</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="flex-grow px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <Building2 className="text-primary-600 w-7 h-7" />
              Centros Educativos
            </h2>
            {data?.data && (
              <p className="text-sm text-neutral-600">
                {data.data.length > 0 ? `Mostrando ${data.data.length} resultados` : 'Sin resultados'}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
              <p className="text-neutral-600">Cargando centros educativos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 font-medium">Error al cargar los datos</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.data?.map((centro: any) => (
                  <div 
                    key={centro.id} 
                    className="card p-6 hover:shadow-lg transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={`badge ${getNaturalezaBadge(centro.naturaleza)}`}>
                        {centro.naturaleza || 'Sin especificar'}
                      </span>
                      <span className="text-xs font-medium text-neutral-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {centro.provincia}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary-700 transition-colors line-clamp-2">
                      {centro.nombre}
                    </h3>
                    
                    <p className="text-sm text-neutral-600 mb-1">
                      {centro.localidad}
                    </p>
                    <p className="text-xs text-neutral-500 mb-4">
                      {centro.denominacion_generica}
                    </p>
                    
                    <Link 
                      href={`/centro/${centro.id}`} 
                      className="btn-outline w-full text-center block"
                    >
                      Ver información completa
                    </Link>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {data?.data?.length > 0 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-neutral-300 text-neutral-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 hover:border-primary-500 hover:text-primary-700 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                  
                  <span className="px-4 py-2 bg-primary-100 text-primary-800 font-semibold rounded-lg">
                    Página {page}
                  </span>
                  
                  <button 
                    disabled={!data?.links?.next}
                    onClick={() => setPage(p => p + 1)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-neutral-300 text-neutral-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 hover:border-primary-500 hover:text-primary-700 transition-all"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
