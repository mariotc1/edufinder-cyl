'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 pt-20 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full text-center"
      >
        {/* Illustration — graduation cap */}
        <div className="mx-auto mb-6 w-60 h-52">
          <svg viewBox="0 0 260 210" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="capShade" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2d4a5c" />
                <stop offset="100%" stopColor="#1a2c35" />
              </linearGradient>
              <filter id="softShadow">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#223945" floodOpacity="0.12" />
              </filter>
            </defs>

            {/* Ground shadow */}
            <ellipse cx="128" cy="192" rx="70" ry="9" fill="#223945" opacity="0.06" />

            {/* Graduation cap — board ON TOP, dome BELOW, slightly tilted */}
            <g transform="translate(128,108) rotate(-6)" filter="url(#softShadow)">
              {/* Board (flat piece on top) */}
              <rect x="-62" y="-52" width="124" height="12" rx="4" fill="#223945" />
              {/* Board highlight */}
              <rect x="-62" y="-52" width="124" height="4" rx="4" fill="#2d4a5c" />
              {/* Dome (below the board) */}
              <path d="M -32 -40 L -28 0 L 28 0 L 32 -40 Z" fill="url(#capShade)" />
              {/* Dome side shading */}
              <path d="M -32 -40 L -28 0 L -18 0 L -22 -40 Z" fill="#223945" opacity="0.2" />
            </g>

            {/* Tassel — hangs from top-right corner of board */}
            <line x1="184" y1="56" x2="200" y2="88" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="196" y1="88" x2="196" y2="114" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
            <line x1="201" y1="88" x2="201" y2="110" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            <line x1="206" y1="88" x2="206" y2="106" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="201" cy="116" rx="9" ry="4" fill="#3b82f6" opacity="0.5" />

            {/* Subtle decorative dots */}
            <circle cx="44" cy="80" r="4" fill="#3b82f6" opacity="0.14" />
            <circle cx="216" cy="68" r="3" fill="#223945" opacity="0.1" />
            <circle cx="38" cy="150" r="5" fill="#3b82f6" opacity="0.1" />
            <circle cx="220" cy="148" r="3" fill="#223945" opacity="0.08" />
          </svg>
        </div>

        {/* 404 */}
        <div className="text-[9rem] sm:text-[11rem] font-black tracking-tighter text-[#223945] leading-none mb-4 select-none">
          404
        </div>

        {/* Text */}
        <h1 className="text-2xl font-bold text-neutral-800 mb-3">
          Página no encontrada
        </h1>
        <p className="text-neutral-500 text-sm leading-relaxed max-w-xs mx-auto mb-10">
          La ruta que buscas no existe o ha sido movida. Puedes volver atrás o explorar los centros educativos.
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
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-white text-[#223945] font-bold text-sm rounded-2xl border-2 border-[#223945]/15 shadow-sm hover:border-[#223945]/30 hover:-translate-y-0.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver atrás
          </button>
        </div>

        {/* Branding */}
        <p className="mt-14 text-xs text-neutral-300 font-medium tracking-wide">
          EduFinder CYL · Centros educativos de Castilla y León
        </p>
      </motion.div>
    </div>
  );
}
