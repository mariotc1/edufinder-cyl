import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface LogoutConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoggingOut?: boolean;
}

export default function LogoutConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    isLoggingOut = false
}: LogoutConfirmationModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden z-10 ring-1 ring-black/5"
                    >
                        {/* Close Button */}
                        <div className="absolute right-4 top-4 z-20">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-full bg-black/10 p-2 text-white/70 hover:text-red-400 hover:bg-white transition-all duration-200 focus:outline-none"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Header */}
                        <div className="bg-[#223945] px-6 pt-12 pb-8 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                    <LogOut className="h-9 w-9 text-white drop-shadow-md" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold !text-white tracking-tight mb-2" style={{ color: '#ffffff' }}>
                                        Cerrar Sesión
                                    </h3>
                                    <p className="text-sm !text-white/75 font-medium leading-relaxed max-w-[260px] mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
                                        ¿Estás seguro? Tendrás que volver a introducir tus credenciales para acceder.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="px-6 py-6 bg-white flex flex-col gap-3">
                            <button
                                onClick={onConfirm}
                                disabled={isLoggingOut}
                                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#223945] hover:bg-[#1a2c35] text-white text-sm font-bold rounded-2xl shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {isLoggingOut ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Cerrando...
                                    </>
                                ) : (
                                    <>
                                        <LogOut className="h-4 w-4 text-blue-200" />
                                        Cerrar Sesión
                                    </>
                                )}
                            </button>
                            <button
                                onClick={onClose}
                                disabled={isLoggingOut}
                                className="w-full py-3.5 px-4 border-2 border-neutral-100 text-neutral-600 text-sm font-bold rounded-2xl bg-white hover:bg-neutral-50 hover:border-[#223945]/20 hover:text-[#223945] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                Cancelar
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
