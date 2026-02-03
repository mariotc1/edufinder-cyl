import { Suspense } from 'react';
import CallbackContent from './CallbackContent';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-brand-gradient flex flex-col items-center justify-center text-white">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <h2 className="text-xl font-bold">Iniciando sesión...</h2>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}