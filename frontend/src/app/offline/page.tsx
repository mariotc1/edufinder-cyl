'use client';

import { WifiOff, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card principal */}
        <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-hidden">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-[#223945] via-blue-600 to-blue-400 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
              <WifiOff className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Sin conexión</h1>
            <p className="text-white/80 text-sm">
              Parece que no tienes conexión a internet
            </p>
          </div>

          {/* Contenido */}
          <div className="p-8 text-center">
            <p className="text-neutral-600 mb-8">
              No te preocupes, cuando recuperes la conexión podrás seguir
              explorando centros educativos en Castilla y León.
            </p>

            {/* Acciones */}
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full flex items-center justify-center gap-2 bg-[#223945] text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                Reintentar conexión
              </button>

              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 bg-neutral-100 text-neutral-700 px-6 py-3.5 rounded-xl font-bold hover:bg-neutral-200 transition-all"
              >
                <Home className="w-5 h-5" />
                Ir al inicio
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-sm text-blue-700 font-medium">
                <strong>Tip:</strong> Si instalaste la app, algunas páginas que
                visitaste antes podrían estar disponibles sin conexión.
              </p>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="mt-8 text-center">
          <p className="text-neutral-400 text-sm font-medium">EduFinder CYL</p>
        </div>
      </div>
    </div>
  );
}
