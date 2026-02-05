'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useComparison } from '@/context/ComparisonContext';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const { selectedCentros } = useComparison();
    const pathname = usePathname();

    // Determine if the comparison tray is visible
    // Must match logic in ComparisonTray.tsx: selectedCentros.length > 0 && pathname !== '/comparador'
    const isTrayVisible = selectedCentros.length > 0 && pathname !== '/comparador';

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`
                fixed right-6 z-50 
                flex items-center justify-center 
                w-10 h-10 md:w-12 md:h-12 rounded-full 
                bg-gradient-to-r from-[#223945] to-blue-600 text-white 
                shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/40 hover:-translate-y-1
                transform transition-all duration-300 ease-in-out
                ${isTrayVisible ? 'bottom-20 sm:bottom-24' : 'bottom-6'}
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'}
            `}
            aria-label="Volver arriba"
        >
            <ArrowUp className="w-5 h-5 md:w-6 md:h-6" />
        </button>
    );
}
