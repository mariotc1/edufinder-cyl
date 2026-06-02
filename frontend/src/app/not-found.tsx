import Link from 'next/link';
import { GraduationCap, Search, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#dbeafe] via-white to-[#eff6ff] flex items-center justify-center px-6 py-16">
            <div className="max-w-md w-full text-center">

                {/* Icono decorativo */}
                <div className="relative mx-auto w-28 h-28 mb-8">
                    <div className="absolute inset-0 rounded-full bg-[#223945]/8 animate-pulse" />
                    <div className="absolute inset-4 rounded-full bg-white/60 backdrop-blur-sm shadow-inner" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <GraduationCap className="w-12 h-12 text-[#223945]/40" strokeWidth={1.5} />
                    </div>
                    <div className="absolute top-1 right-4 w-2.5 h-2.5 rounded-full bg-blue-300/70" />
                    <div className="absolute bottom-2 left-3 w-1.5 h-1.5 rounded-full bg-[#223945]/20" />
                </div>

                {/* 404 */}
                <p className="text-8xl sm:text-9xl font-black text-[#223945]/10 leading-none tracking-tighter select-none -mb-6">
                    404
                </p>
                <p className="text-5xl sm:text-6xl font-black text-[#223945] leading-none tracking-tighter mb-6">
                    404
                </p>

                {/* Texto */}
                <h1 className="text-xl sm:text-2xl font-bold text-[#223945] mb-3">
                    Página no encontrada
                </h1>
                <p className="text-neutral-500 text-sm sm:text-base leading-relaxed max-w-xs mx-auto mb-10">
                    La ruta que buscas no existe o ha sido movida. Vuelve al inicio o busca un centro educativo.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#223945] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#223945]/20 hover:bg-[#1a2c36] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#223945]/25 transition-all"
                    >
                        <Search className="w-4 h-4" />
                        Buscar centros
                    </Link>
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-white text-[#223945] font-bold text-sm rounded-2xl border-2 border-[#223945]/15 shadow-sm hover:border-[#223945]/30 hover:-translate-y-0.5 transition-all"
                    >
                        <Home className="w-4 h-4" />
                        Inicio
                    </Link>
                </div>

                {/* Branding sutil */}
                <p className="mt-14 text-xs text-neutral-300 font-medium tracking-wide">
                    EduFinder CYL · Centros educativos de Castilla y León
                </p>
            </div>
        </div>
    );
}
