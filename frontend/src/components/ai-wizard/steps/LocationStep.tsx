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
                // Intentar obtener ubicación
                await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 5000
                    });
                });
                onToggleGeolocation(true);
            } catch {
                // Si falla, no activar
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
            className="py-6 px-4"
        >
            {/* Header */}
            <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-[#223945]/10 rounded-xl mb-3">
                    <MapPin className="w-6 h-6 text-[#223945]" />
                </div>
                <h3 className="text-xl font-bold text-[#223945] mb-2">
                    ¿Dónde te gustaría estudiar?
                </h3>
                <p className="text-neutral-500 text-sm">
                    Selecciona una o varias provincias en el mapa
                </p>
            </div>

            {/* Mapa */}
            <div className="mb-6">
                <CastillaLeonMap
                    selectedProvincias={selectedProvincias}
                    onToggleProvincia={onToggleProvincia}
                    disabled={useGeolocation}
                />
            </div>

            {/* Separador con "o" */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-neutral-200"></div>
                <span className="text-neutral-400 text-sm font-medium">o</span>
                <div className="flex-1 h-px bg-neutral-200"></div>
            </div>

            {/* Opción geolocalización */}
            <motion.button
                onClick={handleGeolocationToggle}
                disabled={geoLoading}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    useGeolocation
                        ? 'border-[#223945] bg-[#223945]/5'
                        : 'border-neutral-200 hover:border-[#223945]/30 hover:bg-neutral-50'
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${useGeolocation ? 'bg-[#223945] text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                        <Navigation className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-[#223945]">Usar mi ubicación</p>
                        <p className="text-xs text-neutral-500">Buscar centros cerca de donde estoy</p>
                    </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
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

            {/* Slider de radio (si geolocalización activa) */}
            {useGeolocation && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-4 bg-neutral-50 rounded-xl"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-600">Radio de búsqueda</span>
                        <span className="text-sm font-bold text-[#223945]">{radio} km</span>
                    </div>
                    <input
                        type="range"
                        min="5"
                        max="100"
                        step="5"
                        value={radio}
                        onChange={(e) => onRadioChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#223945]"
                    />
                    <div className="flex justify-between text-xs text-neutral-400 mt-1">
                        <span>5 km</span>
                        <span>100 km</span>
                    </div>
                </motion.div>
            )}

            {/* Botones navegación */}
            <div className="flex gap-3 mt-8">
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
                    whileHover={canContinue ? { scale: 1.02 } : {}}
                    whileTap={canContinue ? { scale: 0.98 } : {}}
                    onClick={onNext}
                    disabled={!canContinue}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all ${
                        canContinue
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
