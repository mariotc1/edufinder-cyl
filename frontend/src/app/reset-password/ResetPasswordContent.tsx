'use client';

import { useState, useMemo } from 'react';
import api from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, Lock, Eye, EyeOff, ChevronLeft, Loader2, CheckCircle } from 'lucide-react';

export default function ResetPasswordContent() {
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const token = searchParams.get('token');
    const email = searchParams.get('email');

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
        setMessage(null);

        if (!isPasswordValid) {
            setMessage({ text: 'Por favor cumple todos los requisitos de la contraseña', type: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/reset-password', {
                email,
                token,
                password,
                password_confirmation: passwordConfirmation
            });
            setMessage({ text: 'Contraseña restablecida correctamente. Redirigiendo...', type: 'success' });
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error: any) {
             setMessage({ 
                text: error.response?.data?.message || 'Error al restablecer contraseña', 
                type: 'error' 
            });
            setIsLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen bg-brand-gradient flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                        <KeyRound className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">Enlace inválido</h2>
                    <p className="text-neutral-500 mb-6">El enlace de recuperación es inválido o ha expirado.</p>
                    <Link href="/login" className="inline-block bg-[#223945] text-white px-6 py-2.5 rounded-xl font-bold hover:shadow-lg transition-all">
                        Volver al Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-gradient flex flex-col items-center justify-start p-4 pt-12 md:pt-16">
            <div className="w-full max-w-md">
                 <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-neutral-500 hover:text-[#223945] font-bold mb-6 transition-colors text-sm uppercase tracking-wide group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Volver
                </Link>

                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 overflow-hidden p-8">
                     <div className="text-center mb-8">
                        <div className="mb-6 relative inline-block">
                            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white border border-neutral-100 shadow-md">
                                <KeyRound className="w-8 h-8 text-[#223945]" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-[#223945] mb-2">
                            Restablecer Contraseña
                        </h2>
                        <p className="text-neutral-500 text-sm font-medium">
                            Introduce tu nueva contraseña
                        </p>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-center justify-center gap-2 ${
                            message.type === 'success' 
                                ? 'bg-green-50 text-green-700 border border-green-100' 
                                : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-[#223945] uppercase tracking-wider ml-1">
                                <Lock className="w-3.5 h-3.5" />
                                Nueva Contraseña
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
                                Confirmar Contraseña
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
                            className={`w-full bg-[#223945] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2 ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Restableciendo...</span>
                                </>
                            ) : (
                                'Restablecer Contraseña'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
