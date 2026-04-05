'use client';

import { motion } from 'framer-motion';
import { MapPin, GraduationCap, BookOpen, Building2, Search, CheckCircle } from 'lucide-react';

type StepId = 'welcome' | 'location' | 'study-type' | 'fp-details' | 'ownership' | 'searching' | 'results';

const steps = [
    { id: 'location', icon: MapPin, label: 'Ubicación' },
    { id: 'study-type', icon: GraduationCap, label: 'Estudios' },
    { id: 'fp-details', icon: BookOpen, label: 'Detalles' },
    { id: 'ownership', icon: Building2, label: 'Titularidad' },
    { id: 'results', icon: CheckCircle, label: 'Resultados' }
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

    return (
        <div className="px-6 py-4 border-b border-neutral-100">
            <div className="flex items-center justify-between">
                {visibleSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index < currentIndex;
                    const isCurrent = step.id === currentStep;
                    const isPending = index > currentIndex;

                    return (
                        <div key={step.id} className="flex items-center">
                            {/* Step indicator */}
                            <div className="flex flex-col items-center">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: isCurrent ? 1.1 : 1,
                                        backgroundColor: isCompleted
                                            ? '#223945'
                                            : isCurrent
                                                ? '#223945'
                                                : '#e5e7eb'
                                    }}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                        isCompleted || isCurrent ? 'shadow-md' : ''
                                    }`}
                                >
                                    {isCompleted ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                        >
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        </motion.div>
                                    ) : (
                                        <Icon className={`w-4 h-4 ${
                                            isCurrent ? 'text-white' : 'text-neutral-400'
                                        }`} />
                                    )}
                                </motion.div>
                                <span className={`text-[10px] mt-1 font-medium hidden sm:block ${
                                    isCurrent ? 'text-[#223945]' : 'text-neutral-400'
                                }`}>
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector line */}
                            {index < visibleSteps.length - 1 && (
                                <div className="w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 bg-neutral-200 relative overflow-hidden">
                                    <motion.div
                                        className="absolute inset-y-0 left-0 bg-[#223945]"
                                        initial={{ width: '0%' }}
                                        animate={{
                                            width: isCompleted ? '100%' : '0%'
                                        }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
