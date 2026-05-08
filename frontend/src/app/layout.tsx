import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import AppShell from '@/components/AppShell';
import { AdaptiveIcons } from '@/components/pwa/AdaptiveIcons';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// METADATOS GLOBALES DE LA APLICACIÓN
// Configuración SEO y PWA para todas las páginas
export const metadata: Metadata = {
  title: {
    default: 'EduFinder CYL - Encuentra centros educativos y ciclos de FP en Castilla y León',
    template: '%s | EduFinder CYL',
  },
  description: 'Plataforma oficial para buscar centros educativos de primaria, secundaria, bachillerato y ciclos de Formación Profesional en Castilla y León. Información actualizada y completa.',
  keywords: ['educación', 'Castilla y León', 'centros educativos', 'formación profesional', 'FP', 'colegios', 'institutos', 'grado medio', 'grado superior', 'ciclos formativos'],
  authors: [{ name: 'EduFinder CYL' }],
  creator: 'EduFinder CYL',
  publisher: 'EduFinder CYL',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo.ico', sizes: 'any' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EduFinder CYL',
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#223945' },
    { media: '(prefers-color-scheme: dark)', color: '#223945' },
  ],
  colorScheme: 'light dark',
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
      <head>
        <AdaptiveIcons />
      </head>
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
