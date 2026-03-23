import { Skeleton, SkeletonBadge } from './ui/Skeleton';

// SKELETON: PÁGINA DE DETALLE DE CENTRO
// Placeholder animado mientras carga la información del centro
export default function CentroDetailSkeleton() {
  return (
    <div className="min-h-screen bg-brand-gradient py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-16 h-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8">
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-8 border border-neutral-100 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-neutral-300 via-neutral-200 to-neutral-300 animate-pulse"></div>

              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <SkeletonBadge />
                  </div>
                  <Skeleton className="h-10 w-3/4 mb-2" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="w-10 h-10 rounded-full" />
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-300 via-neutral-200 to-neutral-300 animate-pulse"></div>

              <div className="flex items-center gap-2 mb-6">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-5 w-40" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-16 mb-1" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Oferta Formativa Card */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-300 via-neutral-200 to-neutral-300 animate-pulse"></div>

              <div className="flex items-center gap-2 mb-6">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-5 w-32" />
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-28 rounded-full" />
                ))}
              </div>

              {/* Ciclos List */}
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                    <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-5 space-y-6">
            {/* Map Card */}
            <div className="bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-lg sticky top-24">
              <div className="p-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-6 h-6 rounded" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
              <Skeleton className="h-64 md:h-80 w-full rounded-none" />
              <div className="p-4 bg-neutral-50 border-t border-neutral-100">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="flex-1 h-10 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
