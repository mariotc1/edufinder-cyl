'use client';

import { useState, useMemo } from 'react';
import api from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { UserPlus, User, Mail, Lock, CheckCircle } from 'lucide-react';
import AuthLayout, { AuthField, AuthSubmit, SocialAuth, AuthError } from '@/components/auth/AuthLayout';

// Primer mensaje legible de una respuesta de error del backend (validación de Laravel o mensaje simple)
function readableError(data: any): string {
    const firstValidation = data?.errors && Object.values(data.errors).flat()[0];
    return (typeof firstValidation === 'string' && firstValidation) || data?.message || data?.error || 'No se ha podido crear la cuenta';
}

export default function RegisterContent() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Marca de tiempo de carga del formulario (el backend rechaza envíos demasiado rápidos: bots)
    const [formToken] = useState(() => btoa(Math.floor(Date.now() / 1000).toString()));

    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect');

    const passwordRequirements = useMemo(() => [
        { text: '8 caracteres', met: password.length >= 8 },
        { text: 'Una mayúscula', met: /[A-Z]/.test(password) },
        { text: 'Un número', met: /[0-9]/.test(password) },
        { text: 'Coinciden', met: password.length > 0 && password === passwordConfirmation },
    ], [password, passwordConfirmation]);

    const isPasswordValid = passwordRequirements.every(req => req.met) && password.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        if (!isPasswordValid) {
            setError('Por favor cumple todos los requisitos de la contraseña');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            const res = await api.post('/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                _form_token: formToken,
            });
            login(res.data.user, res.data.access_token);
            router.push(redirectUrl || '/');
        } catch (err: any) {
            setError(err.response ? readableError(err.response.data) : 'No hay conexión. Inténtalo de nuevo.');
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            mode="register"
            icon={UserPlus}
            title="Crea tu cuenta"
            subtitle="Gratis y en menos de un minuto"
            footer={
                <>
                    ¿Ya tienes cuenta?{' '}
                    <Link
                        href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
                        className="font-bold text-[#223945] hover:text-blue-700 underline-offset-4 hover:underline"
                    >
                        Inicia sesión
                    </Link>
                </>
            }
        >
            {/* Honeypot - invisible to users */}
            <div className="absolute -left-[9999px] opacity-0 h-0 w-0 overflow-hidden" aria-hidden="true">
                <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
                <input type="text" id="company_url" name="company_url" tabIndex={-1} autoComplete="off" />
            </div>

            <AuthError message={error} />

            <form onSubmit={handleSubmit} className="space-y-4">
                <AuthField
                    id="name"
                    label="Nombre"
                    icon={User}
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Ej: Hugo García"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                />
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
                <div className="grid sm:grid-cols-2 gap-4">
                    <AuthField
                        id="password"
                        label="Contraseña"
                        icon={Lock}
                        type="password"
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                    />
                    <AuthField
                        id="password_confirmation"
                        label="Repite la contraseña"
                        icon={Lock}
                        type="password"
                        required
                        autoComplete="new-password"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                {/* Requisitos: aparecen al empezar a escribir */}
                {password.length > 0 && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-1 animate-in fade-in">
                        {passwordRequirements.map((req) => (
                            <div key={req.text} className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${req.met ? 'text-emerald-600' : 'text-neutral-400'}`}>
                                {req.met
                                    ? <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                    : <span className="w-3.5 h-3.5 rounded-full border-2 border-neutral-300 shrink-0" />}
                                {req.text}
                            </div>
                        ))}
                    </div>
                )}

                <div className="pt-1">
                    <AuthSubmit loading={isLoading} loadingText="Creando cuenta...">Crear cuenta</AuthSubmit>
                </div>
            </form>

            <SocialAuth label="o regístrate con" />
        </AuthLayout>
    );
}
