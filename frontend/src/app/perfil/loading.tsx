export default function PerfilLoading() {
    return (
        <div className="min-h-screen bg-brand-gradient pt-6 md:pt-20 pb-12 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto animate-pulse">
                <div className="bg-white/80 rounded-3xl p-6 md:p-10">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-5 mb-8">
                        <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-neutral-200 shrink-0" />
                        <div className="space-y-2">
                            <div className="h-6 w-36 bg-neutral-200 rounded-lg" />
                            <div className="h-4 w-52 bg-neutral-100 rounded-lg" />
                            <div className="h-4 w-24 bg-neutral-100 rounded-lg" />
                        </div>
                    </div>
                    {/* Fields */}
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-12 bg-neutral-100 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
