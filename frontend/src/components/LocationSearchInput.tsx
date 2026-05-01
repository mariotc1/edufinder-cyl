'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, X, Navigation, Loader2 } from 'lucide-react';

// Prefijos de códigos postales de Castilla y León
const CYL_POSTAL_PREFIXES: Record<string, string> = {
    '05': 'Ávila',
    '09': 'Burgos',
    '24': 'León',
    '34': 'Palencia',
    '37': 'Salamanca',
    '40': 'Segovia',
    '42': 'Soria',
    '47': 'Valladolid',
    '49': 'Zamora',
};

interface LocationSearchInputProps {
    onLocationSelect: (location: { lat: number; lng: number; name: string } | null) => void;
    selectedLocation: { lat: number; lng: number; name: string } | null;
    onUseMyLocation: () => void;
    isUsingMyLocation: boolean;
    isLoadingMyLocation: boolean;
}

export default function LocationSearchInput({
    onLocationSelect,
    selectedLocation,
    onUseMyLocation,
    isUsingMyLocation,
    isLoadingMyLocation,
}: LocationSearchInputProps) {
    const [postalCode, setPostalCode] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [localidad, setLocalidad] = useState<string | null>(null);

    // Validar si es un CP de Castilla y León
    const isValidCYLPostalCode = (cp: string): boolean => {
        if (cp.length !== 5 || !/^\d{5}$/.test(cp)) return false;
        const prefix = cp.substring(0, 2);
        return prefix in CYL_POSTAL_PREFIXES;
    };

    // Obtener provincia del CP
    const getProvinciaFromCP = (cp: string): string => {
        const prefix = cp.substring(0, 2);
        return CYL_POSTAL_PREFIXES[prefix] || '';
    };

    // Buscar coordenadas del código postal
    const searchPostalCode = useCallback(async (cp: string) => {
        if (!isValidCYLPostalCode(cp)) {
            setError('Código postal no válido para Castilla y León');
            setLocalidad(null);
            return;
        }

        setIsSearching(true);
        setError(null);

        try {
            const provincia = getProvinciaFromCP(cp);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `postalcode=${cp}&` +
                `country=Spain&` +
                `format=json&` +
                `addressdetails=1&` +
                `limit=1`
            );
            const data = await response.json();

            if (data.length > 0) {
                const result = data[0];
                const address = result.address || {};
                const locality = address.city || address.town || address.village || address.municipality || provincia;

                setLocalidad(locality);
                onLocationSelect({
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon),
                    name: `${cp} - ${locality}`,
                });
            } else {
                setError('No se encontró el código postal, intenta con otro');
                setLocalidad(null);
            }
        } catch (err) {
            console.error('Error buscando CP:', err);
            setError('Error al buscar ubicación');
            setLocalidad(null);
        } finally {
            setIsSearching(false);
        }
    }, [onLocationSelect]);

    // Efecto para buscar cuando el CP es válido
    useEffect(() => {
        if (postalCode.length === 5) {
            const prefix = postalCode.substring(0, 2);
            if (prefix in CYL_POSTAL_PREFIXES) {
                searchPostalCode(postalCode);
            } else {
                setError('Solo códigos postales de Castilla y León');
                setLocalidad(null);
            }
        } else {
            setError(null);
            setLocalidad(null);
        }
    }, [postalCode, searchPostalCode]);

    // Limpiar ubicación
    const handleClear = useCallback(() => {
        onLocationSelect(null);
        setPostalCode('');
        setError(null);
        setLocalidad(null);
    }, [onLocationSelect]);

    // Manejar input del código postal
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 5);
        setPostalCode(value);

        if (value.length < 5 && selectedLocation) {
            onLocationSelect(null);
        }
    };

    const hasLocation = selectedLocation !== null || isUsingMyLocation;

    // Mostrar indicador de provincia mientras escribe
    const getTypingHint = (): string | null => {
        if (postalCode.length >= 2) {
            const prefix = postalCode.substring(0, 2);
            if (prefix in CYL_POSTAL_PREFIXES) {
                return CYL_POSTAL_PREFIXES[prefix];
            }
        }
        return null;
    };

    const typingHint = getTypingHint();

    return (
        <div className="flex-1 min-w-0 flex items-center gap-2">
            {hasLocation ? (
                // Estado: Ubicación activa
                <div className="flex-1 min-w-0 flex items-center gap-2 bg-[#223945] text-white px-4 py-3.5 rounded-xl border border-[#223945] transition-all">
                    <MapPin className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium truncate flex-1">
                        {isUsingMyLocation ? 'Mi ubicación' : selectedLocation?.name}
                    </span>
                    <button
                        onClick={handleClear}
                        className="p-1 rounded-full hover:bg-white/20 transition-colors shrink-0"
                        title="Quitar ubicación"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                // Estado: Buscando ubicación - Input flexible
                <div className="relative flex-1 min-w-0">
                    <div className="relative">
                        {isSearching && (
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                                <Loader2 className="w-4 h-4 text-[#223945] animate-spin" />
                            </div>
                        )}
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Código postal"
                            value={postalCode}
                            onChange={handleInputChange}
                            className={`w-full py-3.5 rounded-xl bg-neutral-50 border transition-all outline-none ring-0 focus:outline-none focus:ring-4 focus:ring-[#223945]/10 font-medium text-sm text-neutral-800 placeholder:text-neutral-400 ${
                                isSearching ? 'pl-9' : 'pl-4'
                            } ${
                                typingHint || localidad ? 'pr-24' : 'pr-4'
                            } ${
                                error
                                    ? 'border-red-300 focus:border-red-300'
                                    : 'border-neutral-200 hover:border-[#223945]/50 focus:border-[#223945]'
                            }`}
                        />
                        {/* Indicador de provincia/localidad - posicionado absoluto */}
                        {typingHint && !error && postalCode.length < 5 && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#223945] pointer-events-none">
                                {typingHint}
                            </span>
                        )}
                        {localidad && postalCode.length === 5 && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-green-600 pointer-events-none whitespace-nowrap">
                                ✓ {localidad}
                            </span>
                        )}
                    </div>
                    {/* Error message */}
                    {error && (
                        <p className="absolute -bottom-5 left-0 text-[10px] text-red-500 font-medium whitespace-nowrap">
                            {error}
                        </p>
                    )}
                </div>
            )}

            {/* Botón Mi ubicación - siempre visible */}
            {!hasLocation && (
                <button
                    onClick={onUseMyLocation}
                    disabled={isLoadingMyLocation}
                    className="flex items-center gap-1.5 px-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-[#223945]/5 hover:border-[#223945]/20 hover:text-[#223945] transition-all text-sm font-bold shrink-0"
                    title="Usar mi ubicación actual"
                >
                    {isLoadingMyLocation ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Navigation className="w-5 h-5" />
                    )}
                    <span className="hidden md:inline">Mi ubicación</span>
                </button>
            )}
        </div>
    );
}
