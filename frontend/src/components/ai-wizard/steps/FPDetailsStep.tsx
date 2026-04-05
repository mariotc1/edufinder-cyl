'use client';

import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, ArrowLeft, Check, X } from 'lucide-react';
import { useState } from 'react';

const familiasProfesionales = [
    'Administración y Gestión',
    'Informática y Comunicaciones',
    'Sanidad',
    'Comercio y Marketing',
    'Electricidad y Electrónica',
    'Servicios Socioculturales y a la Comunidad',
    'Transporte y Mantenimiento de Vehículos',
    'Hostelería y Turismo',
    'Instalación y Mantenimiento',
    'Actividades Físicas y Deportivas',
    'Imagen Personal',
    'Agraria'
];

const niveles = [
    { id: 'BASICA', name: 'FP Básica', shortName: 'FPB', color: 'bg-blue-500' },
    { id: 'GM', name: 'Grado Medio', shortName: 'GM', color: 'bg-amber-500' },
    { id: 'GS', name: 'Grado Superior', shortName: 'GS', color: 'bg-purple-500' },
    { id: 'CE', name: 'Especialización', shortName: 'CE', color: 'bg-rose-500' }
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
    const [showAllFamilias, setShowAllFamilias] = useState(false);
    const displayedFamilias = showAllFamilias ? familiasProfesionales : familiasProfesionales.slice(0, 6);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="py-6 px-4"
        >
            {/* Header */}
            <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-purple-100 rounded-xl mb-3">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-[#223945] mb-2">
                    Detalles de FP
                </h3>
                <p className="text-neutral-500 text-sm">
                    Cuéntanos más sobre lo que buscas (todo es opcional)
                </p>
            </div>

            {/* Familia Profesional */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-neutral-700">
                        Familia Profesional
                    </label>
                    {selectedFamilia && (
                        <button
                            onClick={() => onSelectFamilia(null)}
                            className="text-xs text-neutral-400 hover:text-red-500 flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Limpiar
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {displayedFamilias.map((familia) => (
                        <motion.button
                            key={familia}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectFamilia(selectedFamilia === familia ? null : familia)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                selectedFamilia === familia
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-purple-100 hover:text-purple-700'
                            }`}
                        >
                            {familia}
                        </motion.button>
                    ))}
                </div>
                {familiasProfesionales.length > 6 && (
                    <button
                        onClick={() => setShowAllFamilias(!showAllFamilias)}
                        className="mt-2 text-xs text-[#223945] hover:underline"
                    >
                        {showAllFamilias ? 'Ver menos' : `Ver todas (${familiasProfesionales.length})`}
                    </button>
                )}
            </div>

            {/* Nivel */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-neutral-700">
                        Nivel educativo
                    </label>
                    {selectedNivel && (
                        <button
                            onClick={() => onSelectNivel(null)}
                            className="text-xs text-neutral-400 hover:text-red-500 flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Limpiar
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {niveles.map((nivel) => (
                        <motion.button
                            key={nivel.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectNivel(selectedNivel === nivel.id ? null : nivel.id)}
                            className={`relative p-3 rounded-xl border-2 text-center transition-all ${
                                selectedNivel === nivel.id
                                    ? 'border-[#223945] bg-[#223945]/5'
                                    : 'border-neutral-200 hover:border-neutral-300'
                            }`}
                        >
                            {selectedNivel === nivel.id && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-1 right-1 w-4 h-4 bg-[#223945] rounded-full flex items-center justify-center"
                                >
                                    <Check className="w-2.5 h-2.5 text-white" />
                                </motion.div>
                            )}
                            <div className={`w-8 h-8 ${nivel.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                                <span className="text-white text-xs font-bold">{nivel.shortName}</span>
                            </div>
                            <span className="text-xs font-medium text-neutral-700">{nivel.name}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Modalidad */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-neutral-700">
                        Modalidad
                    </label>
                    {selectedModalidad && (
                        <button
                            onClick={() => onSelectModalidad(null)}
                            className="text-xs text-neutral-400 hover:text-red-500 flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Limpiar
                        </button>
                    )}
                </div>
                <div className="flex gap-3">
                    {modalidades.map((modalidad) => (
                        <motion.button
                            key={modalidad.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectModalidad(selectedModalidad === modalidad.id ? null : modalidad.id)}
                            className={`flex-1 p-3 rounded-xl border-2 text-center font-medium transition-all ${
                                selectedModalidad === modalidad.id
                                    ? 'border-[#223945] bg-[#223945] text-white'
                                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                            }`}
                        >
                            {modalidad.name}
                        </motion.button>
                    ))}
                </div>
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
                    onClick={onNext}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#223945] text-white font-semibold rounded-xl hover:bg-[#1a2c35] transition-colors"
                >
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                </motion.button>
            </div>
        </motion.div>
    );
}
