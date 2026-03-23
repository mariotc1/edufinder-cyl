import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import AppShell from '@/components/AppShell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// URL base del sitio
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://edufindercyl.es';

// METADATOS GLOBALES DE LA APLICACIÓN
// Configuración SEO, PWA y Open Graph base para todas las páginas
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
  // Open Graph - Para compartir en redes sociales y WhatsApp
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: siteUrl,
    siteName: 'EduFinder CYL',
    title: 'EduFinder CYL - Encuentra centros educativos en Castilla y León',
    description: 'Busca y compara centros educativos, colegios, institutos y ciclos de Formación Profesional en todas las provincias de Castilla y León.',
    images: [
      {
        url: '/img/og-default.png',
        width: 1200,
        height: 630,
        alt: 'EduFinder CYL - Buscador de centros educativos',
      },
    ],
  },
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'EduFinder CYL - Encuentra centros educativos en Castilla y León',
    description: 'Busca y compara centros educativos, colegios, institutos y ciclos de FP en Castilla y León.',
    images: ['/img/og-default.png'],
    creator: '@edufindercyl',
  },
  // Robots
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
  // PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
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
  // Verificación (añadir cuando tengas las claves)
  // verification: {
  //   google: 'tu-codigo-de-verificacion',
  // },
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
  colorScheme: 'light',
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