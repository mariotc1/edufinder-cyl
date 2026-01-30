'use client';

import { useComparison } from '@/context/ComparisonContext';
import { X, ArrowRight, Trash2, Scale } from 'lucide-react'; 
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function ComparisonTray() {
    const { selectedCentros, removeFromCompare, clearComparison, isOpen, setIsOpen } = useComparison();
    const pathname = usePathname();

    // Hide on comparison page itself or if empty
    if (selectedCentros.length === 0 || pathname === '/comparador') return null;

    return (
        <AnimatePresence>
            {/* FLOATING GLASS PILL CONTAINER */}
            <motion.div
                initial={{ y: 100, opacity: 0, x: '-50%' }}
                animate={{ y: 0, opacity: 1, x: '-50%' }}
                exit={{ y: 100, opacity: 0, x: '-50%' }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="
                    fixed bottom-4 sm:bottom-6 left-1/2 z-50 
                    flex items-center gap-2 sm:gap-4 p-2 pr-2 sm:pr-3 rounded-full 
                    bg-gradient-to-r from-[#1a2c38]/95 to-[#223945]/95 backdrop-blur-2xl 
                    border border-white/10 ring-1 ring-white/5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)]
                    w-auto max-w-[95vw] sm:max-w-xl mx-auto
                "
            >
                {/* LEFT: STATUS & AVATARS */}
                <div className="flex items-center gap-3 pl-1 sm:pl-2">
                    
                    {/* AVATAR STACK - Compact on mobile */}
                    <div className="flex items-center -space-x-3">
                        {selectedCentros.map((centro, idx) => (
                            <motion.div
                                key={centro.id}
                                initial={{ scale: 0, x: -10 }}
                                animate={{ scale: 1, x: 0 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className={`
                                    relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#1f313e] flex items-center justify-center text-xs font-bold
                                    bg-gradient-to-br from-white to-blue-50 text-[#223945] shadow-lg
                                    z-[${30 - idx}]
                                `}
                                title={centro.nombre}
                            >
                                {centro.nombre.charAt(0)}
                            </motion.div>
                        ))}
                    </div>

                    {/* TEXT INFO - Hidden on very small screens, shown on sm+ */}
                    <div className="hidden sm:flex flex-col">
                        <span className="text-[13px] font-bold text-white leading-none mb-0.5">
                            Comparando
                        </span>
                        <span className="text-[11px] font-medium text-blue-200/80">
                            {selectedCentros.length} / 3 centros
                        </span>
                    </div>
                </div>

                {/* DIVIDER */}
                <div className="h-6 w-px bg-white/10 mx-1 sm:mx-0"></div>

                {/* RIGHT: ACTIONS */}
                <div className="flex items-center gap-2">
                    {/* CLEAR BUTTON */}
                    <button
                        onClick={clearComparison}
                        className="p-2 sm:p-2.5 rounded-full text-white/40 hover:text-rose-400 hover:bg-white/5 transition-all active:scale-95"
                        title="Borrar todo"
                    >
                        <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </button>

                    {/* COMPARE BUTTON - High Contrast White (Premium) */}
                    <Link
                        href="/comparador"
                        className="
                            relative overflow-hidden group
                            flex items-center gap-2 
                            bg-white text-[#223945]
                            hover:bg-blue-50
                            px-4 sm:px-6 py-2 sm:py-2.5 rounded-full 
                            text-xs sm:text-sm font-bold 
                            shadow-[0_4px_15px_-3px_rgba(255,255,255,0.3)] hover:shadow-[0_6px_20px_-3px_rgba(255,255,255,0.4)]
                            transition-all hover:scale-105 active:scale-95
                        "
                    >
                        <span>Comparar</span>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
