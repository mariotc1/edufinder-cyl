'use client';

import { motion } from 'framer-motion';
import { MapPin, GraduationCap, BookOpen, Building2, CheckCircle, Trophy } from 'lucide-react';

type StepId = 'welcome' | 'location' | 'study-type' | 'fp-details' | 'ownership' | 'searching' | 'results';

const steps = [
    { id: 'location', icon: MapPin, label: 'Ubicación', shortLabel: 'Zona' },
    { id: 'study-type', icon: GraduationCap, label: 'Estudios', shortLabel: 'Tipo' },
    { id: 'fp-details', icon: BookOpen, label: 'Detalles', shortLabel: 'FP' },
    { id: 'ownership', icon: Building2, label: 'Titularidad', shortLabel: 'Centro' },
    { id: 'results', icon: Trophy, label: 'Resultados', shortLabel: 'Fin' }
];

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
    const totalSteps = visibleSteps.length;

    return (
        <div className="px-4 sm:px-6 pt-3 pb-2">
            <div className="relative bg-white/50 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 border border-white/60 mx-auto max-w-md">
                <div className="flex items-center justify-center">
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
                                            w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300
                                            ${isCompleted
                                                ? 'bg-gradient-to-br from-[#223945] to-[#2d4a5e] shadow-sm shadow-[#223945]/20'
                                                : isCurrent
                                                    ? 'bg-gradient-to-br from-[#223945] to-blue-600 shadow-md shadow-blue-500/25 ring-2 ring-blue-100'
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
                                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                                            </motion.div>
                                        ) : (
                                            <Icon className={`w-3.5 h-3.5 transition-colors ${
                                                isCurrent ? 'text-white' : 'text-neutral-300'
                                            }`} />
                                        )}
                                    </motion.div>

                                    {/* Label - usar shortLabel en móvil si hay 5 pasos */}
                                    <span
                                        className={`text-[8px] sm:text-[9px] mt-0.5 font-medium whitespace-nowrap transition-colors ${
                                            isCurrent
                                                ? 'text-[#223945] font-semibold'
                                                : isCompleted
                                                    ? 'text-[#223945]/70'
                                                    : 'text-neutral-400'
                                        }`}
                                    >
                                        <span className={totalSteps > 4 ? 'sm:hidden' : 'hidden'}>{step.shortLabel}</span>
                                        <span className={totalSteps > 4 ? 'hidden sm:inline' : ''}>{step.label}</span>
                                    </span>
                                </div>

                                {/* Connector - línea simple */}
                                {!isLast && (
                                    <div className="flex-1 mx-1 sm:mx-1.5">
                                        <div className="h-0.5 rounded-full bg-neutral-200 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: isCompleted ? '100%' : '0%' }}
                                                transition={{ duration: 0.3 }}
                                                className="h-full bg-[#223945]"
                                            />
                                        </div>
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
