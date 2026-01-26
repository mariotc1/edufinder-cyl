'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Building2, ChevronLeft, ChevronRight, School, BookOpen } from 'lucide-react';
import { searchCentros } from '@/services/api';
import { FilterOptions, Centro } from '@/types';
import FilterBar from '@/components/FilterBar';
import CentroCard from '@/components/CentroCard';

import { Suspense } from 'react';

function SearchContent() {
  const searchParams = useSearchParams();
  
  // Initialize state from URL params to avoid double-fetch on load
  const [filters, setFilters] = useState<FilterOptions>({
    q: searchParams.get('q') || '',
    provincia: searchParams.get('provincia') || '',
    tipo: searchParams.get('tipo') || '',
    familia: searchParams.get('familia') || '',
    nivel: searchParams.get('nivel') || '',
    modalidad: searchParams.get('modalidad') || '',
    radio: searchParams.get('radio') ? Number(searchParams.get('radio')) : undefined,
    lat: searchParams.get('lat') ? Number(searchParams.get('lat')) : undefined,
    lng: searchParams.get('lng') ? Number(searchParams.get('lng')) : undefined,
  });

  const [page, setPage] = useState(1);

  // SWR key changes when filters or page change
  const swrKey = JSON.stringify({ ...filters, page });

  const { data, error, isLoading } = useSWR(swrKey, () => searchCentros({ ...filters, page }), {
    keepPreviousData: true,
    revalidateOnFocus: false
  });
  
  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    setPage(1); 
  }, []);



  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-4 font-heading tracking-tight">
              EduFinder <span className="text-primary-600">CYL</span>
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto">
              Descubre tu futuro académico. Encuentra el centro ideal en Castilla y León con nuestra búsqueda inteligente.
            </p>
          </div>

          {/* Filter Bar Component */}
          <div className="max-w-5xl mx-auto">
            <FilterBar onFilterChange={handleFilterChange} isLoading={isLoading} />
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="flex-grow px-4 sm:px-6 lg:px-8 py-12 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <School className="text-primary-600 w-7 h-7" />
              Resultados
            </h2>
            {data && (
              <span className="text-sm font-medium text-neutral-500 bg-white px-3 py-1 rounded-full border border-neutral-200 shadow-sm">
                {data.total} Centros encontrados
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
              <p className="text-neutral-600 font-medium">Buscando los mejores centros...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-xl border border-red-100 shadow-sm">
              <p className="text-red-500 font-medium text-lg">Ocurrió un error al cargar los datos.</p>
              <p className="text-neutral-500 text-sm mt-1">Por favor, intenta modificar tus filtros.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.data?.map((centro: Centro) => (
                  <CentroCard key={centro.id} centro={centro} />
                ))}
              </div>

              {/* Pagination */}
              {data?.links && (data.prev_page_url || data.next_page_url) && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <button 
                    disabled={!data.prev_page_url}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-neutral-300 text-neutral-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 hover:border-primary-500 hover:text-primary-700 transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                  
                  <span className="px-4 py-2 bg-primary-50 text-primary-800 font-bold rounded-lg text-sm">
                     Página {data.current_page}
                  </span>
                  
                  <button 
                    disabled={!data.next_page_url}
                    onClick={() => setPage(p => p + 1)}
                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-neutral-300 text-neutral-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 hover:border-primary-500 hover:text-primary-700 transition-all shadow-sm"
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
    </>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
        </div>
      }>
        <SearchContent />
      </Suspense>
    </div>
  );
}
