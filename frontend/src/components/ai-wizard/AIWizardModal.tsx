'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Centro } from '@/types';

import WizardProgressBar from './WizardProgressBar';
import WelcomeStep from './steps/WelcomeStep';
import LocationStep from './steps/LocationStep';
import StudyTypeStep from './steps/StudyTypeStep';
import FPDetailsStep from './steps/FPDetailsStep';
import OwnershipStep from './steps/OwnershipStep';
import SearchingStep from './steps/SearchingStep';
import ResultsStep from './steps/ResultsStep';

type StepId = 'welcome' | 'location' | 'study-type' | 'fp-details' | 'ownership' | 'searching' | 'results';

const STORAGE_KEY = 'edufinder_wizard_search';

interface WizardData {
    provincias: string[];
    useGeolocation: boolean;
    lat?: number;
    lng?: number;
    radio: number;
    tipo: string | null;
    familia: string | null;
    nivel: string | null;
    modalidad: string | null;
    naturaleza: string | null;
}

const initialData: WizardData = {
    provincias: [],
    useGeolocation: false,
    radio: 20,
    tipo: null,
    familia: null,
    nivel: null,
    modalidad: null,
    naturaleza: null
};

interface AIWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AIWizardModal({ isOpen, onClose }: AIWizardModalProps) {
    const [currentStep, setCurrentStep] = useState<StepId>('welcome');
    const [wizardData, setWizardData] = useState<WizardData>(initialData);
    const [results, setResults] = useState<Centro[]>([]);
    const [hasSavedSearch, setHasSavedSearch] = useState(false);

    // Verificar si hay búsqueda guardada al abrir
    useEffect(() => {
        if (isOpen) {
            try {
                const saved = sessionStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const { results: savedResults } = JSON.parse(saved);
                    setHasSavedSearch(savedResults && savedResults.length > 0);
                }
            } catch {
                setHasSavedSearch(false);
            }
        }
    }, [isOpen]);

    // Guardar búsqueda cuando hay resultados
    useEffect(() => {
        if (currentStep === 'results' && results.length > 0) {
            try {
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
                    wizardData,
                    results,
                    timestamp: Date.now()
                }));
            } catch (error) {
                console.error('Error saving search:', error);
            }
        }
    }, [currentStep, results, wizardData]);

    // Función para continuar búsqueda guardada
    const continueSavedSearch = useCallback(() => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (saved) {
                const { wizardData: savedData, results: savedResults } = JSON.parse(saved);
                setWizardData(savedData);
                setResults(savedResults);
                setCurrentStep('results');
            }
        } catch (error) {
            console.error('Error loading saved search:', error);
        }
    }, []);

    // Limpiar búsqueda guardada
    const clearSavedSearch = useCallback(() => {
        sessionStorage.removeItem(STORAGE_KEY);
        setHasSavedSearch(false);
    }, []);

    // Handlers para actualizar datos
    const toggleProvincia = useCallback((provinciaId: string) => {
        setWizardData(prev => ({
            ...prev,
            provincias: prev.provincias.includes(provinciaId)
                ? prev.provincias.filter(p => p !== provinciaId)
                : [...prev.provincias, provinciaId]
        }));
    }, []);

    const handleGeolocation = useCallback(async (enabled: boolean) => {
        if (enabled) {
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });
                setWizardData(prev => ({
                    ...prev,
                    useGeolocation: true,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    provincias: [] // Limpiar provincias si usa geolocalización
                }));
            } catch {
                // Error handled in LocationStep
            }
        } else {
            setWizardData(prev => ({
                ...prev,
                useGeolocation: false,
                lat: undefined,
                lng: undefined
            }));
        }
    }, []);

    // Función de búsqueda
    const performSearch = useCallback(async () => {
        setCurrentStep('searching');

        try {
            // Construir query params
            const params = new URLSearchParams();

            // Provincias - enviar cada una como elemento del array
            if (wizardData.provincias.length > 0) {
                wizardData.provincias.forEach(provincia => {
                    params.append('provincias[]', provincia);
                });
            }

            // Geolocalización
            if (wizardData.useGeolocation && wizardData.lat && wizardData.lng) {
                params.set('lat', wizardData.lat.toString());
                params.set('lng', wizardData.lng.toString());
                params.set('radio', wizardData.radio.toString());
            }

            // Tipo de estudio
            if (wizardData.tipo) {
                params.set('tipo', wizardData.tipo);
            }

            // Detalles FP
            if (wizardData.tipo === 'FP') {
                if (wizardData.familia) params.set('familia', wizardData.familia);
                if (wizardData.nivel) params.set('nivel', wizardData.nivel);
                if (wizardData.modalidad) params.set('modalidad', wizardData.modalidad);
            }

            // Naturaleza (no enviar si es INDIFERENTE)
            if (wizardData.naturaleza && wizardData.naturaleza !== 'INDIFERENTE') {
                params.set('naturaleza', wizardData.naturaleza);
            }

            // Hacer la petición
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const response = await fetch(`${apiUrl}/recommendations/wizard?${params.toString()}`);
            const data = await response.json();

            // Simular un poco más de tiempo para la animación
            await new Promise(resolve => setTimeout(resolve, 1500));

            setResults(data.results || []);
            setCurrentStep('results');
        } catch (error) {
            console.error('Error en búsqueda:', error);
            setResults([]);
            setCurrentStep('results');
        }
    }, [wizardData]);

    // Reset wizard
    const resetWizard = useCallback(() => {
        setWizardData(initialData);
        setResults([]);
        setCurrentStep('welcome');
        clearSavedSearch();
    }, [clearSavedSearch]);

    // Cerrar y resetear
    const handleClose = useCallback(() => {
        onClose();
        // Reset después de cerrar para no ver el cambio
        setTimeout(resetWizard, 300);
    }, [onClose, resetWizard]);

    // Determinar siguiente paso
    const getNextStep = (current: StepId): StepId => {
        switch (current) {
            case 'welcome': return 'location';
            case 'location': return 'study-type';
            case 'study-type':
                return wizardData.tipo === 'FP' ? 'fp-details' : 'ownership';
            case 'fp-details': return 'ownership';
            default: return current;
        }
    };

    // Determinar paso anterior
    const getPrevStep = (current: StepId): StepId => {
        switch (current) {
            case 'location': return 'welcome';
            case 'study-type': return 'location';
            case 'fp-details': return 'study-type';
            case 'ownership':
                return wizardData.tipo === 'FP' ? 'fp-details' : 'study-type';
            default: return current;
        }
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={handleClose} className="relative z-50">
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                {/* Panel */}
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-b from-[#dbeafe] via-white to-[#eff6ff]">
                            {/* Línea superior decorativa - consistente con el resto de la web */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300 z-20" />

                            {/* Progress bar */}
                            <WizardProgressBar
                                currentStep={currentStep}
                                showFPDetails={wizardData.tipo === 'FP'}
                            />

                            {/* Contenido */}
                            <div className="max-h-[75vh] sm:max-h-[70vh] overflow-y-auto">
                                <AnimatePresence mode="wait">
                                    {currentStep === 'welcome' && (
                                        <WelcomeStep
                                            key="welcome"
                                            onNext={() => setCurrentStep('location')}
                                            hasSavedSearch={hasSavedSearch}
                                            onContinueSaved={continueSavedSearch}
                                        />
                                    )}

                                    {currentStep === 'location' && (
                                        <LocationStep
                                            key="location"
                                            selectedProvincias={wizardData.provincias}
                                            onToggleProvincia={toggleProvincia}
                                            useGeolocation={wizardData.useGeolocation}
                                            onToggleGeolocation={handleGeolocation}
                                            radio={wizardData.radio}
                                            onRadioChange={(r) => setWizardData(prev => ({ ...prev, radio: r }))}
                                            onNext={() => setCurrentStep(getNextStep('location'))}
                                            onBack={() => setCurrentStep(getPrevStep('location'))}
                                        />
                                    )}

                                    {currentStep === 'study-type' && (
                                        <StudyTypeStep
                                            key="study-type"
                                            selectedType={wizardData.tipo}
                                            onSelectType={(t) => setWizardData(prev => ({ ...prev, tipo: t }))}
                                            onNext={() => setCurrentStep(getNextStep('study-type'))}
                                            onBack={() => setCurrentStep(getPrevStep('study-type'))}
                                        />
                                    )}

                                    {currentStep === 'fp-details' && (
                                        <FPDetailsStep
                                            key="fp-details"
                                            selectedFamilia={wizardData.familia}
                                            onSelectFamilia={(f) => setWizardData(prev => ({ ...prev, familia: f }))}
                                            selectedNivel={wizardData.nivel}
                                            onSelectNivel={(n) => setWizardData(prev => ({ ...prev, nivel: n }))}
                                            selectedModalidad={wizardData.modalidad}
                                            onSelectModalidad={(m) => setWizardData(prev => ({ ...prev, modalidad: m }))}
                                            onNext={() => setCurrentStep(getNextStep('fp-details'))}
                                            onBack={() => setCurrentStep(getPrevStep('fp-details'))}
                                        />
                                    )}

                                    {currentStep === 'ownership' && (
                                        <OwnershipStep
                                            key="ownership"
                                            selectedNaturaleza={wizardData.naturaleza}
                                            onSelectNaturaleza={(n) => setWizardData(prev => ({ ...prev, naturaleza: n }))}
                                            onSearch={performSearch}
                                            onBack={() => setCurrentStep(getPrevStep('ownership'))}
                                        />
                                    )}

                                    {currentStep === 'searching' && (
                                        <SearchingStep key="searching" />
                                    )}

                                    {currentStep === 'results' && (
                                        <ResultsStep
                                            key="results"
                                            results={results}
                                            onReset={resetWizard}
                                            onClose={handleClose}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
