'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { Loader2 } from 'lucide-react';

export default function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const processed = useRef(false);

    useEffect(() => {
        if (processed.current) return;
        
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (token) {
            processed.current = true;
            
            api.get('/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(res => {
                const user = res.data;
                login(user, token);
                window.history.replaceState({}, document.title, '/');
                router.push('/');
            })
            .catch(err => {
                console.error('Error fetching user data', err);
                router.push('/login?error=auth_error');
            });

        } else if (error) {
            router.push(`/login?error=${error}`);

        } else {
             const hasParams = Array.from(searchParams.keys()).length > 0;
             if (!hasParams) {
                 router.push('/login');
             }
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