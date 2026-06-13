'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import PullToRefreshIndicator from '@/components/PullToRefreshIndicator';
import { useSearchParams } from 'next/navigation';
import { School, ChevronLeft, ChevronRight, ArrowRight, Compass } from 'lucide-react';
import Link from 'next/link';
import { searchCentros } from '@/services/api';
import { FilterOptions, Centro } from '@/types';
import FilterBar from '@/components/FilterBar';
import CentroCard from '@/components/CentroCard';
import CentroCardSkeleton from '@/components/CentroCardSkeleton';
import VisitedCentersSection from '@/components/VisitedCentersSection';
import RecommendationsSection from '@/components/recommendations/RecommendationsSection';
import AIWizardModal from '@/components/ai-wizard/AIWizardModal';
import { motion } from 'framer-motion';

// ─── Session persistence helpers ────────────────────────────────────────────
// Stores search state across SPA navigations (BottomNav, internal links).
// URL params always take priority (bookmarks / shared links).
const SESSION_KEY = 'home-search-state';

type SessionState = { filters: FilterOptions; page: number; scrollY: number };

function saveSession(partial: Partial<SessionState>) {
  try {
    const prev: Partial<SessionState> = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...prev, ...partial }));
  } catch {}
}

function readSession(): SessionState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
// ────────────────────────────────────────────────────────────────────────────

export default function SearchContent() {
  const searchParams = useSearchParams();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const scrollRestored = useRef(false);

  // Collect URL params — these take priority over session state
  const urlFilters: FilterOptions = {
    q: searchParams.get('q') || '',
    provincia: searchParams.get('provincia') || '',
    tipo: searchParams.get('tipo') || '',
    naturaleza: searchParams.get('naturaleza') || '',
    familia: searchParams.get('familia') || '',
    ciclo: searchParams.get('ciclo') || '',
    nivel: searchParams.get('nivel') || '',
    modalidad: searchParams.get('modalidad') || '',
    radio: searchParams.get('radio') ? Number(searchParams.get('radio')) : undefined,
    lat: searchParams.get('lat') ? Number(searchParams.get('lat')) : undefined,
    lng: searchParams.get('lng') ? Number(searchParams.get('lng')) : undefined,
  };
  const urlPage = searchParams.get('page') ? Number(searchParams.get('page')) : null;
  const hasUrlParams =
    Object.values(urlFilters).some(v => v !== '' && v !== undefined) || urlPage !== null;

  // Initialize from URL params (priority) → sessionStorage (fallback) → defaults
  const [filters, setFilters] = useState<FilterOptions>(() => {
    if (hasUrlParams) return urlFilters;
    return readSession()?.filters ?? urlFilters;
  });

  const [page, setPage] = useState<number>(() => {
    if (urlPage !== null) return urlPage;
    return readSession()?.page ?? 1;
  });

  // Persist filters + page to sessionStorage on every change
  useEffect(() => {
    saveSession({ filters, page });
  }, [filters, page]);

  // Save exact scroll position when navigating away (component unmounts)
  useEffect(() => {
    return () => {
      saveSession({ scrollY: window.scrollY });
    };
  }, []);

  const swrKey = JSON.stringify({ ...filters, page });

  const { data, error, isLoading, mutate } = useSWR(swrKey, () => searchCentros({ ...filters, page }), {
    keepPreviousData: true,
    revalidateOnFocus: false
  });

  const handlePullRefresh = useCallback(async () => {
    // undefined first → clears cached data so isLoading goes true → skeletons show
    await mutate(undefined, { revalidate: true });
  }, [mutate]);
  const { pullDistance, isRefreshing, isPulling } = usePullToRefresh({ onRefresh: handlePullRefresh });

  // Restore scroll position after the first data load on this mount
  useEffect(() => {
    if (!isLoading && data && !scrollRestored.current) {
      const saved = readSession();
      if (saved?.scrollY && saved.scrollY > 100) {
        scrollRestored.current = true;
        requestAnimationFrame(() => {
          window.scrollTo({ top: saved.scrollY, behavior: 'instant' });
        });
      }
    }
  }, [isLoading, data]);

  const { data: favoritesData } = useSWR('/favoritos', async (url) => {
    return (await import('@/lib/axios')).default.get(url).then(res => res.data);
  }, {
    shouldRetryOnError: false,
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

  // Detectar si hay filtros activos (para ocultar secciones personalizadas)
  const hasActiveFilters = Boolean(
    filters.q ||
    filters.provincia ||
    filters.tipo ||
    filters.naturaleza ||
    filters.familia ||
    filters.ciclo ||
    filters.nivel ||
    filters.modalidad ||
    filters.lat ||
    filters.lng
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05 
      }
    }
  };

  return (
    <>
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        isPulling={isPulling}
      />

      {/* Hero Section */}
      <section className="relative pt-6 pb-20 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-50">
          <div className="text-center mb-10">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl mb-3 tracking-tight font-bold flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <span className="bg-gradient-to-r from-[#223945] via-blue-600 to-blue-400 bg-clip-text text-transparent text-center leading-tight py-2">
                Excelencia educativa a tu alcance
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Encuentra tu centro ideal en <span className="font-semibold text-[#223945]">Castilla y León</span> con nuestra búsqueda inteligente.
            </p>

            {/* Descubre tu FP — eyebrow + pill estilo wizard, branding azul */}
            <div className="mt-6 flex flex-col items-center gap-2.5">
              <p className="text-sm font-semibold text-neutral-600">¿No sabes qué estudiar?</p>
              <Link href="/descubre-tu-fp">
                <motion.span
                  data-tour="descubre-fp"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#223945] to-blue-600 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', repeatDelay: 2 }}
                  />
                  <Compass className="w-4 h-4 text-blue-300 relative z-10" />
                  <span className="relative z-10">Descubre tu FP</span>
                  <motion.span
                    className="relative z-10 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-md text-[10px] font-bold tracking-wider"
                    animate={{
                      boxShadow: [
                        '0 0 8px 2px rgba(59,130,246,0.4)',
                        '0 0 20px 4px rgba(59,130,246,0.6)',
                        '0 0 8px 2px rgba(59,130,246,0.4)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    FP
                  </motion.span>
                </motion.span>
              </Link>
            </div>
          </div>

          {/* Filter Bar Component */}
          <div className="max-w-[1050px] mx-auto">
            <FilterBar
              onFilterChange={handleFilterChange}
              isLoading={isLoading}
              page={page}
              initialFilters={filters}
              onOpenWizard={() => setIsWizardOpen(true)}
            />
          </div>
        </div>
      </section>

      {/* Secciones personalizadas - Solo visibles sin filtros activos */}
      {!hasActiveFilters && (
        <>
          <VisitedCentersSection />
          <RecommendationsSection />
        </>
      )}

      {/* Results Section - Backgrounds removed */}
      <section className="flex-grow px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <School className="text-primary-600 w-7 h-7" />
              Resultados
            </h2>
            {data && (
              <span className="text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#223945] to-[#345165] border border-white/10 px-3.5 py-1 rounded-full shadow-md whitespace-nowrap animate-in fade-in zoom-in-95 duration-300">
                {data.total} Centros encontrados
              </span>
            )}
            {!data && isLoading && (
              <div className="h-6 w-32 bg-neutral-100 rounded-full animate-pulse"></div>
            )}
          </div>

          {isLoading || isRefreshing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <CentroCardSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-xl border border-red-100 shadow-sm">
              <p className="text-red-500 font-medium text-lg">Ocurrió un error al cargar los datos.</p>
              <p className="text-neutral-500 text-sm mt-1">Por favor, intenta modificar tus filtros.</p>
            </div>
          ) : (
            <>
              {/* Orchestrated Staggered Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {data?.data?.map((centro: Centro, index: number) => (
                  <CentroCard
                    key={centro.id}
                    centro={centro}
                    index={index}
                    initialIsFavorite={favoriteIds.has(centro.id)}
                  />
                ))}
              </motion.div>

              {/* Pagination */}
              {data?.last_page > 1 && (
                <div className="flex flex-col items-center gap-3 mt-12 pb-8">
                  <div className="flex items-center gap-2 bg-white p-2 rounded-full shadow-sm border border-neutral-200">
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
                            <span key={`dots-${idx}`} className="text-neutral-400 font-normal px-1 select-none">...</span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setPage(p as number)}
                              className={`
                                w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base transition-all
                                ${current === p
                                  ? 'bg-[#223945] text-white font-bold scale-110'
                                  : 'text-neutral-500 font-semibold hover:bg-neutral-100 hover:text-[#223945]'
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
                    <span>
                      Pág. <span className="font-semibold text-[#223945]">{data.current_page}</span> / <span className="font-semibold text-[#223945]">{data.last_page}</span>
                    </span>

                    <span className="w-px h-4 bg-neutral-200"></span>

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
                        className="w-24 pl-3 pr-8 py-1.5 rounded-full border border-neutral-200 bg-white text-sm font-medium text-[#223945] placeholder:text-neutral-400 focus:ring-2 focus:ring-[#223945]/10 focus:border-[#223945] outline-none transition-all hover:border-neutral-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button
                        type="submit"
                        className="absolute right-1.5 p-1 rounded-full text-neutral-400 hover:text-[#223945] hover:bg-neutral-100 transition-colors"
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

      {/* AI Wizard Modal */}
      <AIWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </>
  );
}