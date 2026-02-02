'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { Mail, ChevronLeft, Send, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await api.post('/forgot-password', { email });
            setStatus('success');
            setMessage(res.data.message || 'Te hemos enviado un enlace de recuperación a tu correo.');
        } catch (err: any) {
            setStatus('error');
            console.error('Forgot password error:', err);
            const msg = err.response?.data?.message 
                || err.response?.data?.email?.[0] 
                || err.message 
                || 'No pudimos enviar el correo. Verifica que tu email sea correcto.';
            setMessage(msg);
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
                    Volver al login
                </Link>

                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 overflow-hidden p-8">
                    {/* Decorative Top Gradient - Blue Theme */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>

                    <div className="text-center mb-8">
                        {/* Icon Circle */}
                        <div className="mb-6 relative inline-block">
                            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white border border-neutral-100 shadow-md">
                                <Mail className="w-8 h-8 text-[#223945]" />
                            </div>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-[#223945] mb-2 tracking-tight">
                            Recuperar Contraseña
                        </h2>
                        <p className="text-neutral-500 font-medium text-sm">
                            Introduce tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
                        </p>
                    </div>

                    {status === 'success' ? (
                        <div className="text-center space-y-6">
                            <div className="bg-green-50 border border-green-100 text-green-700 p-6 rounded-xl flex flex-col items-center gap-3">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                                <p className="font-bold">{message}</p>
                            </div>
                             <p className="text-xs text-neutral-400">
                                Revisa tu bandeja de entrada (y la carpeta de spam por si acaso).
                            </p>
                            <Link 
                                href="/login"
                                className="inline-block w-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 px-8 py-3.5 rounded-xl font-bold transition-all text-sm uppercase tracking-wide"
                            >
                                Volver a Iniciar Sesión
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {status === 'error' && (
                                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    {message}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="email" className="flex items-center gap-2 text-xs font-bold text-[#223945] uppercase tracking-wider ml-1">
                                    <Mail className="w-3.5 h-3.5" />
                                    Correo electrónico
                                </label>
                                <input 
                                    id="email"
                                    type="email" 
                                    required
                                    placeholder="tu@email.com"
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 border-2 border-transparent focus:bg-white focus:border-[#223945] focus:ring-4 focus:ring-[#223945]/10 outline-none transition-all font-medium text-neutral-700 placeholder:text-neutral-400"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={status === 'loading'}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={status === 'loading'}
                                className="w-full bg-[#223945] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {status === 'loading' ? (
                                    <span>Enviando...</span>
                                ) : (
                                    <>
                                        <span className="group-hover:translate-x-0.5 transition-transform">Enviar Enlace</span>
                                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
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
