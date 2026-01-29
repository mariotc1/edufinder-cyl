import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import ConditionalFooter from '@/components/ConditionalFooter';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EduFinder CYL - Encuentra centros educativos y ciclos de FP en Castilla y León',
  description: 'Plataforma oficial para buscar centros educativos de primaria, secundaria, bachillerato y ciclos de Formación Profesional en Castilla y León. Información actualizada y completa.',
  keywords: 'educación, Castilla y León, centros educativos, formación profesional, FP, colegios, institutos',
  authors: [{ name: 'Junta de Castilla y León' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
};

import ComparisonTray from '@/components/ComparisonTray';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans min-h-screen bg-neutral-50 text-neutral-900 antialiased`}>
        <Providers>
          <Navbar />
          <main className="pt-20 min-h-screen">
            {children}
          </main>
          <ConditionalFooter />
          <ComparisonTray />
        </Providers>
      </body>
    </html>
  );
}
