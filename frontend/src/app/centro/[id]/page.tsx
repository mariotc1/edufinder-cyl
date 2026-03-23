import { Suspense } from 'react';
import { Metadata } from 'next';
import CentroDetailContent from './CentroDetailContent';
import CentroDetailSkeleton from '@/components/CentroDetailSkeleton';

// METADATOS ESTÁTICOS PARA PÁGINAS DE CENTRO
// Usamos metadatos genéricos para evitar errores de fetch SSR
// Los datos específicos del centro se cargan del lado del cliente
export const metadata: Metadata = {
    title: 'Centro Educativo | EduFinder CYL',
    description: 'Información detallada del centro educativo en Castilla y León. Consulta dirección, contacto, oferta formativa y más.',
    openGraph: {
        title: 'Centro Educativo | EduFinder CYL',
        description: 'Información detallada del centro educativo en Castilla y León.',
        siteName: 'EduFinder CYL',
        locale: 'es_ES',
        type: 'website',
        images: [
            {
                url: '/img/og-centro.png',
                width: 1200,
                height: 630,
                alt: 'Centro Educativo - EduFinder CYL',
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Centro Educativo | EduFinder CYL',
        description: 'Información detallada del centro educativo en Castilla y León.',
        images: ['/img/og-centro.png'],
    },
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
