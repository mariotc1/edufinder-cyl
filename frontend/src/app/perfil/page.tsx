import { Suspense } from 'react';
import ProfileContent from './ProfileContent';

export default function Profile() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-brand-gradient flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                     <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                     <p className="font-bold">Cargando perfil...</p>
                </div>
            </div>
        }>
            <ProfileContent />
        </Suspense>
    );
}