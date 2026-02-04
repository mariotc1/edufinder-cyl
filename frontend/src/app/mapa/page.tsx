import { Suspense } from 'react';
import MapaContent from './MapaContent';

// PÁGINA DEL MAPA (WRAPPER)
// Carga diferida del contenido del mapa para mostrar un loader inicial
export default function MapaPage() {
    return (
        <Suspense fallback={
            <div className="h-[calc(100vh-80px)] w-full flex items-center justify-center bg-neutral-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#223945]/20 border-t-[#223945] rounded-full animate-spin"></div>
                    <p className="font-bold text-[#223945] animate-pulse">Cargando Mapa...</p>
                </div>
            </div>
        }>
            <MapaContent />
        </Suspense>
    );
}