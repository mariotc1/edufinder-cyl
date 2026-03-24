import { Suspense } from 'react';
import { Metadata } from 'next';
import CentroDetailContent from './CentroDetailContent';
import CentroDetailSkeleton from '@/components/CentroDetailSkeleton';

// METADATOS PARA PÁGINAS DE CENTRO
export const metadata: Metadata = {
    title: 'Centro Educativo | EduFinder CYL',
    description: 'Información detallada del centro educativo en Castilla y León. Consulta dirección, contacto, oferta formativa y más.',
};

// PÁGINA DE DETALLE DE CENTRO (WRAPPER)
// Carga diferida de los detalles del centro
export default function CentroDetail() {
    return (
        <Suspense fallback={<CentroDetailSkeleton />}>
            <CentroDetailContent />
        </Suspense>
    );
}
