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
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </motion.div>
                <h3 className="text-base sm:text-lg font-bold text-[#223945] mb-0.5">
                    ¿Dónde te gustaría estudiar?
                </h3>
                <p className="text-neutral-500 text-[11px] sm:text-xs">
                    Selecciona provincias en el mapa
                </p>
            </div>

            {/* Mapa */}
            <div className={`mb-1.5 transition-opacity ${useGeolocation ? 'opacity-40' : 'opacity-100'}`}>
                <CastillaLeonMap
                    selectedProvincias={selectedProvincias}
                    onToggleProvincia={onToggleProvincia}
                    disabled={useGeolocation}
                />
            </div>

            {/* Separador */}
            <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>
                <span className="text-neutral-400 text-[10px] font-medium uppercase tracking-wide">o usa</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>
            </div>

            {/* Opción geolocalización */}
            <motion.button
                onClick={handleGeolocationToggle}
                disabled={geoLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-neutral-200 hover:border-[#223945]/30 transition-all"
            >
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg transition-all ${
                        useGeolocation
                            ? 'bg-gradient-to-br from-[#223945] to-[#2d5a7b]'
                            : 'bg-neutral-100'
                    }`}>
                        <Navigation className={`w-4 h-4 ${useGeolocation ? 'text-white' : 'text-neutral-500'}`} />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-[13px] text-[#223945]">
                            {geoLoading ? 'Localizando...' : 'Usar mi ubicación'}
                        </p>
                        <p className="text-[10px] text-neutral-500 leading-tight">
                            Buscar centros cerca de ti
                        </p>
                    </div>
                </div>

                {/* Toggle switch */}
                <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    useGeolocation
                        ? 'bg-gradient-to-r from-[#223945] to-[#2d5a7b]'
                        : 'bg-neutral-200'
                }`}>
                    <motion.div
                        animate={{ x: useGeolocation ? 18 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-4 h-4 rounded-full bg-white shadow-md"
                    />
                </div>
            </motion.button>

            {/* Selector de radio */}
            {useGeolocation && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1.5 overflow-hidden"
                >
                    <div className="flex items-center w-full bg-neutral-50/80 px-3 py-1.5 rounded-lg border border-neutral-100">
                        <span className="text-[11px] text-[#223945] font-bold whitespace-nowrap">Buscar a</span>
                        <div className="flex-1 flex items-center justify-center gap-1 mx-2">
                            {[
                                { value: 5, label: '5' },
                                { value: 10, label: '10' },
                                { value: 20, label: '20' },
                                { value: 35, label: '35' },
                                { value: 50, label: '50+' }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => onRadioChange(option.value)}
                                    className={`flex-1 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                        radio === option.value
                                            ? 'bg-[#223945] text-white shadow-sm'
                                            : 'text-neutral-400 hover:text-[#223945] hover:bg-white'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        <span className="text-[11px] text-[#223945] font-bold whitespace-nowrap">km</span>
                    </div>
                </motion.div>
            )}

            {/* Botones navegación */}
            <div className="flex gap-2 mt-3">
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
