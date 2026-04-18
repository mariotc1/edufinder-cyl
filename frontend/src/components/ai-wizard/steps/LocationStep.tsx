'use client';

import { motion } from 'framer-motion';
import { MapPin, Navigation, ArrowRight, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import CastillaLeonMap from '../CastillaLeonMap';

interface LocationStepProps {
    selectedProvincias: string[];
    onToggleProvincia: (provinciaId: string) => void;
    useGeolocation: boolean;
    onToggleGeolocation: (value: boolean) => void;
    radio: number;
    onRadioChange: (value: number) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function LocationStep({
    selectedProvincias,
    onToggleProvincia,
    useGeolocation,
    onToggleGeolocation,
    radio,
    onRadioChange,
    onNext,
    onBack
}: LocationStepProps) {
    const [geoLoading, setGeoLoading] = useState(false);

    const handleGeolocationToggle = async () => {
        if (!useGeolocation) {
            setGeoLoading(true);
            try {
                await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 5000
                    });
                });
                onToggleGeolocation(true);
            } catch {
                alert('No se pudo obtener tu ubicación. Por favor, selecciona las provincias manualmente.');
            } finally {
                setGeoLoading(false);
            }
        } else {
            onToggleGeolocation(false);
        }
    };

    const canContinue = selectedProvincias.length > 0 || useGeolocation;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="py-4 px-4 sm:px-6"
        >
            {/* Header compacto */}
            <div className="text-center mb-3">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="inline-flex mb-2"
                >
                    <div className="relative">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                            className="absolute inset-0 bg-[#223945] rounded-full"
                        />
                        <div className="relative p-3 bg-gradient-to-br from-[#223945] to-blue-600 rounded-full shadow-lg shadow-[#223945]/25">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </motion.div>
                <h3 className="text-lg sm:text-xl font-bold text-[#223945] mb-1">
                    ¿Dónde te gustaría estudiar?
                </h3>
                <p className="text-neutral-500 text-xs sm:text-sm">
                    Selecciona una o varias provincias en el mapa
                </p>
            </div>

            {/* Mapa */}
            <div className={`mb-2 transition-opacity ${useGeolocation ? 'opacity-40' : 'opacity-100'}`}>
                <CastillaLeonMap
                    selectedProvincias={selectedProvincias}
                    onToggleProvincia={onToggleProvincia}
                    disabled={useGeolocation}
                />
            </div>

            {/* Separador */}
            <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent"></div>
                <span className="text-neutral-400 text-[11px] font-medium uppercase tracking-wider">o usa</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent"></div>
            </div>

            {/* Opción geolocalización */}
            <motion.button
                onClick={handleGeolocationToggle}
                disabled={geoLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white border border-neutral-200 hover:border-[#223945]/30 transition-all"
            >
                <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg transition-all ${
                        useGeolocation
                            ? 'bg-gradient-to-br from-[#223945] to-[#2d5a7b]'
                            : 'bg-neutral-100'
                    }`}>
                        <Navigation className={`w-4 h-4 ${useGeolocation ? 'text-white' : 'text-neutral-500'}`} />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-sm text-[#223945]">
                            {geoLoading ? 'Localizando...' : 'Usar mi ubicación'}
                        </p>
                        <p className="text-[10px] text-neutral-500">
                            Buscar centros cerca de ti
                        </p>
                    </div>
                </div>

                {/* Toggle switch */}
                <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                    useGeolocation
                        ? 'bg-gradient-to-r from-[#223945] to-[#2d5a7b]'
                        : 'bg-neutral-200'
                }`}>
                    <motion.div
                        animate={{ x: useGeolocation ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-5 h-5 rounded-full bg-white shadow-md"
                    />
                </div>
            </motion.button>

            {/* Selector de radio con pills - más opciones cercanas */}
            {useGeolocation && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2"
                >
                    <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl">
                        {[
                            { value: 5, label: '5 km' },
                            { value: 10, label: '10 km' },
                            { value: 15, label: '15 km' },
                            { value: 25, label: '25 km' },
                            { value: 50, label: '+50' }
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => onRadioChange(option.value)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    radio === option.value
                                        ? 'bg-gradient-to-r from-[#223945] to-[#2d5a7b] text-white shadow-md'
                                        : 'text-neutral-500 hover:text-[#223945] hover:bg-white/50'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Botones navegación */}
            <div className="flex gap-3 mt-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onBack}
                    className="flex items-center justify-center gap-1.5 px-4 py-3 bg-white border border-neutral-200 text-neutral-600 font-semibold rounded-xl hover:bg-neutral-50 transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Atrás
                </motion.button>
                <motion.button
                    whileHover={canContinue ? { scale: 1.02, y: -1 } : {}}
                    whileTap={canContinue ? { scale: 0.98 } : {}}
                    onClick={onNext}
                    disabled={!canContinue}
                    className={`flex-1 relative flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all text-sm overflow-hidden ${
                        canContinue
                            ? 'bg-gradient-to-r from-[#223945] via-[#2d4a5e] to-blue-600 text-white shadow-lg shadow-[#223945]/25 hover:shadow-xl hover:shadow-[#223945]/30'
                            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    }`}
                >
                    <span>Continuar</span>
                    <ArrowRight className="w-4 h-4" />
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
