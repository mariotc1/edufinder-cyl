'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, MapPin, GraduationCap, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface WelcomeStepProps {
    onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
    const { user } = useAuth();

    // Extraer solo el primer nombre para un saludo más personal
    const firstName = user?.name?.split(' ')[0];

    const features = [
        { icon: MapPin, text: 'Tu ubicación' },
        { icon: GraduationCap, text: 'Tus estudios' },
        { icon: Zap, text: 'Resultados al instante' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative text-center py-10 px-6 overflow-hidden"
        >
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
                    className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-100/40 to-transparent rounded-full blur-2xl"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                    className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-[#223945]/10 to-transparent rounded-full blur-2xl"
                />
            </div>

            {/* Contenido principal */}
            <div className="relative z-10">
                {/* Icono principal animado */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="relative inline-flex">
                        {/* Anillo exterior pulsante */}
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.3, 0.1, 0.3]
                            }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                            className="absolute inset-0 bg-gradient-to-r from-[#223945] to-blue-500 rounded-full"
                        />
                        {/* Anillo intermedio */}
                        <motion.div
                            animate={{
                                scale: [1, 1.15, 1],
                                opacity: [0.5, 0.2, 0.5]
                            }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 0.3 }}
                            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full blur-md"
                        />
                        {/* Icono central */}
                        <div className="relative p-5 bg-gradient-to-br from-[#223945] via-[#2d4a5e] to-blue-600 rounded-full shadow-xl shadow-[#223945]/30">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                    </div>
                </motion.div>

                {/* Título personalizado */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl sm:text-3xl font-bold text-[#223945] mb-2"
                >
                    {firstName ? (
                        <>¡Hola, <span className="text-blue-600">{firstName}</span>!</>
                    ) : (
                        '¡Hola!'
                    )}
                </motion.h2>

                {/* Subtítulo */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6"
                >
                    <p className="text-neutral-600 mb-1">
                        Voy a ayudarte a encontrar
                    </p>
                    <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#223945] via-blue-600 to-blue-500 bg-clip-text text-transparent">
                        tu centro educativo ideal
                    </p>
                </motion.div>

                {/* Features pills */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap justify-center gap-2 mb-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.text}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-sm border border-neutral-100"
                        >
                            <feature.icon className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-xs font-medium text-neutral-600">{feature.text}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Descripción */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-neutral-500 text-sm max-w-xs mx-auto mb-8 leading-relaxed"
                >
                    Unas preguntas rápidas y te mostraré las <span className="font-medium text-neutral-700">mejores opciones</span> para ti.
                </motion.p>

                {/* Botón comenzar */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onNext}
                    className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#223945] via-[#2d4a5e] to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-[#223945]/25 hover:shadow-xl hover:shadow-[#223945]/30 transition-all duration-300"
                >
                    <span>Comenzar</span>
                    <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    >
                        <ArrowRight className="w-5 h-5" />
                    </motion.div>
                    {/* Shine effect */}
                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{ repeat: Infinity, duration: 3, ease: 'linear', repeatDelay: 2 }}
                            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                        />
                    </div>
                </motion.button>
            </div>
        </motion.div>
    );
}
