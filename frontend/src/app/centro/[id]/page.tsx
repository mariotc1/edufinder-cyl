
import { Suspense } from 'react';
import CentroDetailContent from './CentroDetailContent';

// PÁGINA DE DETALLE DE CENTRO (WRAPPER)
// Carga diferida de los detalles del centro
export default function CentroDetail() {
    return (
        <Suspense fallback={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-[#223945] mb-4"></div>
                    <p className="text-[#223945] font-bold">Cargando información...</p>
                </div>
            </div>
        }>
            <CentroDetailContent />
        </Suspense>
    );
}
