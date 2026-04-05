'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

interface AIWizardTriggerButtonProps {
    onClick: () => void;
}

export default function AIWizardTriggerButton({ onClick }: AIWizardTriggerButtonProps) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-[#223945] via-blue-600 to-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all overflow-hidden"
        >
            {/* Efecto de brillo */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: 'linear',
                    repeatDelay: 2
                }}
            />

            {/* Contenido */}
            <div className="relative flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                </div>
                <span>Encuentra tu centro ideal con IA</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </div>
        </motion.button>
    );
}
