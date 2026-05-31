import CentroCardSkeleton from '@/components/CentroCardSkeleton';

export default function FavoritosLoading() {
    return (
        <div className="min-h-screen bg-brand-gradient pt-6 md:pt-20 pb-12 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="h-9 w-44 bg-white/50 rounded-xl animate-pulse mb-2" />
                    <div className="h-4 w-64 bg-white/30 rounded-lg animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <CentroCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
