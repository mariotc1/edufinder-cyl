'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FavoritosContent() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Redirect logic moved to client side effect inside component to ensure router is available
        // Initial page had `router.replace('/perfil?tab=favorites');` directly in function body ?? 
        // No, typically that causes error during render. It should be in useEffect.
        // Assuming the original intention was just a redirect.
        router.replace('/perfil?tab=favorites');
    }, [router]);

    if (!isMounted) return null; // Avoid hydration mismatch or immediate redirect flicker

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-gradient">
           <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#223945]/20 border-t-[#223945] rounded-full animate-spin"></div>
                <p className="font-bold text-[#223945]">Redirigiendo a favoritos...</p>
           </div>
        </div>
    );
}
