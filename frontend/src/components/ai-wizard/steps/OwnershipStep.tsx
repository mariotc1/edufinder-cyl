'use client';

import { motion } from 'framer-motion';
import { Building2, Landmark, Users, Search, ArrowLeft, Check } from 'lucide-react';

const options = [
    {
        id: 'PÚBLICO',
        name: 'Público',
        description: 'Centros de titularidad pública',
        icon: Landmark
    },
    {
        id: 'PRIVADO',
        name: 'Privado',
        description: 'Privados y concertados',
        icon: Building2
    },
    {
        id: 'INDIFERENTE',
        name: 'Me da igual',
        description: 'Mostrar todos los centros',
        icon: Users
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
    const canSearch = selectedNaturaleza !== null;

    const handleSelect = (id: string) => {
        // Si es INDIFERENTE, enviamos null al backend para no filtrar
        onSelectNaturaleza(id === 'INDIFERENTE' ? 'INDIFERENTE' : id);
    };

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
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </motion.div>
                <h3 className="text-base sm:text-lg font-bold text-[#223945] mb-0.5">
                    Tipo de titularidad
                </h3>
                <p className="text-neutral-500 text-[11px] sm:text-xs">
                    Selecciona tu preferencia
                </p>
            </div>

            {/* Opciones */}
            <div className="flex flex-col gap-2 mb-3">
                {options.map((option) => {
                    const isSelected = selectedNaturaleza === option.id;
                    const Icon = option.icon;

                    return (
                        <motion.button
                            key={option.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleSelect(option.id)}
                            className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                isSelected
                                    ? 'border-[#223945] bg-[#223945]/5 shadow-sm'
                                    : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
                            }`}
                        >
                            {/* Icono */}
                            <div className={`flex-shrink-0 p-2.5 rounded-xl transition-all ${
                                isSelected
                                    ? 'bg-gradient-to-br from-[#223945] to-[#2d5a7b]'
                                    : 'bg-neutral-100'
                            }`}>
                                <Icon className={`w-5 h-5 transition-colors ${
                                    isSelected ? 'text-white' : 'text-neutral-500'
                                }`} />
                            </div>

                            {/* Texto */}
                            <div className="flex-1 text-left">
                                <h4 className={`font-semibold text-[13px] leading-tight transition-colors ${
                                    isSelected ? 'text-[#223945]' : 'text-neutral-700'
                                }`}>{option.name}</h4>
                                <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">{option.description}</p>
                            </div>

                            {/* Radio indicator */}
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected
                                    ? 'border-[#223945] bg-[#223945]'
                                    : 'border-neutral-300'
                            }`}>
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    >
                                        <Check className="w-3 h-3 text-white" />
                                    </motion.div>
                                )}
                            </div>
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
                    whileHover={canSearch ? { scale: 1.02, y: -1 } : {}}
                    whileTap={canSearch ? { scale: 0.98 } : {}}
                    onClick={onSearch}
                    disabled={!canSearch}
                    className={`flex-1 relative flex items-center justify-center gap-1.5 px-4 py-2.5 font-semibold rounded-xl transition-all text-[13px] overflow-hidden ${
                        canSearch
                            ? 'bg-gradient-to-r from-[#223945] via-[#2d4a5e] to-blue-600 text-white shadow-lg shadow-[#223945]/25 hover:shadow-xl hover:shadow-[#223945]/30'
                            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    }`}
                >
                    <Search className="w-3.5 h-3.5" />
                    <span>Buscar centros</span>
                    {/* Shine effect */}
                    {canSearch && (
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
