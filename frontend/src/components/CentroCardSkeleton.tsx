import { Skeleton, SkeletonBadge, SkeletonText, SkeletonTitle } from './ui/Skeleton';

// SKELETON: TARJETA DE CENTRO
// Muestra un placeholder animado mientras carga la tarjeta real
export default function CentroCardSkeleton() {
  return (
    <div className="group relative bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-sm flex flex-col h-full">
      {/* Borde decorativo superior */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-neutral-300 via-neutral-200 to-neutral-300 animate-pulse"></div>

      {/* Botones esquina superior derecha */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>

      <div className="p-5 flex-grow flex flex-col">
        {/* Badges */}
        <div className="flex items-start mb-3 pr-20">
          <div className="flex items-center gap-2">
            <SkeletonBadge />
          </div>
        </div>

        {/* Título */}
        <div className="mb-4 min-h-[4rem] flex flex-col justify-center">
          <Skeleton className="h-3 w-24 mb-2" />
          <SkeletonTitle />
          <Skeleton className="h-5 w-2/3 mt-1" />
        </div>

        {/* Info Icons */}
        <div className="space-y-2.5 mb-5 min-h-[4.5rem]">
          {/* Ubicación */}
          <div className="flex items-start gap-2.5">
            <Skeleton className="w-7 h-7 rounded-md shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* Dirección */}
          <div className="flex items-start gap-2.5">
            <Skeleton className="w-7 h-7 rounded-md shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>

        {/* Oferta Formativa */}
        <div className="pt-3 border-t border-neutral-100">
          <div className="flex items-center gap-2 mb-2.5">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-3 w-28" />
          </div>

          <div className="space-y-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-neutral-50 border border-neutral-100">
                <Skeleton className="w-1.5 h-1.5 rounded-full shrink-0" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-neutral-50/50 border-t border-neutral-100">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

// Componente para mostrar múltiples skeletons en grid
export function CentroCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CentroCardSkeleton key={i} />
      ))}
    </div>
  );
}
