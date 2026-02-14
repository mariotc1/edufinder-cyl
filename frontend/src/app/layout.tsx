import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import AppShell from '@/components/AppShell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// METADATOS GLOBALES DE LA APLICACIÓN
// Configuración SEO base para todas las páginas
export const metadata: Metadata = {
  title: 'EduFinder CYL - Encuentra centros educativos y ciclos de FP en Castilla y León',
  description: 'Plataforma oficial para buscar centros educativos de primaria, secundaria, bachillerato y ciclos de Formación Profesional en Castilla y León. Información actualizada y completa.',
  keywords: 'educación, Castilla y León, centros educativos, formación profesional, FP, colegios, institutos',
  authors: [{ name: 'Junta de Castilla y León' }],
  icons: {
    icon: '/logo.ico?v=2',
    apple: '/logo.ico?v=2',
  },
};

export const generateViewport = () => {
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#3b82f6',
  };
};

// LAYOUT RAÍZ (ROOT LAYOUT)
// Estructura base HTML/Body compartida por toda la aplicación
// Incluye AppShell (Navbar/Footer condicionales) y Proveedores de Contexto
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans min-h-screen bg-neutral-50 text-neutral-900 antialiased`}>
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}