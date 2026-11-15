'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

export interface Centro {
    id: number;
    nombre: string;
    naturaleza: string;
    localidad: string;
    provincia: string;
}

interface ComparisonContextType {
    selectedCentros: Centro[];
    addToCompare: (centro: Centro) => void;
    removeFromCompare: (id: number) => void;
    clearComparison: () => void;
    replaceComparison: (centros: Centro[]) => void;
    // true mientras la selección se está montando desde las tarjetas y aún no se ha abierto
    pendiente: boolean;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

// CONTEXTO DE COMPARADOR
// Gestiona la lista de centros seleccionados para comparar (max 3)
export function ComparisonProvider({ children }: { children: ReactNode }) {
    const [selectedCentros, setSelectedCentros] = useState<Centro[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [pendiente, setPendiente] = useState(false);
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        // Recuperar estado del comparador desde localStorage
        const saved = localStorage.getItem('edufinder_compare');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setSelectedCentros(parsed);
                }
                setPendiente(localStorage.getItem('edufinder_compare_pendiente') === '1');
            } catch (e) {
                console.error("Failed to parse comparison state", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('edufinder_compare', JSON.stringify(selectedCentros));
    }, [selectedCentros]);

    useEffect(() => {
        localStorage.setItem('edufinder_compare_pendiente', pendiente ? '1' : '0');
    }, [pendiente]);

    // Vaciar al cerrar sesión. Se espera a que AuthContext termine de leer la sesión:
    // durante la carga inicial user es null y, sin esta guarda, cada recarga (o apertura de la PWA)
    // borraba la selección guardada
    useEffect(() => {
        if (!authLoading && !user) {
            setSelectedCentros([]);
            setIsOpen(false);
            localStorage.removeItem('edufinder_compare');
        }
    }, [user, authLoading]);

    // Añadir centro al comparador - ESTABILIZADO CON useCallback
    // Si la selección actual ya se comparó, la siguiente empieza de cero
    const pendienteRef = useRef(pendiente);
    pendienteRef.current = pendiente;

    const addToCompare = useCallback((centro: Centro) => {
        const nueva = !pendienteRef.current;
        pendienteRef.current = true;
        setSelectedCentros(prev => {
            if (nueva) return [centro];
            if (prev.length >= 3) return prev;
            if (prev.some(c => c.id === centro.id)) return prev;
            return [...prev, centro];
        });
        setPendiente(true);
        setIsOpen(true);
    }, []);

    const removeFromCompare = useCallback((id: number) => {
        setSelectedCentros(prev => {
            const next = prev.filter(c => c.id !== id);
            if (next.length <= 1) {
                setIsOpen(false);
            }
            return next;
        });
    }, []);

    const clearComparison = useCallback(() => {
        setSelectedCentros([]);
        setPendiente(false);
        setIsOpen(false);
    }, []);

    // Sustituye la selección entera (elegida en Favoritos o abierta desde un enlace compartido)
    const replaceComparison = useCallback((centros: Centro[]) => {
        setSelectedCentros(centros.slice(0, 3));
        setPendiente(false);
    }, []);

    const value = useMemo(() => ({
        selectedCentros,
        addToCompare,
        removeFromCompare,
        clearComparison,
        replaceComparison,
        pendiente,
        isOpen,
        setIsOpen
    }), [selectedCentros, addToCompare, removeFromCompare, clearComparison, replaceComparison, pendiente, isOpen]);

    return (
        <ComparisonContext.Provider value={value}>
            {children}
        </ComparisonContext.Provider>
    );
}

export function useComparison() {
    const context = useContext(ComparisonContext);
    if (context === undefined) {
        throw new Error('useComparison must be used within a ComparisonProvider');
    }
    return context;
}
