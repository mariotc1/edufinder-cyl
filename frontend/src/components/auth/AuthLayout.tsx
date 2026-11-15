'use client';

import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import AuthBrandingPanel from './AuthBrandingPanel';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// FONDO DE MARCA SERENO
// Degradado de la web + dos halos de luz en las esquinas superiores + retícula de puntos que se desvanece
// (pattern=false la quita: en páginas largas se percibe como una cuadrícula)
export function BrandBackdrop({ pattern = true }: { pattern?: boolean }) {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            {/* Halos con degradados radiales (sin filter: blur, que en áreas grandes deja franjas) */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: [
                        'radial-gradient(38rem 32rem at 0% 0%, rgba(147,197,253,0.45), transparent 70%)',
                        'radial-gradient(40rem 34rem at 100% 0%, rgba(199,210,254,0.55), transparent 70%)',
                        'radial-gradient(44rem 26rem at 50% 100%, rgba(224,242,254,0.7), transparent 70%)',
                    ].join(', '),
                }}
            />
            {pattern && <div
                className="absolute inset-0 opacity-[0.35]"
                style={{
                    backgroundImage: 'radial-gradient(rgba(34,57,69,0.18) 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                    maskImage: 'radial-gradient(ellipse 70% 55% at 50% 0%, black 30%, transparent 75%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 70% 55% at 50% 0%, black 30%, transparent 75%)',
                }}
            />}
        </div>
    );
}

interface AuthLayoutProps {
    mode: 'login' | 'register';
    icon: LucideIcon;
    title: string;
    subtitle: string;
    footer: React.ReactNode;
    children: React.ReactNode;
}

// LAYOUT DE AUTENTICACIÓN
// Tarjeta siempre centrada con icono flotante; en escritorio se acompaña del panel de marca
export default function AuthLayout({ mode, icon: Icon, title, subtitle, footer, children }: AuthLayoutProps) {
    return (
        <div className="auth-ui relative isolate bg-brand-gradient min-h-[calc(100dvh-var(--mobile-header-height)-var(--bottom-nav-height))] md:min-h-[calc(100dvh-5rem)] flex items-center justify-center px-4 py-12 md:py-16">
            <BrandBackdrop />

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className={`relative w-full ${mode === 'register' ? 'max-w-md lg:max-w-5xl' : 'max-w-md lg:max-w-4xl'}`}
            >
                <div className="relative bg-white/85 backdrop-blur-xl rounded-3xl shadow-[0_24px_60px_-20px_rgba(34,57,69,0.35)] border border-white/70 lg:flex lg:overflow-hidden">
                    <AuthBrandingPanel mode={mode} />

                    {/* Línea de marca recortada con la forma de la tarjeta (el icono sobresale, así que la tarjeta no recorta) */}
                    <div aria-hidden="true" className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none lg:left-[44%] lg:rounded-none lg:rounded-tr-3xl">
                        <div className="h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300" />
                    </div>

                    <div className="relative flex-1 px-6 pt-14 pb-7 sm:px-8 lg:px-12 lg:py-12">

                        {/* Icono flotante sobre el borde (en escritorio, integrado en la columna) */}
                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:mx-auto lg:mb-6 lg:w-fit">
                            <motion.div
                                animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.2, 0.45] }}
                                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                                className="absolute inset-0 rounded-full bg-blue-400 blur-xl"
                            />
                            <div className="relative w-[4.5rem] h-[4.5rem] rounded-full bg-gradient-to-br from-[#223945] via-[#2d4a5e] to-blue-600 ring-[6px] ring-white shadow-xl shadow-[#223945]/30 flex items-center justify-center">
                                <Icon className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#223945]">{title}</h1>
                            <p className="mt-1.5 text-sm text-neutral-500">{subtitle}</p>
                        </div>

                        {children}

                        <div className="mt-6 pt-5 border-t border-neutral-100 text-center text-sm text-neutral-600">
                            {footer}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// CAMPO DE FORMULARIO CON ICONO
// Etiqueta discreta arriba e icono dentro; si es contraseña añade el botón de mostrar/ocultar
interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: LucideIcon;
    labelAction?: React.ReactNode;
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField(
    { label, icon: Icon, labelAction, type, id, ...props }, ref
) {
    const [visible, setVisible] = useState(false);
    const isPassword = type === 'password';
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5 px-1">
                <label htmlFor={id} className="text-[13px] font-semibold text-[#223945]">{label}</label>
                {labelAction}
            </div>
            <div className="relative group">
                <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#223945] transition-colors" />
                <input
                    ref={ref}
                    id={id}
                    type={isPassword && visible ? 'text' : type}
                    className={`w-full h-12 pl-10 ${isPassword ? 'pr-11' : 'pr-4'} rounded-xl bg-neutral-50 border border-neutral-200 text-[15px] font-medium text-neutral-800 placeholder:text-neutral-400 outline-none transition-all focus:bg-white focus:border-[#223945] focus:ring-4 focus:ring-[#223945]/10 disabled:opacity-60`}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setVisible(v => !v)}
                        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-neutral-400 hover:text-[#223945] transition-colors"
                    >
                        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </div>
    );
});

// BOTÓN PRINCIPAL
export function AuthSubmit({ loading, loadingText, children }: { loading: boolean; loadingText: string; children: React.ReactNode }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#223945] via-[#2d4a5e] to-blue-600 text-white font-bold shadow-lg shadow-[#223945]/25 hover:shadow-xl hover:shadow-[#223945]/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-wait disabled:hover:translate-y-0"
        >
            {loading ? (
                <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {loadingText}
                </>
            ) : children}
        </button>
    );
}

// ACCESO CON GOOGLE / GITHUB
export function SocialAuth({ label }: { label: string }) {
    return (
        <>
            <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
                <div className="relative flex justify-center">
                    <span className="px-3 bg-white/85 text-xs font-medium text-neutral-400">{label}</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <a
                    href={`${API_URL}/auth/google/redirect`}
                    className="h-11 flex items-center justify-center gap-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 font-semibold text-sm shadow-sm hover:bg-neutral-50 hover:border-neutral-300 active:scale-[0.98] transition-all"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                </a>
                <a
                    href={`${API_URL}/auth/github/redirect`}
                    className="h-11 flex items-center justify-center gap-2 rounded-xl bg-[#24292e] text-white font-semibold text-sm shadow-sm hover:bg-black active:scale-[0.98] transition-all"
                >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                    GitHub
                </a>
            </div>
        </>
    );
}

// MENSAJE DE ERROR
export function AuthError({ message }: { message: string }) {
    if (!message) return null;
    return (
        <div role="alert" className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm font-medium text-red-600 animate-in fade-in slide-in-from-top-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            {message}
        </div>
    );
}
