import { Suspense } from 'react';
import MapaContent from './MapaContent';

function MapSkeleton() {
    return (
        <div className="h-[calc(100dvh-var(--bottom-nav-height,0px)-var(--mobile-header-height,0px))] md:h-[calc(100vh-80px)] w-full relative overflow-hidden bg-[#e8eaed]">
            {/* Fake map tiles — pulse in a staggered grid */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
                {[...Array(16)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-[#e8eaed] animate-pulse border border-[#dde0e3]"
                        style={{ animationDelay: `${(i % 4) * 120}ms` }}
                    />
                ))}
            </div>

            {/* Fake roads */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-0 right-0 h-1.5 bg-white/60 rounded-full" />
                <div className="absolute top-2/3 left-0 right-0 h-1 bg-white/40 rounded-full" />
                <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-white/40 rounded-full" />
                <div className="absolute left-3/4 top-0 bottom-0 w-1.5 bg-white/60 rounded-full" />
            </div>

            {/* Fake sidebar (desktop) */}
            <div className="hidden md:flex absolute left-4 top-4 bottom-4 w-80 flex-col gap-3">
                <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3">
                    <div className="h-10 bg-neutral-100 rounded-xl animate-pulse" />
                    <div className="h-9 bg-neutral-100 rounded-xl animate-pulse" />
                </div>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-md p-4 space-y-2.5 animate-pulse" style={{ opacity: 1 - i * 0.2 }}>
                        <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                        <div className="h-3.5 w-1/2 bg-neutral-100 rounded" />
                        <div className="h-3 w-2/3 bg-neutral-100 rounded" />
                    </div>
                ))}
            </div>

            {/* Center loading badge */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl px-5 py-3 shadow-xl flex items-center gap-3 border border-white/60">
                    <div className="w-5 h-5 border-2 border-[#223945]/30 border-t-[#223945] rounded-full animate-spin" />
                    <span className="text-sm font-bold text-[#223945]">Cargando mapa…</span>
                </div>
            </div>

            {/* Zoom controls skeleton (bottom-right, desktop) */}
            <div className="hidden md:flex absolute bottom-8 right-4 flex-col gap-1">
                <div className="w-9 h-9 bg-white rounded-lg shadow-md animate-pulse" />
                <div className="w-9 h-9 bg-white rounded-lg shadow-md animate-pulse" />
            </div>
        </div>
    );
}

// PÁGINA DEL MAPA (WRAPPER)
// Carga diferida del contenido del mapa para mostrar un loader inicial
export default function MapaPage() {
    return (
        <Suspense fallback={<MapSkeleton />}>
            <MapaContent />
        </Suspense>
    );
}