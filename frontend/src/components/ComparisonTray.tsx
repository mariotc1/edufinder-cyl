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
                        className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-4 w-full max-w-4xl flex items-center justify-between gap-4"
                    >
                        {/* Header / Counter */}
                        <div className="flex items-center gap-3 shrink-0">
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
                        <div className="flex-1 hidden md:flex items-center gap-3 justify-center overflow-x-auto px-2 scrollbar-hide">
                            {selectedCentros.map(centro => (
                                <div key={centro.id} className="relative group bg-white border border-neutral-100 shadow-sm pl-3 pr-2 py-2 rounded-xl flex items-center gap-3 w-48 hover:border-[#223945]/30 transition-all shrink-0">
                                    {/* Icon/Avatar Placeholder */}
                                    <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-500 border border-neutral-200 shrink-0">
                                        {centro.nombre.charAt(0)}
                                    </div>
                                    
                                    <span className="text-xs font-bold text-neutral-700 truncate min-w-0 flex-1" title={centro.nombre}>
                                        {centro.nombre}
                                    </span>
                                    
                                    <button 
                                        onClick={() => removeFromCompare(centro.id)}
                                        className="text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg p-1 transition-colors shrink-0"
                                        title="Eliminar"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                             <button
                                onClick={clearComparison}
                                className="p-2.5 rounded-xl hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                                title="Limpiar todo"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                             
                             <Link
                                href="/comparador"
                                className="bg-[#223945] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
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
