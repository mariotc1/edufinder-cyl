'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Save, CheckCircle2, ChevronLeft } from 'lucide-react';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        if (!token || !email) {
             setStatus('error');
             setMessage('Enlace inválido o expirado.');
             return;
        }

        if (password !== passwordConfirmation) {
            setStatus('error');
            setMessage('Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 8) {
             setStatus('error');
             setMessage('La contraseña debe tener al menos 8 caracteres.');
             return;
        }

        try {
            await api.post('/reset-password', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation
            });
            setStatus('success');
            setMessage('¡Contraseña restablecida correctamente!');
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (error: any) {
             setStatus('error');
             setMessage(error.response?.data?.message || 'Error al restablecer la contraseña. Intenta solicitar un nuevo enlace.');
        }
    };

    return (
        <div className="min-h-screen bg-brand-gradient flex flex-col items-center justify-start p-4 pt-12 md:pt-16">
            <div className="w-full max-w-md">
                 {/* Back Link */}
                 <Link 
                    href="/login" 
                    className="inline-flex items-center gap-2 text-neutral-500 hover:text-[#223945] font-bold mb-6 transition-colors text-sm uppercase tracking-wide group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Ir al login
                </Link>

                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 overflow-hidden p-8">
                     {/* Decorative Top Gradient - Blue Theme */}
                     <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>

                    <div className="text-center mb-8">
                         {/* Icon Circle */}
                         <div className="mb-6 relative inline-block">
                            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                            <div className={`relative flex h-16 w-16 items-center justify-center rounded-full border border-neutral-100 shadow-md transition-colors ${status === 'success' ? 'bg-green-50' : 'bg-white'}`}>
                                {status === 'success' ? (
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                ) : (
                                    <Lock className="w-8 h-8 text-[#223945]" />
                                )}
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-[#223945] mb-2 tracking-tight">
                            Nueva Contraseña
                        </h2>
                        <p className="text-neutral-500 font-medium text-sm">
                            Crea una contraseña segura para tu cuenta.
                        </p>
                    </div>

                    {status === 'success' ? (
                        <div className="bg-green-50 border border-green-100 text-green-700 p-6 rounded-xl flex flex-col items-center gap-3 text-center">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                            <p className="font-bold text-lg">¡Contraseña Actualizada!</p>
                            <p className="text-sm">Te estamos redirigiendo al login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                             {status === 'error' && (
                                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 text-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    {message}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-bold text-[#223945] uppercase tracking-wider ml-1">
                                        <Lock className="w-3.5 h-3.5" />
                                        Nueva Contraseña
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type={showPassword ? "text" : "password"}
                                            required
                                            placeholder="••••••••"
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 border-2 border-transparent focus:bg-white focus:border-[#223945] focus:ring-4 focus:ring-[#223945]/10 outline-none transition-all font-medium text-neutral-700 placeholder:text-neutral-400 pr-10"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#223945] transition-colors focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-bold text-[#223945] uppercase tracking-wider ml-1">
                                        <Lock className="w-3.5 h-3.5" />
                                        Confirmar Contraseña
                                    </label>
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Repite tu contraseña"
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 border-2 border-transparent focus:bg-white focus:border-[#223945] focus:ring-4 focus:ring-[#223945]/10 outline-none transition-all font-medium text-neutral-700 placeholder:text-neutral-400"
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={status === 'loading'}
                                className="w-full bg-[#223945] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {status === 'loading' ? (
                                    <span>Guardando...</span>
                                ) : (
                                    <>
                                        <span className="group-hover:translate-x-0.5 transition-transform">Guardar Nueva Contraseña</span>
                                        <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ResetPassword() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
