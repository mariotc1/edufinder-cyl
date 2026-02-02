'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const processed = useRef(false);

    useEffect(() => {
        if (processed.current) return;
        
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');
        const error = searchParams.get('error');

        if (token && userStr) {
            processed.current = true;
            try {
                const user = JSON.parse(decodeURIComponent(userStr));
                login(user, token);
                
                // Clear URL params without refresh
                window.history.replaceState({}, document.title, '/');
                
                // Redirect home
                router.push('/');
            } catch (e) {
                console.error('Error parsing user data', e);
                router.push('/login?error=auth_error');
            }
        } else if (error) {
            router.push(`/login?error=${error}`);
        } else {
            // No valid params, just redirect
             router.push('/login');
        }
    }, [searchParams, login, router]);

    return (
        <div className="min-h-screen bg-brand-gradient flex flex-col items-center justify-center text-white">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <h2 className="text-xl font-bold">Autenticando...</h2>
            <p className="text-white/80 mt-2">Por favor espera un momento</p>
        </div>
    );
}
