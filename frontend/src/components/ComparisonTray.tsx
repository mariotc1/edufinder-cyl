'use client';

import { useComparison } from '@/context/ComparisonContext';
import { X, Scale, ArrowRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function ComparisonTray() {
    const { selectedCentros, removeFromCompare, clearComparison, isOpen, setIsOpen } = useComparison();
    const pathname = usePathname();

    // Hide on comparison page itself to avoid overlap
    if (selectedCentros.length === 0 || pathname === '/comparador') return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-4 w-full max-w-2xl flex items-center justify-between gap-4"
                    >
                        {/* Header / Counter */}
                        <div className="flex items-center gap-3">
                            <div className="bg-[#223945] text-white p-2.5 rounded-xl shadow-lg shadow-[#223945]/20">
                                <Scale className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[#223945] font-bold text-sm leading-tight">
                                    Comparador
                                </span>
                                <span className="text-neutral-500 text-xs font-medium">
                                    {selectedCentros.length} / 3 centros
                                </span>
                            </div>
                        </div>

                        {/* Selected Avatars / Names (Desktop) */}
                        <div className="flex-1 hidden md:flex items-center gap-2 justify-center">
                            {selectedCentros.map(centro => (
                                <div key={centro.id} className="relative group bg-neutral-50 border border-neutral-100 px-3 py-1.5 rounded-lg flex items-center gap-2 max-w-[140px]">
                                    <span className="text-xs font-medium text-neutral-700 truncate">
                                        {centro.nombre}
                                    </span>
                                    <button 
                                        onClick={() => removeFromCompare(centro.id)}
                                        className="text-neutral-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                             <button
                                onClick={clearComparison}
                                className="p-2.5 rounded-xl hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                                title="Limpiar todo"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                             
                             <Link
                                href="/comparador"
                                className="bg-[#223945] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                             >
                                <span>Comparar</span>
                                <ArrowRight className="w-4 h-4" />
                             </Link>
                             
                             <button
                                onClick={() => setIsOpen(false)}
                                className="md:hidden p-2 text-neutral-400"
                             >
                                 <X className="w-5 h-5" />
                             </button>
                        </div>
                    </motion.div>
                </div>
            )}
            
            {/* Minimized Button (Mobile Fab) if closed but has items */}
            {!isOpen && selectedCentros.length > 0 && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-24 right-4 z-40 bg-[#223945] text-white p-4 rounded-full shadow-xl shadow-[#223945]/30 flex items-center gap-2"
                >
                    <Scale className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white">
                        {selectedCentros.length}
                    </span>
                </motion.button>
            )}
        </AnimatePresence>
    );
}
