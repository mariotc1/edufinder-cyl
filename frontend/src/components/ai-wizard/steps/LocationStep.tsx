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
            <div className="text-center mb-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="inline-flex mb-3"
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
                    Toca en el mapa para seleccionar provincias
                </p>
            </div>

            {/* Mapa */}
            <div className="mb-3">
                <CastillaLeonMap
                    selectedProvincias={selectedProvincias}
                    onToggleProvincia={onToggleProvincia}
                    disabled={useGeolocation}
                />
            </div>

            {/* Separador */}
            <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-neutral-200"></div>
                <span className="text-neutral-400 text-xs font-medium">o bien</span>
                <div className="flex-1 h-px bg-neutral-200"></div>
            </div>

            {/* Opción geolocalización compacta */}
            <motion.button
                onClick={handleGeolocationToggle}
                disabled={geoLoading}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    useGeolocation
                        ? 'border-[#223945] bg-[#223945]/5'
                        : 'border-neutral-200 hover:border-[#223945]/30 hover:bg-neutral-50'
                }`}
            >
                <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg transition-colors ${useGeolocation ? 'bg-[#223945] text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                        <Navigation className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-[#223945] text-sm">Usar mi ubicación</p>
                        <p className="text-[10px] text-neutral-500">Centros cerca de donde estoy</p>
                    </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    useGeolocation ? 'border-[#223945] bg-[#223945]' : 'border-neutral-300'
                }`}>
                    {useGeolocation && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-white rounded-full"
                        />
                    )}
                </div>
            </motion.button>

            {/* Slider de radio */}
            {useGeolocation && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 p-3 bg-neutral-50 rounded-xl"
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-neutral-600">Radio de búsqueda</span>
                        <span className="text-xs font-bold text-[#223945]">{radio} km</span>
                    </div>
                    <input
                        type="range"
                        min="5"
                        max="100"
                        step="5"
                        value={radio}
                        onChange={(e) => onRadioChange(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#223945]"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                        <span>5 km</span>
                        <span>100 km</span>
                    </div>
                </motion.div>
            )}

            {/* Botones navegación */}
            <div className="flex gap-3 mt-5">
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
