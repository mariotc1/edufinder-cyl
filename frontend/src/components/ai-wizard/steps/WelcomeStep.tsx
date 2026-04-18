'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface WelcomeStepProps {
    onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
    const { user } = useAuth();

    // Extraer solo el primer nombre para un saludo más personal
    const firstName = user?.name?.split(' ')[0];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-8 px-4"
        >
            {/* Icono animado */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="mb-6"
            >
                <div className="relative inline-flex">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        className="absolute inset-0 bg-gradient-to-r from-[#223945] to-blue-500 rounded-full blur-xl"
                    />
                    <div className="relative p-5 bg-gradient-to-br from-[#223945] to-blue-600 rounded-full shadow-2xl">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                </div>
            </motion.div>

            {/* Título personalizado */}
            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-3xl font-bold text-[#223945] mb-3"
            >
                {firstName ? `¡Hola, ${firstName}!` : '¡Hola!'}
            </motion.h2>

            {/* Subtítulo */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-neutral-600 mb-2"
            >
                Voy a ayudarte a encontrar
            </motion.p>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl font-bold bg-gradient-to-r from-[#223945] via-blue-600 to-blue-500 bg-clip-text text-transparent mb-8"
            >
                tu centro educativo ideal
            </motion.p>

            {/* Descripción */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-neutral-500 text-sm max-w-sm mx-auto mb-8"
            >
                Te haré unas preguntas sencillas para entender qué buscas y mostrarte las mejores opciones para ti.
            </motion.p>

            {/* Botón comenzar */}
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onNext}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#223945] via-blue-600 to-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow"
            >
                Comenzar
                <ArrowRight className="w-5 h-5" />
            </motion.button>
        </motion.div>
    );
}
