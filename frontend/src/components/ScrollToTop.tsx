'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useComparison } from '@/context/ComparisonContext';
import { usePWA } from '@/components/PWAProvider';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const [stripDismissed, setStripDismissed] = useState(false);
    const { selectedCentros } = useComparison();
    const { isInstallable, isInstalled, isIOS } = usePWA();
    const pathname = usePathname();

    const isTrayVisible = selectedCentros.length > 0 && pathname !== '/comparador';
    const isInstallStripVisible = (isInstallable || isIOS) && !isInstalled && !stripDismissed;

    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-strip-dismissed');
        if (dismissed) {
            const weekInMs = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - parseInt(dismissed) < weekInMs) {
                setStripDismissed(true);
            }
        }
    }, []);

    useEffect(() => {
        const toggleVisibility = () => setIsVisible(window.scrollY > 300);
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    // Móvil: siempre sobre la BottomNav usando la CSS variable, más offset si el strip de instalación está visible
    // Desktop: bottom-6 normalmente, bottom-24 cuando el comparador está abierto
    const mobileBottom = isTrayVisible
        ? 'bottom-36'
        : isInstallStripVisible
            ? 'bottom-[calc(var(--bottom-nav-height)+3.25rem)]'
            : 'bottom-[calc(var(--bottom-nav-height)+0.75rem)]';
    const desktopBottom = isTrayVisible ? 'md:bottom-24' : 'md:bottom-6';

    return (
        <button
            onClick={scrollToTop}
            className={`
                fixed right-4 z-[110]
                flex items-center justify-center
                w-10 h-10 md:w-12 md:h-12 rounded-full
                bg-gradient-to-r from-[#223945] to-blue-600 text-white
                shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/40 hover:-translate-y-1
                transform transition-all duration-300 ease-in-out
                ${mobileBottom} ${desktopBottom}
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'}
            `}
            aria-label="Volver arriba"
        >
            <ArrowUp className="w-4 h-4 md:w-5 md:h-5" />
        </button>
    );
}
