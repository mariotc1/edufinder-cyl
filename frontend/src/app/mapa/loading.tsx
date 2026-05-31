export default function MapaLoading() {
    return (
        <div className="h-[calc(100dvh-var(--bottom-nav-height)-var(--mobile-header-height))] md:h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center gap-4 bg-neutral-100">
            <div className="w-14 h-14 border-4 border-[#223945]/20 border-t-[#223945] rounded-full animate-spin" />
            <div className="text-center px-8">
                <p className="font-bold text-[#223945] text-base">Cargando el mapa</p>
                <p className="text-neutral-500 text-sm mt-1.5">Preparando más de 2.400 centros educativos</p>
            </div>
        </div>
    );
}
