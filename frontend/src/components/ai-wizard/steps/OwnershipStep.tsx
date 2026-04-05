'use client';

import { motion } from 'framer-motion';
import { Building2, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const options = [
    {
        id: 'PÚBLICO',
        name: 'Público',
        description: 'Centros de titularidad pública',
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500'
    },
    {
        id: 'PRIVADO',
        name: 'Privado',
        description: 'Centros de titularidad privada o concertada',
        color: 'from-amber-500 to-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-500'
    },
    {
        id: null,
        name: 'Me da igual',
        description: 'Mostrar todos los centros',
        color: 'from-neutral-500 to-neutral-600',
        bgColor: 'bg-neutral-50',
        borderColor: 'border-neutral-500'
    }
];

interface OwnershipStepProps {
    selectedNaturaleza: string | null;
    onSelectNaturaleza: (naturaleza: string | null) => void;
    onSearch: () => void;
    onBack: () => void;
}

export default function OwnershipStep({
    selectedNaturaleza,
    onSelectNaturaleza,
    onSearch,
    onBack
}: OwnershipStepProps) {
    // "Me da igual" se representa como undefined internamente pero null en la UI
    const currentSelection = selectedNaturaleza === undefined ? 'INDIFERENTE' : selectedNaturaleza;

    const handleSelect = (id: string | null) => {
        onSelectNaturaleza(id);
    };

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
                    <Building2 className="w-6 h-6 text-[#223945]" />
                </div>
                <h3 className="text-xl font-bold text-[#223945] mb-2">
                    ¿Público o privado?
                </h3>
                <p className="text-neutral-500 text-sm">
                    Última pregunta, ¿tienes preferencia por la titularidad?
                </p>
            </div>

            {/* Opciones */}
            <div className="space-y-3 mb-8">
                {options.map((option, index) => {
                    const isSelected = currentSelection === option.id ||
                        (option.id === null && currentSelection === 'INDIFERENTE');

                    return (
                        <motion.button
                            key={option.id || 'indiferente'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleSelect(option.id)}
                            className={`relative w-full p-4 rounded-xl border-2 text-left transition-all ${
                                isSelected
                                    ? `${option.borderColor} ${option.bgColor} shadow-md`
                                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                            }`}
                        >
                            {/* Indicador de selección */}
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-4 right-4 w-5 h-5 bg-[#223945] rounded-full flex items-center justify-center"
                                >
                                    <Check className="w-3 h-3 text-white" />
                                </motion.div>
                            )}

                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${option.color}`}>
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#223945]">{option.name}</h4>
                                    <p className="text-sm text-neutral-500">{option.description}</p>
                                </div>
                            </div>
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onSearch}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#223945] via-blue-600 to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow"
                >
                    Buscar centros
                    <ArrowRight className="w-4 h-4" />
                </motion.button>
            </div>
        </motion.div>
    );
}
