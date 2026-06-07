import type { Metadata } from 'next';
import DescubreFPClient from './DescubreFPClient';

export const metadata: Metadata = {
  title: 'Descubre tu FP — Encuentra tu camino profesional',
  description:
    'Responde 12 preguntas y descubre qué familias profesionales encajan mejor con tus intereses, habilidades y forma de ser. Gratuito, en 3 minutos.',
  openGraph: {
    title: 'Descubre tu FP | EduFinder CYL',
    description:
      '12 preguntas para descubrir tu camino en la Formación Profesional de Castilla y León.',
  },
};

export default function DescubreTuFPPage() {
  return <DescubreFPClient />;
}
