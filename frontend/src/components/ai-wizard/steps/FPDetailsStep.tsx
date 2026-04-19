'use client';

import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const familiasProfesionales = [
    { id: 'admin', name: 'Administración' },
    { id: 'info', name: 'Informática' },
    { id: 'sanidad', name: 'Sanidad' },
    { id: 'comercio', name: 'Comercio' },
    { id: 'electric', name: 'Electricidad' },
    { id: 'social', name: 'Socioculturales' },
    { id: 'transport', name: 'Transporte' },
    { id: 'hostel', name: 'Hostelería' },
    { id: 'instal', name: 'Instalaciones' },
    { id: 'deporte', name: 'Deportes' },
    { id: 'imagen', name: 'Imagen Personal' },
    { id: 'agraria', name: 'Agraria' }
];

const niveles = [
    { id: 'BASICA', name: 'Básica' },
    { id: 'GM', name: 'Grado Medio' },
    { id: 'GS', name: 'Grado Superior' },
    { id: 'CE', name: 'Especialización' }
];

const modalidades = [
    { id: 'PRESENCIAL', name: 'Presencial' },
    { id: 'DISTANCIA', name: 'A distancia' }
];

interface FPDetailsStepProps {
    selectedFamilia: string | null;
    onSelectFamilia: (familia: string | null) => void;
    selectedNivel: string | null;
    onSelectNivel: (nivel: string | null) => void;
    selectedModalidad: string | null;
    onSelectModalidad: (modalidad: string | null) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function FPDetailsStep({
    selectedFamilia,
    onSelectFamilia,
    selectedNivel,
    onSelectNivel,
    selectedModalidad,
    onSelectModalidad,
    onNext,
    onBack
}: FPDetailsStepProps) {
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
                            <BookOpen className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </motion.div>
                <h3 className="text-base sm:text-lg font-bold text-[#223945] mb-0.5">
                    Personaliza tu búsqueda
                </h3>
                <p className="text-neutral-500 text-[11px] sm:text-xs">
                    Todos los campos son opcionales
                </p>
            </div>

            {/* Contenido compacto */}
            <div className="space-y-3 mb-3">
                {/* Familia Profesional - Grid compacto */}
                <div>
                    <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5 block">
                        Familia Profesional
                    </label>
                    <div className="flex flex-wrap gap-1">
                        {familiasProfesionales.map((familia) => {
                            const isSelected = selectedFamilia === familia.id;
                            return (
                                <button
                                    key={familia.id}
                                    onClick={() => onSelectFamilia(isSelected ? null : familia.id)}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                                        isSelected
                                            ? 'bg-[#223945] text-white shadow-sm'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                >
                                    {isSelected && <Check className="w-2.5 h-2.5" />}
                                    {familia.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Nivel - Grid 2x2 compacto */}
                <div>
                    <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5 block">
                        Nivel
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                        {niveles.map((nivel) => {
                            const isSelected = selectedNivel === nivel.id;
                            return (
                                <button
                                    key={nivel.id}
                                    onClick={() => onSelectNivel(isSelected ? null : nivel.id)}
                                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                                        isSelected
                                            ? 'bg-[#223945] text-white shadow-sm'
                                            : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                                    }`}
                                >
                                    {isSelected && <Check className="w-3 h-3" />}
                                    {nivel.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Modalidad - Toggle buttons */}
                <div>
                    <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5 block">
                        Modalidad
                    </label>
                    <div className="flex gap-1.5">
                        {modalidades.map((modalidad) => {
                            const isSelected = selectedModalidad === modalidad.id;
                            return (
                                <button
                                    key={modalidad.id}
                                    onClick={() => onSelectModalidad(isSelected ? null : modalidad.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                                        isSelected
                                            ? 'bg-[#223945] text-white shadow-sm'
                                            : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                                    }`}
                                >
                                    {isSelected && <Check className="w-3 h-3" />}
                                    {modalidad.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
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
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onNext}
                    className="flex-1 relative flex items-center justify-center gap-1.5 px-4 py-2.5 font-semibold rounded-xl transition-all text-[13px] overflow-hidden bg-gradient-to-r from-[#223945] via-[#2d4a5e] to-blue-600 text-white shadow-lg shadow-[#223945]/25 hover:shadow-xl hover:shadow-[#223945]/30"
                >
                    <span>Continuar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                    {/* Shine effect */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '200%' }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'linear', repeatDelay: 2 }}
                        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    />
                </motion.button>
            </div>
        </motion.div>
    );
}
