'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AIWizardTriggerButtonProps {
    onClick: () => void;
}

export default function AIWizardTriggerButton({ onClick }: AIWizardTriggerButtonProps) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="group relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#223945] to-[#2d4a5a] text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-all overflow-hidden"
        >
            {/* Shimmer sutil */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: 'easeInOut',
                    repeatDelay: 2
                }}
            />

            <Sparkles className="w-4 h-4 text-blue-300 relative z-10" />
            <span className="relative z-10">Te ayudo a elegir</span>

            {/* Badge IA con efecto glow */}
            <motion.span
                className="relative z-10 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-md text-[10px] font-bold tracking-wider"
                animate={{
                    boxShadow: [
                        '0 0 8px 2px rgba(59, 130, 246, 0.4)',
                        '0 0 20px 4px rgba(59, 130, 246, 0.6)',
                        '0 0 8px 2px rgba(59, 130, 246, 0.4)'
                    ]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            >
                IA
            </motion.span>
        </motion.button>
    );
}
