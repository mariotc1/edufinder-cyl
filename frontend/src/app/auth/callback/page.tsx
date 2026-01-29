'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            console.error('Social Login Error:', error);
            router.push('/login?error=social_login_failed');
            return;
        }

        if (token) {
            // Ideally we would fetch the user here or the backend passes user JSON base64 encoded
            // But for now, let's assume login(user, token) requires a user object.
            // Since we only have the token, we might need a "fetchMe" call or modify login to accept just token.
            // Wait, standard AuthProvider usually expects user object.
            // Let's quickly verify AuthContext expectations.
            // Assuming we need to fetch /me with the token first.
            
            // Temporary Hack: Just pass a dummy user until we fetch 'me'
            // OR better: Call /api/me immediately.
            
            const fetchUser = async () => {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    });
                    if (res.ok) {
                        const user = await res.json();
                        login(user, token);
                        router.push('/');
                    } else {
                        throw new Error('Failed to fetch user');
                    }
                } catch (err) {
                    console.error('Fetch User Error:', err);
                    router.push('/login?error=token_validation_failed');
                }
            };

            fetchUser();
        } else {
            router.push('/login');
        }
    }, [searchParams, router, login]);

    return (
        <div className="min-h-screen bg-brand-gradient flex items-center justify-center text-white">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-bold">Autenticando...</h2>
                <p className="text-white/80">Por favor espera un momento</p>
            </div>
        </div>
    );
}

export default function AuthCallback() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-brand-gradient" />}>
            <CallbackContent />
        </Suspense>
    );
}
