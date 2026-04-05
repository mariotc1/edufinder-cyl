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
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="py-6 px-4"
        >
            {/* Header */}
            <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-[#223945]/10 rounded-xl mb-3">
                    <GraduationCap className="w-6 h-6 text-[#223945]" />
                </div>
                <h3 className="text-xl font-bold text-[#223945] mb-2">
                    ¿Qué tipo de estudios buscas?
                </h3>
                <p className="text-neutral-500 text-sm">
                    Selecciona el nivel educativo que te interesa
                </p>
            </div>

            {/* Opciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {studyTypes.map((type, index) => {
                    const isSelected = selectedType === type.id;
                    const Icon = type.icon;

                    return (
                        <motion.button
                            key={type.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectType(type.id)}
                            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
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
                                    className="absolute top-3 right-3 w-5 h-5 bg-[#223945] rounded-full flex items-center justify-center"
                                >
                                    <Check className="w-3 h-3 text-white" />
                                </motion.div>
                            )}

                            <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${type.color} mb-3`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>

                            <h4 className="font-bold text-[#223945] mb-1">{type.name}</h4>
                            <p className="text-xs text-neutral-500">{type.description}</p>
                        </motion.button>
                    );
                })}
            </div>

            {/* Botones navegación */}
            <div className="flex gap-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onBack}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 text-neutral-600 font-semibold rounded-xl hover:bg-neutral-200 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Atrás
                </motion.button>
                <motion.button
                    whileHover={selectedType ? { scale: 1.02 } : {}}
                    whileTap={selectedType ? { scale: 0.98 } : {}}
                    onClick={onNext}
                    disabled={!selectedType}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all ${
                        selectedType
                            ? 'bg-[#223945] text-white hover:bg-[#1a2c35]'
                            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    }`}
                >
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                </motion.button>
            </div>
        </motion.div>
    );
}
