'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Building2, ChevronLeft, ChevronRight, School, BookOpen, ArrowRight } from 'lucide-react';
import { searchCentros } from '@/services/api';
import { FilterOptions, Centro } from '@/types';
import FilterBar from '@/components/FilterBar';
import CentroCard from '@/components/CentroCard';

import { Suspense } from 'react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-gradient">
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

  // Fetch Favorites to check status
  // We use the same key as the favorites page so it shares cache
  const { data: favoritesData } = useSWR('/favoritos', async (url) => {
    // Small inline fetcher or import logic. Importing to keep it clean would be better but inline is ok here.
    // We import 'api' if we need it, but current file imports 'searchCentros'.
    // I'll need to use api instance.
    // Let's rely on standard fetch or import api.
    // Actually 'searchCentros' is from api.ts, which uses axios instance. 
    // I'll import 'api' from lib/axios to be safe or add getFavorites to api.ts.
    // Since I can't easily edit api.ts and page.tsx at same time cleanly without failure risk,
    // I'll assume I can import default api from lib/axios. 
    // Wait, 'api' is not imported in page.tsx. I need to add it.
    // OR I can use a simpler approach: define fetcher in page.tsx or import it?
    // For now I'll just use a try/catch with the imported searchCentros... no that's wrong.
    // I will add 'import api from "@/lib/axios"' to top of file
    return (await import('@/lib/axios')).default.get(url).then(res => res.data);
  }, {
    shouldRetryOnError: false, // If 401 (not logged in), don't retry loop
    errorRetryCount: 0
  });

  const favoriteIds = new Set(
    Array.isArray(favoritesData)
      ? favoritesData.map((f: any) => f.centro.id)
      : (favoritesData?.data ? favoritesData.data.map((f: any) => f.centro.id) : [])
  );

  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    setPage(1);
  }, []);



  return (
    <>
      {/* Hero Section - Backgrounds removed to let page gradient show */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111827] mb-4 font-heading tracking-tight">
              Excelencia educativa <span className="text-[#223945] block md:inline">a tu alcance</span>
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Encuentra el centro ideal en <span className="font-semibold text-[#223945]">Castilla y León</span> con nuestra búsqueda inteligente.
            </p>
          </div>

          {/* Filter Bar Component */}
          <div className="max-w-5xl mx-auto">
            <FilterBar onFilterChange={handleFilterChange} isLoading={isLoading} />
          </div>
        </div>
      </section>

      {/* Results Section - Backgrounds removed */}
      <section className="flex-grow px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <School className="text-primary-600 w-7 h-7" />
              Resultados
            </h2>
            {data && (
              <span className="text-xs sm:text-sm font-bold text-white bg-[#223945] px-3 py-1 rounded-full shadow-sm">
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
                {data?.data?.map((centro: Centro, index: number) => (
                  <CentroCard
                    key={centro.id}
                    centro={centro}
                    index={index}
                    initialIsFavorite={favoriteIds.has(centro.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {/* Enhanced Pagination */}
              {data?.last_page > 1 && (
                <div className="flex flex-col items-center gap-4 mt-12 pb-8">
                  <div className="flex items-center gap-2 bg-white p-2 rounded-full shadow-lg border border-neutral-100">
                    {/* Previous Button */}
                    <button
                      disabled={data.current_page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="p-2.5 rounded-full hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-[#223945]"
                      title="Página anterior"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center px-2 gap-1 sm:gap-2">
                      {(() => {
                        const current = data.current_page;
                        const total = data.last_page;
                        const pages = [];

                        // Logica para mostrar paginas: 1 ... 4 5 6 ... 20
                        if (total <= 7) {
                          for (let i = 1; i <= total; i++) pages.push(i);
                        } else {
                          if (current <= 4) {
                            pages.push(1, 2, 3, 4, 5, '...', total);
                          } else if (current >= total - 3) {
                            pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
                          } else {
                            pages.push(1, '...', current - 1, current, current + 1, '...', total);
                          }
                        }

                        return pages.map((p, idx) => (
                          p === '...' ? (
                            <span key={`dots-${idx}`} className="text-neutral-400 font-bold px-1 select-none">...</span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setPage(p as number)}
                              className={`
                                            w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all
                                            ${current === p
                                  ? 'bg-[#223945] text-white shadow-md scale-110'
                                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-[#223945]'
                                }
                                        `}
                            >
                              {p}
                            </button>
                          )
                        ));
                      })()}
                    </div>

                    {/* Next Button */}
                    <button
                      disabled={data.current_page === data.last_page}
                      onClick={() => setPage(p => Math.min(data.last_page, p + 1))}
                      className="p-2.5 rounded-full hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-[#223945]"
                      title="Página siguiente"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-sm font-medium text-neutral-500">
                    <span className="hidden sm:inline">
                      Página <span className="font-bold text-[#223945]">{data.current_page}</span> de <span className="font-bold text-[#223945]">{data.last_page}</span>
                    </span>

                    <span className="hidden sm:block w-px h-4 bg-neutral-300"></span>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const input = form.elements.namedItem('pageInput') as HTMLInputElement;
                        const val = parseInt(input.value);
                        if (!isNaN(val) && val >= 1 && val <= data.last_page) {
                          setPage(val);
                          input.value = '';
                          input.blur();
                        }
                      }}
                      className="flex items-center relative group"
                    >
                      <input
                        name="pageInput"
                        type="number"
                        min="1"
                        max={data.last_page}
                        placeholder="Ir a..."
                        className="w-20 pl-3 pr-8 py-1.5 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-[#223945] placeholder:text-neutral-400 focus:ring-2 focus:ring-[#223945]/10 focus:border-[#223945] outline-none transition-all shadow-sm hover:border-neutral-300"
                      />
                      <button
                        type="submit"
                        className="absolute right-1.5 p-1 rounded-md text-neutral-400 hover:text-[#223945] hover:bg-neutral-100 transition-colors"
                        title="Ir"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

