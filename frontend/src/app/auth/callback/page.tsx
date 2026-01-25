'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';

export default function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            // Fetch user data to store it
            api.get('/me', {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                localStorage.setItem('user', JSON.stringify(res.data));
                router.replace('/');
            }).catch(() => {
                router.replace('/login?error=auth_failed');
            });
        } else {
            router.replace('/login?error=no_token');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Autenticando...</p>
            </div>
        </div>
    );
}
