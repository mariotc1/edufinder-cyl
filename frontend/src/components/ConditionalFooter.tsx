'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';

export default function ConditionalFooter() {
    const pathname = usePathname();
    const isMapPage = pathname === '/mapa';

    if (isMapPage) return null;

    return (
        <div className="hidden md:block">
            <Footer />
        </div>
    );
}
