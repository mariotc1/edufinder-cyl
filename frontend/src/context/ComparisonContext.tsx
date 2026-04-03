'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
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
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

// CONTEXTO DE COMPARADOR
// Gestiona la lista de centros seleccionados para comparar (max 3)
export function ComparisonProvider({ children }: { children: ReactNode }) {
    const [selectedCentros, setSelectedCentros] = useState<Centro[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth(); 

    useEffect(() => {
        // Recuperar estado del comparador desde localStorage
        const saved = localStorage.getItem('edufinder_compare');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setSelectedCentros(parsed);
                }
            } catch (e) {
                console.error("Failed to parse comparison state", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('edufinder_compare', JSON.stringify(selectedCentros));
    }, [selectedCentros]);

    useEffect(() => {
        if (!user) {
            setSelectedCentros([]);
            setIsOpen(false);
            localStorage.removeItem('edufinder_compare');
        }
    }, [user]);

    // Añadir centro al comparador - ESTABILIZADO CON useCallback
    const addToCompare = useCallback((centro: Centro) => {
        setSelectedCentros(prev => {
            if (prev.length >= 3) return prev;
            if (prev.some(c => c.id === centro.id)) return prev;
            return [...prev, centro];
        });
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
        setIsOpen(false);
    }, []);

    const value = useMemo(() => ({
        selectedCentros,
        addToCompare,
        removeFromCompare,
        clearComparison,
        isOpen,
        setIsOpen
    }), [selectedCentros, addToCompare, removeFromCompare, clearComparison, isOpen]);

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
