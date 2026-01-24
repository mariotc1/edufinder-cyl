import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'EduFinder CYL - Buscador Educativo',
  description: 'Descubre tu futuro en Castilla y León',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans min-h-screen bg-slate-950 text-slate-100`}>
        <Navbar />
        <main className="pt-16 min-h-screen">
            {children}
        </main>
      </body>
    </html>
  );
}
