import { Metadata } from 'next';
import ComparadorContent from './ComparadorContent';

// URL base de la API (server-side)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.edufinder.es/api';

interface Centro {
  id: number;
  nombre: string;
}

// Genera metadata dinámica para Open Graph
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const centrosParam = params.centros;

  // URL base para OG images
  const baseUrl = 'https://edufinder-cyl.vercel.app';

  // Si no hay centros en la URL, devolver metadata por defecto
  if (!centrosParam || typeof centrosParam !== 'string') {
    return {
      title: 'Comparador de Centros',
      description: 'Compara centros educativos de Castilla y León lado a lado',
      openGraph: {
        title: 'Comparador de Centros | EduFinder CyL',
        description: 'Compara centros educativos de Castilla y León lado a lado',
        images: [`${baseUrl}/api/og?type=default&title=Comparador de Centros`],
        type: 'website',
        siteName: 'EduFinder CyL',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Comparador de Centros | EduFinder CyL',
        description: 'Compara centros educativos de Castilla y León lado a lado',
        images: [`${baseUrl}/api/og?type=default&title=Comparador de Centros`],
      },
    };
  }

  // Parsear IDs de centros
  const ids = centrosParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));

  if (ids.length === 0) {
    return {
      title: 'Comparador de Centros',
      description: 'Compara centros educativos de Castilla y León',
    };
  }

  // Intentar obtener nombres de centros desde la API
  let centroNames: string[] = [];
  try {
    const responses = await Promise.all(
      ids.slice(0, 3).map(id =>
        fetch(`${API_URL}/centros/${id}`, {
          next: { revalidate: 3600 }, // Cache por 1 hora
        }).then(res => res.ok ? res.json() : null)
      )
    );

    centroNames = responses
      .filter(Boolean)
      .map((res: { data: Centro }) => res.data?.nombre)
      .filter(Boolean);
  } catch (error) {
    console.error('Error fetching centro names for OG:', error);
  }

  // Si no se pudieron obtener nombres, usar genérico
  if (centroNames.length === 0) {
    return {
      title: `Comparando ${ids.length} centros`,
      description: 'Comparación de centros educativos en EduFinder CyL',
      openGraph: {
        title: `Comparando ${ids.length} centros | EduFinder CyL`,
        description: 'Comparación de centros educativos en Castilla y León',
        images: [`${baseUrl}/api/og?type=default&title=Comparando ${ids.length} centros`],
        type: 'website',
        siteName: 'EduFinder CyL',
      },
    };
  }

  // Construir URL de imagen OG con nombres de centros
  const centrosEncoded = encodeURIComponent(centroNames.join('|'));
  const ogImageUrl = `${baseUrl}/api/og?type=comparador&centros=${centrosEncoded}`;

  const title = `Comparando: ${centroNames.slice(0, 2).join(' vs ')}${centroNames.length > 2 ? ` y ${centroNames.length - 2} más` : ''}`;
  const description = `Comparación de ${centroNames.length} centros educativos: ${centroNames.join(', ')}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | EduFinder CyL`,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Comparación de centros: ${centroNames.join(', ')}`,
        },
      ],
      type: 'website',
      siteName: 'EduFinder CyL',
      url: `${baseUrl}/comparador?centros=${centrosParam}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | EduFinder CyL`,
      description,
      images: [ogImageUrl],
    },
  };
}

// Página del comparador
export default function ComparadorPage() {
  return <ComparadorContent />;
}
