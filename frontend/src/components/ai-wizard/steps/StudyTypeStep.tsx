'use client';

import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Baby, Heart, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const studyTypes = [
    {
        id: 'FP',
        name: 'Formación Profesional',
        description: 'Ciclos formativos de grado básico, medio y superior',
        icon: GraduationCap,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        selectedBorder: 'border-purple-500'
    },
    {
        id: 'ESO',
        name: 'ESO / Bachillerato',
        description: 'Educación Secundaria Obligatoria y Bachillerato',
        icon: BookOpen,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        selectedBorder: 'border-blue-500'
    },
    {
        id: 'PRIMARIA',
        name: 'Infantil y Primaria',
        description: 'Educación Infantil y Primaria',
        icon: Baby,
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        selectedBorder: 'border-green-500'
    },
    {
        id: 'ESPECIAL',
        name: 'Educación Especial',
        description: 'Centros de educación especial',
        icon: Heart,
        color: 'from-rose-500 to-rose-600',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
        selectedBorder: 'border-rose-500'
    }
];

interface StudyTypeStepProps {
    selectedType: string | null;
    onSelectType: (type: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function StudyTypeStep({
    selectedType,
    onSelectType,
    onNext,
    onBack
}: StudyTypeStepProps) {
    const canContinue = selectedType !== null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="py-3 px-4 sm:px-6 flex flex-col"
        >
            {/* Header compacto */}
            <div className="text-center mb-2">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="inline-flex mb-1.5"
                >
                    <div className="relative">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                            className="absolute inset-0 bg-[#223945] rounded-full"
                        />
                        <div className="relative p-2.5 bg-gradient-to-br from-[#223945] to-blue-600 rounded-full shadow-lg shadow-[#223945]/25">
                            <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </motion.div>
                <h3 className="text-base sm:text-lg font-bold text-[#223945] mb-0.5">
                    ¿Qué tipo de estudios buscas?
                </h3>
                <p className="text-neutral-500 text-[11px] sm:text-xs">
                    Selecciona el nivel educativo
                </p>
            </div>

            {/* Opciones */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                {studyTypes.map((type, index) => {
                    const isSelected = selectedType === type.id;
                    const Icon = type.icon;

                    return (
                        <motion.button
                            key={type.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectType(type.id)}
                            className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                                isSelected
                                    ? `${type.selectedBorder} ${type.bgColor} shadow-md`
                                    : `${type.borderColor} bg-white hover:${type.bgColor}`
                            }`}
                        >
                            {/* Indicador de selección */}
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-2 right-2 w-4 h-4 bg-[#223945] rounded-full flex items-center justify-center"
                                >
                                    <Check className="w-2.5 h-2.5 text-white" />
                                </motion.div>
                            )}

                            <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${type.color} mb-2`}>
                                <Icon className="w-4 h-4 text-white" />
                            </div>

                            <h4 className="font-bold text-[13px] text-[#223945] mb-0.5 leading-tight">{type.name}</h4>
                            <p className="text-[10px] text-neutral-500 leading-tight">{type.description}</p>
                        </motion.button>
                    );
                })}
            </div>

            {/* Botones navegación */}
            <div className="flex gap-2 mt-auto">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onBack}
                    className="flex items-center justify-center gap-1 px-3 py-2.5 bg-white border border-neutral-200 text-neutral-600 font-semibold rounded-xl hover:bg-neutral-50 transition-colors text-[13px]"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Atrás
                </motion.button>
                <motion.button
                    whileHover={canContinue ? { scale: 1.02, y: -1 } : {}}
                    whileTap={canContinue ? { scale: 0.98 } : {}}
                    onClick={onNext}
                    disabled={!canContinue}
                    className={`flex-1 relative flex items-center justify-center gap-1.5 px-4 py-2.5 font-semibold rounded-xl transition-all text-[13px] overflow-hidden ${
                        canContinue
                            ? 'bg-gradient-to-r from-[#223945] via-[#2d4a5e] to-blue-600 text-white shadow-lg shadow-[#223945]/25 hover:shadow-xl hover:shadow-[#223945]/30'
                            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    }`}
                >
                    <span>Continuar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                    {/* Shine effect */}
                    {canContinue && (
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{ repeat: Infinity, duration: 3, ease: 'linear', repeatDelay: 2 }}
                            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                        />
                    )}
                </motion.button>
            </div>
        </motion.div>
    );
}
