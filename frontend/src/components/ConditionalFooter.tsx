'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';

export default function ConditionalFooter() {
    const pathname = usePathname();
    // Mapa y perfil son pantallas a altura fija (sin scroll de página)
    if (pathname === '/mapa' || pathname === '/perfil') return null;

    return (
        <div className="hidden md:block">
            <Footer />
        </div>
    );
}
