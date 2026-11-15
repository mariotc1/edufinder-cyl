'use client';

import { useComparison } from '@/context/ComparisonContext';
import { X, Trash2, Scale, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { centroName } from '@/lib/centro-format';

// Mismas letras y colores que las columnas del comparador
const COLUMNAS = [
    { letra: 'A', solid: 'bg-[#223945] ring-white/30' },
    { letra: 'B', solid: 'bg-teal-600 ring-teal-300/40' },
    { letra: 'C', solid: 'bg-pink-600 ring-pink-300/40' },
];

// Favoritos tiene su propia selección y el comparador ya muestra los centros
const RUTAS_SIN_BANDEJA = ['/comparador', '/favoritos'];

// COMPONENTE BANDEJA DE COMPARACIÓN
// Barra flotante con los centros añadidos desde las tarjetas mientras se busca
export default function ComparisonTray() {
    const { selectedCentros, removeFromCompare, clearComparison, pendiente } = useComparison();
    const pathname = usePathname();
    const [expanded, setExpanded] = useState(false);

    // Una comparación ya abierta no se queda colgando en la bandeja
    if (!pendiente || selectedCentros.length === 0 || RUTAS_SIN_BANDEJA.includes(pathname)) return null;

    const canCompare = selectedCentros.length >= 2;
    const ids = selectedCentros.map(c => c.id).join(',');

    return (
        <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="fixed z-[120] inset-x-3 bottom-[calc(var(--bottom-nav-height)+0.75rem)] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-6 md:w-[30rem]"
        >
            {/* Lista de centros elegidos */}
            <AnimatePresence>
                {expanded && (
                    <motion.ul
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="mb-2 p-1.5 rounded-2xl bg-white shadow-[0_20px_50px_-12px_rgba(34,57,69,0.45)] border border-neutral-100"
                    >
                        {selectedCentros.map((centro, i) => (
                            <li key={centro.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50">
                                <span className={`w-7 h-7 shrink-0 rounded-lg ${COLUMNAS[i].solid} text-white text-xs font-extrabold flex items-center justify-center`}>
                                    {COLUMNAS[i].letra}
                                </span>
                                <span className="flex-1 min-w-0 truncate text-sm font-semibold text-[#223945]">{centroName(centro)}</span>
                                <button
                                    onClick={() => removeFromCompare(centro.id)}
                                    aria-label={`Quitar ${centroName(centro)}`}
                                    className="p-1.5 rounded-full text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-2 p-2 pl-3 rounded-2xl bg-[#223945] text-white shadow-[0_20px_50px_-12px_rgba(34,57,69,0.6)] ring-1 ring-white/10">
                <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    aria-expanded={expanded}
                    className="flex-1 min-w-0 flex items-center gap-3 text-left"
                >
                    <span className="flex -space-x-1.5 shrink-0" aria-hidden="true">
                        {selectedCentros.map((c, i) => (
                            <span key={c.id} className={`w-7 h-7 rounded-lg ring-2 ${COLUMNAS[i].solid} text-white text-xs font-extrabold flex items-center justify-center`}>
                                {COLUMNAS[i].letra}
                            </span>
                        ))}
                    </span>
                    <span className="min-w-0">
                        <span className="block text-sm font-extrabold leading-tight truncate">
                            {canCompare ? `${selectedCentros.length} elegidos` : 'Elige otro centro'}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-white/60 font-medium leading-tight mt-0.5">
                            {expanded ? 'Ocultar' : 'Ver elegidos'}
                            <ChevronUp className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        </span>
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => { clearComparison(); setExpanded(false); }}
                    aria-label="Vaciar comparación"
                    className="w-10 h-10 shrink-0 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
                {canCompare ? (
                    <Link
                        href={`/comparador?centros=${ids}`}
                        className="h-10 shrink-0 px-4 rounded-xl bg-white !text-[#223945] text-sm font-extrabold flex items-center gap-1.5 shadow-md"
                    >
                        <Scale className="w-4 h-4" />
                        Comparar
                    </Link>
                ) : (
                    <span className="h-10 shrink-0 px-4 rounded-xl bg-white/15 text-white/70 text-sm font-bold flex items-center">
                        Falta 1
                    </span>
                )}
            </div>
        </motion.div>
    );
}
