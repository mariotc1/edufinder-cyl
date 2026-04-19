'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

const searchingTexts = [
    'Analizando tus preferencias...',
    'Buscando centros ideales...',
    'Comparando opciones...',
    'Casi listo...'
];

export default function SearchingStep() {
    const [textIndex, setTextIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % searchingTexts.length);
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-16 px-4 text-center"
        >
            {/* Animación de círculos */}
            <div className="relative w-40 h-40 mx-auto mb-8">
                {/* Círculos pulsantes */}
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full border-2 border-blue-400/30"
                        initial={{ scale: 0.8, opacity: 0.8 }}
                        animate={{
                            scale: [0.8, 1.5, 2],
                            opacity: [0.8, 0.4, 0]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 2,
                            delay: i * 0.5,
                            ease: 'easeOut'
                        }}
                    />
                ))}

                {/* Icono central */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: 'easeInOut'
                    }}
                >
                    <div className="p-6 bg-gradient-to-br from-[#223945] to-blue-600 rounded-full shadow-2xl shadow-blue-500/40">
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>
                </motion.div>

                {/* Partículas flotantes */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={`particle-${i}`}
                        className="absolute w-2 h-2 bg-blue-400 rounded-full"
                        style={{
                            left: '50%',
                            top: '50%',
                        }}
                        animate={{
                            x: [0, Math.cos(i * 60 * Math.PI / 180) * 80],
                            y: [0, Math.sin(i * 60 * Math.PI / 180) * 80],
                            opacity: [1, 0],
                            scale: [1, 0.5]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 2,
                            delay: i * 0.2,
                            ease: 'easeOut'
                        }}
                    />
                ))}
            </div>

            {/* Texto animado */}
            <div className="h-8 overflow-hidden">
                <motion.p
                    key={textIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-lg font-medium text-[#223945]"
                >
                    {searchingTexts[textIndex]}
                </motion.p>
            </div>

            {/* Barra de progreso */}
            <div className="mt-6 w-48 mx-auto">
                <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#223945] to-blue-500 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{
                            duration: 3,
                            ease: 'easeInOut'
                        }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
