import { Skeleton } from './ui/Skeleton';

// SKELETON: TARJETA DE CENTRO
// Misma forma que CentroCard: cabecera con icono, nombre, ciclos y pie
export default function CentroCardSkeleton() {
  return (
    <div className="relative bg-white rounded-3xl ring-1 ring-neutral-200/80 shadow-sm flex flex-col h-full">
      <div className="rounded-t-3xl bg-gradient-to-b from-neutral-100 to-white px-4 pt-4 pb-1 sm:px-5 sm:pt-5">
        <div className="flex items-start gap-3">
          <Skeleton className="w-11 h-11 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="w-[104px] h-9 rounded-full shrink-0" />
        </div>
        <Skeleton className="mt-4 h-5 w-4/5" />
        <Skeleton className="mt-2 h-4 w-1/3" />
      </div>
      <div className="px-4 pt-3 sm:px-5 flex-1 space-y-1.5">
        <Skeleton className="h-8 w-full rounded-xl" />
        <Skeleton className="h-8 w-full rounded-xl" />
      </div>
      <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5 flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
    </div>
  );
}
