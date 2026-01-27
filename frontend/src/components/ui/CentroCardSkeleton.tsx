export default function CentroCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-sm h-full flex flex-col relative">
      {/* Decorative top border placeholder */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-neutral-100"></div>

      {/* Heart placeholder */}
      <div className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-neutral-100 animate-pulse"></div>

      <div className="p-5 flex-grow flex flex-col">
        {/* Header Section (Badge + KM) */}
        <div className="flex justify-start items-center gap-2 mb-3">
          <div className="h-5 w-20 bg-neutral-100 rounded-full animate-pulse"></div>
          <div className="h-5 w-16 bg-neutral-100 rounded-full animate-pulse"></div>
        </div>

        {/* Title */}
        <div className="h-7 w-3/4 bg-neutral-100 rounded-md mb-2 animate-pulse"></div>
        <div className="h-7 w-1/2 bg-neutral-100 rounded-md mb-3 animate-pulse"></div>

        {/* Info Icons */}
        <div className="space-y-3 mb-5 mt-2">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-md bg-neutral-100 shrink-0 animate-pulse"></div>
            <div className="flex-1 space-y-1 py-1">
                <div className="h-3 w-1/3 bg-neutral-100 rounded animate-pulse"></div>
                <div className="h-3 w-2/3 bg-neutral-100 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-md bg-neutral-100 shrink-0 animate-pulse"></div>
             <div className="flex-1 space-y-1 py-1">
                <div className="h-3 w-1/3 bg-neutral-100 rounded animate-pulse"></div>
                <div className="h-3 w-1/2 bg-neutral-100 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Ciclos Placeholder */}
        <div className="pt-3 border-t border-neutral-100 mt-auto">
            <div className="flex items-center gap-2 mb-2.5">
                <div className="w-5 h-5 bg-neutral-100 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-neutral-100 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
                <div className="h-8 w-full bg-neutral-100 rounded-md animate-pulse"></div>
                <div className="h-8 w-full bg-neutral-100 rounded-md animate-pulse"></div>
            </div>
        </div>
      </div>

      {/* Footer / Action */}
      <div className="p-3 bg-neutral-50/50 border-t border-neutral-100">
        <div className="h-9 w-full bg-neutral-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}
