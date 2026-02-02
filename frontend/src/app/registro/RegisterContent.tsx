'use client';

import { useState, useMemo } from 'react';
import api from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { UserPlus, User, Mail, Lock, Eye, EyeOff, Loader2, ChevronLeft, CheckCircle, XCircle } from 'lucide-react';

export default function RegisterContent() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const router = useRouter();


    // Live Password Validation
    const passwordRequirements = useMemo(() => {
        return [
            { text: "Mínimo 8 caracteres", met: password.length >= 8 },
            { text: "Al menos una mayúscula", met: /[A-Z]/.test(password) },
            { text: "Al menos un número", met: /[0-9]/.test(password) },
            { text: "Coinciden", met: password && password === passwordConfirmation },
        ];
    }, [password, passwordConfirmation]);

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
            });
            login(res.data.user, res.data.access_token);
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al registrar usuario');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-gradient flex flex-col items-center justify-start p-4 pt-12 md:pt-16">
            <div className="w-full max-w-lg">
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
                        <div className="mb-6 relative inline-block">
                            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white border border-neutral-100 shadow-md">
                                <UserPlus className="w-8 h-8 text-[#223945]" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-[#223945] mb-2 tracking-tight">
                            Crear Cuenta
                        </h2>
                        <p className="text-neutral-500 font-medium">
                            Únete a EduFinder CYL totalmente gratis
                        </p>
                    </div>

                    {error && (
                         <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                       <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-[#223945] uppercase tracking-wider ml-1">
                                <User className="w-3.5 h-3.5" />
                                Nombre Completo
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Ej: Mario Tomé"
                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 border-2 border-transparent focus:bg-white focus:border-[#223945] focus:ring-4 focus:ring-[#223945]/10 outline-none transition-all font-medium text-neutral-700 placeholder:text-neutral-400"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                             <label className="flex items-center gap-2 text-xs font-bold text-[#223945] uppercase tracking-wider ml-1">
                                <Mail className="w-3.5 h-3.5" />
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="tu@email.com"
                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 border-2 border-transparent focus:bg-white focus:border-[#223945] focus:ring-4 focus:ring-[#223945]/10 outline-none transition-all font-medium text-neutral-700 placeholder:text-neutral-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#223945] uppercase tracking-wider ml-1">
                                    <Lock className="w-3.5 h-3.5" />
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 border-2 border-transparent focus:bg-white focus:border-[#223945] focus:ring-4 focus:ring-[#223945]/10 outline-none transition-all font-medium text-neutral-700 placeholder:text-neutral-400 pr-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#223945] transition-colors"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#223945] uppercase tracking-wider ml-1">
                                    <Lock className="w-3.5 h-3.5" />
                                    Confirmar
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 border-2 border-transparent focus:bg-white focus:border-[#223945] focus:ring-4 focus:ring-[#223945]/10 outline-none transition-all font-medium text-neutral-700 placeholder:text-neutral-400 pr-10"
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#223945] transition-colors"
                                        disabled={isLoading}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Password Requirements Indicator */}
                        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 grid grid-cols-2 gap-x-4 gap-y-2">
                            {passwordRequirements.map((req, idx) => (
                                <div key={idx} className={`flex items-center gap-2 text-xs font-bold transition-colors ${req.met ? 'text-green-600' : 'text-neutral-400'}`}>
                                    {req.met ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-300" />}
                                    {req.text}
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-[#223945] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2 group ${isLoading ? 'opacity-80 cursor-wait transform-none' : ''}`}
                        >
                             {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Creando cuenta...</span>
                                </>
                            ) : (
                                <span className="group-hover:translate-x-0.5 transition-transform">Crear Cuenta</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-neutral-100">
                        <p className="text-sm text-neutral-600 font-medium">
                            ¿Ya tienes cuenta?{' '}
                            <Link
                                href="/login"
                                className="text-[#223945] hover:text-black font-bold hover:underline decoration-2 underline-offset-4 transition-all"
                            >
                                Inicia Sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
