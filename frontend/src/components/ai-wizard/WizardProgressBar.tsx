'use client';

import { motion } from 'framer-motion';
import { MapPin, GraduationCap, BookOpen, Building2, CheckCircle, Trophy } from 'lucide-react';

type StepId = 'welcome' | 'location' | 'study-type' | 'fp-details' | 'ownership' | 'searching' | 'results';

const steps = [
    { id: 'location', icon: MapPin, label: 'Ubicación' },
    { id: 'study-type', icon: GraduationCap, label: 'Estudios' },
    { id: 'fp-details', icon: BookOpen, label: 'Detalles' },
    { id: 'ownership', icon: Building2, label: 'Titularidad' },
    { id: 'results', icon: Trophy, label: 'Resultados' }
];

// Número fijo de puntos entre cada paso
const DOTS_COUNT = 3;

interface WizardProgressBarProps {
    currentStep: StepId;
    showFPDetails: boolean;
}

export default function WizardProgressBar({ currentStep, showFPDetails }: WizardProgressBarProps) {
    // No mostrar en welcome o searching
    if (currentStep === 'welcome' || currentStep === 'searching') {
        return null;
    }

    // Filtrar steps según si se muestra FP details
    const visibleSteps = showFPDetails
        ? steps
        : steps.filter(s => s.id !== 'fp-details');

    const currentIndex = visibleSteps.findIndex(s => s.id === currentStep);

    return (
        <div className="px-3 sm:px-6 pt-4 pb-3">
            {/* Contenedor compacto con fondo sutil */}
            <div className="relative bg-white/50 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2.5 border border-white/60">
                <div className="flex items-center justify-between">
                    {visibleSteps.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index < currentIndex;
                        const isCurrent = step.id === currentStep;
                        const isLast = index === visibleSteps.length - 1;

                        return (
                            <div key={step.id} className="flex items-center flex-1 last:flex-none">
                                {/* Step indicator */}
                                <div className="flex flex-col items-center relative z-10">
                                    <motion.div
                                        initial={false}
                                        className={`
                                            w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300
                                            ${isCompleted
                                                ? 'bg-gradient-to-br from-[#223945] to-[#2d4a5e] shadow-md shadow-[#223945]/20'
                                                : isCurrent
                                                    ? 'bg-gradient-to-br from-[#223945] to-blue-600 shadow-lg shadow-blue-500/25 ring-[3px] ring-blue-100'
                                                    : 'bg-white border-2 border-neutral-200'
                                            }
                                        `}
                                    >
                                        {isCompleted ? (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: 'spring', stiffness: 200 }}
                                            >
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            </motion.div>
                                        ) : (
                                            <Icon className={`w-4 h-4 transition-colors ${
                                                isCurrent ? 'text-white' : 'text-neutral-300'
                                            }`} />
                                        )}
                                    </motion.div>

                                    {/* Label */}
                                    <span
                                        className={`text-[9px] sm:text-[10px] mt-1 font-medium whitespace-nowrap transition-colors ${
                                            isCurrent
                                                ? 'text-[#223945] font-semibold'
                                                : isCompleted
                                                    ? 'text-[#223945]/70'
                                                    : 'text-neutral-400'
                                        }`}
                                    >
                                        {step.label}
                                    </span>
                                </div>

                                {/* Connector - puntos uniformes */}
                                {!isLast && (
                                    <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 mx-1.5 sm:mx-2">
                                        {[...Array(DOTS_COUNT)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={false}
                                                animate={{
                                                    backgroundColor: isCompleted ? '#223945' : '#e5e7eb',
                                                    scale: isCompleted ? 1 : 1
                                                }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: isCompleted ? i * 0.1 : 0
                                                }}
                                                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
