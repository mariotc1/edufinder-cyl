import { Suspense } from 'react';
import FavoritosContent from './FavoritosContent';

export default function Favoritos() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-brand-gradient flex items-center justify-center">
                 <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#223945]/20 border-t-[#223945] rounded-full animate-spin"></div>
                    <p className="font-bold text-[#223945]">Redirigiendo a favoritos...</p>
                </div>
            </div>
        }>
            <FavoritosContent />
        </Suspense>
    );
}