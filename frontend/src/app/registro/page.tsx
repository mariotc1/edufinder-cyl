'use client';

import { useState, useMemo } from 'react';
import api from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, ChevronLeft, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [touched, setTouched] = useState({ email: false, password: false });

    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Validation Logic
    const isEmailValid = useMemo(() => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }, [email]);

    const passwordRequirements = useMemo(() => [
        { label: "Mínimo 8 caracteres", met: password.length >= 8 },
        { label: "Al menos un número", met: /\d/.test(password) },
        { label: "Al menos una mayúscula", met: /[A-Z]/.test(password) },
    ], [password]);

    const isPasswordValid = passwordRequirements.every(req => req.met);
    const isFormValid = name.trim().length > 0 && isEmailValid && isPasswordValid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched({ email: true, password: true });

        if (!isFormValid || isLoading) return;

        setError('');
        setIsLoading(true);
        try {
            const res = await api.post('/register', { name, email, password });
            login(res.data.user, res.data.access_token);

            // Check for redirect param
            const redirectUrl = searchParams.get('redirect');
            if (redirectUrl) {
                router.push(redirectUrl);
            } else {
                router.push('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al registrarse');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-gradient flex flex-col items-center justify-start p-4 pt-12 md:pt-16">
            <div className="w-full max-w-md">
                {/* Back Link - Breadcrumb style */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-neutral-500 hover:text-[#223945] font-bold mb-6 transition-colors text-sm uppercase tracking-wide group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Volver al inicio
                </Link>

                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 overflow-hidden p-8">
                    {/* Decorative Top Gradient */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>

                    <div className="text-center mb-8">
                        {/* Icon Circle */}
                        <div className="mb-6 relative inline-block">
                            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white border border-neutral-100 shadow-md">
                                <UserPlus className="w-8 h-8 text-[#223945]" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-[#223945] mb-2 tracking-tight">
                            Únete a EduFinder CYL
                        </h2>
                        <p className="text-neutral-500 font-medium">
                            Crea tu cuenta para guardar favoritos
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium flex items-center justify-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="name" className="flex items-center gap-2 text-xs font-bold text-[#223945] uppercase tracking-wider ml-1">
                                <User className="w-3.5 h-3.5" />
                                Nombre completo
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                placeholder="Tu nombre"
                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 border-2 border-transparent focus:bg-white focus:border-[#223945] focus:ring-4 focus:ring-[#223945]/10 outline-none transition-all font-medium text-neutral-700 placeholder:text-neutral-400"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="flex items-center gap-2 text-xs font-bold text-[#223945] uppercase tracking-wider ml-1">
                                <Mail className="w-3.5 h-3.5" />
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="tu@email.com"
                                    className={`w-full px-4 py-3 rounded-xl bg-neutral-50 border-2 focus:bg-white focus:ring-4 outline-none transition-all font-medium text-neutral-700 placeholder:text-neutral-400 ${touched.email && !isEmailValid
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                        : 'border-transparent focus:border-[#223945] focus:ring-[#223945]/10'
                                        }`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                                    disabled={isLoading}
                                />
                                {touched.email && !isEmailValid && email.length > 0 && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            {touched.email && !isEmailValid && email.length > 0 && (
                                <p className="text-xs text-red-600 ml-1 font-bold">Por favor, introduce un correo válido</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="flex items-center gap-2 text-xs font-bold text-[#223945] uppercase tracking-wider ml-1">
                                <Lock className="w-3.5 h-3.5" />
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className={`w-full px-4 py-3 rounded-xl bg-neutral-50 border-2 focus:bg-white focus:ring-4 outline-none transition-all font-medium text-neutral-700 placeholder:text-neutral-400 pr-10 ${touched.password && !isPasswordValid
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                        : 'border-transparent focus:border-[#223945] focus:ring-[#223945]/10'
                                        }`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#223945] transition-colors focus:outline-none"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Password Requirements Feedback */}
                            <div className="bg-neutral-50 p-3 rounded-xl space-y-2 mt-2">
                                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">Requisitos:</p>
                                {passwordRequirements.map((req, idx) => (
                                    <div key={idx} className={`flex items-center gap-2 text-xs transition-colors duration-200 ${req.met ? 'text-emerald-600 font-medium' : 'text-neutral-400'}`}>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${req.met ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-200 text-neutral-400'}`}>
                                            {req.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                        </div>
                                        {req.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !isFormValid}
                            className={`w-full px-8 py-3.5 rounded-xl font-bold shadow-lg transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2 group mt-2 
                                ${isLoading || !isFormValid
                                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                                    : 'bg-[#223945] text-white shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Registrando...</span>
                                </>
                            ) : (
                                <span className="group-hover:translate-x-0.5 transition-transform">Crear Cuenta</span>
                            )}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-neutral-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-neutral-400 font-bold tracking-wider">O continúa con</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <a
                                href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google/redirect`}
                                className="flex items-center justify-center gap-2 bg-white border border-neutral-200 text-neutral-700 py-2.5 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all font-bold text-sm shadow-sm"
                            >
                                {/* Colored Google G */}
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </a>

                            <a 
                                href={`${process.env.NEXT_PUBLIC_API_URL}/auth/github/redirect`}
                                className="flex items-center justify-center gap-2 bg-[#24292e] text-white py-2.5 rounded-xl hover:bg-[#000000] transition-all font-bold text-sm shadow-sm"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 16 16">
                                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                                </svg>
                                GitHub
                            </a>
                        </div>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-neutral-100">
                        <p className="text-sm text-neutral-600 font-medium">
                            ¿Ya tienes cuenta?{' '}
                            <Link
                                href="/login"
                                className="text-[#223945] hover:text-black font-bold hover:underline decoration-2 underline-offset-4 transition-all"
                            >
                                Inicia sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
