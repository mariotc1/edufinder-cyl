'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthLayout, { AuthField, AuthSubmit, SocialAuth, AuthError } from '@/components/auth/AuthLayout';

export default function LoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        setError('');
        setIsLoading(true);
        try {
            const res = await api.post('/login', { email, password });
            login(res.data.user, res.data.access_token);
            router.push(redirectUrl || '/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            mode="login"
            icon={LogIn}
            title="Bienvenido de nuevo"
            subtitle="Accede a tu cuenta de EduFinder CYL"
            footer={
                <>
                    ¿No tienes cuenta?{' '}
                    <Link
                        href={redirectUrl ? `/registro?redirect=${encodeURIComponent(redirectUrl)}` : '/registro'}
                        className="font-bold text-[#223945] hover:text-blue-700 underline-offset-4 hover:underline"
                    >
                        Regístrate gratis
                    </Link>
                </>
            }
        >
            <AuthError message={error} />

            <form onSubmit={handleSubmit} className="space-y-4">
                <AuthField
                    id="email"
                    label="Correo electrónico"
                    icon={Mail}
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                />
                <AuthField
                    id="password"
                    label="Contraseña"
                    icon={Lock}
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    labelAction={
                        <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                            ¿La has olvidado?
                        </Link>
                    }
                />

                <div className="pt-1">
                    <AuthSubmit loading={isLoading} loadingText="Entrando...">Iniciar sesión</AuthSubmit>
                </div>
            </form>

            <SocialAuth label="o continúa con" />
        </AuthLayout>
    );
}
