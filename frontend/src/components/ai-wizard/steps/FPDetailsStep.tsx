'use client';

import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, ArrowLeft, ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const familiasProfesionales = [
    { id: 'admin', name: 'Administración y Gestión' },
    { id: 'info', name: 'Informática y Comunicaciones' },
    { id: 'sanidad', name: 'Sanidad' },
    { id: 'comercio', name: 'Comercio y Marketing' },
    { id: 'electric', name: 'Electricidad y Electrónica' },
    { id: 'social', name: 'Servicios Socioculturales' },
    { id: 'transport', name: 'Transporte y Vehículos' },
    { id: 'hostel', name: 'Hostelería y Turismo' },
    { id: 'instal', name: 'Instalación y Mantenimiento' },
    { id: 'deporte', name: 'Actividades Físicas y Deportivas' },
    { id: 'imagen', name: 'Imagen Personal' },
    { id: 'agraria', name: 'Agraria' }
];

const niveles = [
    { id: 'BASICA', name: 'FP Básica', short: 'Básica' },
    { id: 'GM', name: 'Grado Medio', short: 'Medio' },
    { id: 'GS', name: 'Grado Superior', short: 'Superior' },
    { id: 'CE', name: 'Especialización', short: 'Esp.' }
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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedFamiliaName = familiasProfesionales.find(f => f.id === selectedFamilia)?.name;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="py-3 px-4 sm:px-6 flex flex-col"
        >
            {/* Header compacto */}
            <div className="text-center mb-3">
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
                {/* Familia Profesional - Dropdown */}
                <div ref={dropdownRef} className="relative">
                    <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1 block">
                        Familia Profesional
                    </label>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                            selectedFamilia
                                ? 'border-[#223945] bg-[#223945]/5'
                                : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                    >
                        <span className={`text-[13px] ${selectedFamilia ? 'text-[#223945] font-medium' : 'text-neutral-400'}`}>
                            {selectedFamiliaName || 'Seleccionar familia...'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown menu */}
                    {isDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute z-20 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-[180px] overflow-y-auto"
                        >
                            {/* Opción para limpiar */}
                            {selectedFamilia && (
                                <button
                                    onClick={() => {
                                        onSelectFamilia(null);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-[12px] text-neutral-400 hover:bg-neutral-50 border-b border-neutral-100"
                                >
                                    — Sin preferencia —
                                </button>
                            )}
                            {familiasProfesionales.map((familia) => (
                                <button
                                    key={familia.id}
                                    onClick={() => {
                                        onSelectFamilia(familia.id);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-[12px] transition-colors flex items-center justify-between ${
                                        selectedFamilia === familia.id
                                            ? 'bg-[#223945]/5 text-[#223945] font-medium'
                                            : 'text-neutral-600 hover:bg-neutral-50'
                                    }`}
                                >
                                    {familia.name}
                                    {selectedFamilia === familia.id && (
                                        <Check className="w-3.5 h-3.5 text-[#223945]" />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* Nivel - Pills compactos */}
                <div>
                    <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5 block">
                        Nivel
                    </label>
                    <div className="flex gap-1.5">
                        {niveles.map((nivel) => (
                            <button
                                key={nivel.id}
                                onClick={() => onSelectNivel(selectedNivel === nivel.id ? null : nivel.id)}
                                className={`flex-1 py-2 px-1 rounded-lg text-[11px] font-semibold transition-all ${
                                    selectedNivel === nivel.id
                                        ? 'bg-[#223945] text-white shadow-sm'
                                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                                }`}
                            >
                                {nivel.short}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Modalidad - Toggle buttons */}
                <div>
                    <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5 block">
                        Modalidad
                    </label>
                    <div className="flex gap-2">
                        {modalidades.map((modalidad) => (
                            <button
                                key={modalidad.id}
                                onClick={() => onSelectModalidad(selectedModalidad === modalidad.id ? null : modalidad.id)}
                                className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                                    selectedModalidad === modalidad.id
                                        ? 'bg-[#223945] text-white shadow-sm'
                                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                                }`}
                            >
                                {modalidad.name}
                            </button>
                        ))}
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
