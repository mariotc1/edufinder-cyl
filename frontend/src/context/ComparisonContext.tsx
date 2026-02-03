'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

export function ComparisonProvider({ children }: { children: ReactNode }) {
    const [selectedCentros, setSelectedCentros] = useState<Centro[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth(); 

    useEffect(() => {
        const saved = localStorage.getItem('edufinder_compare');
        if (saved) {
            try {
                setSelectedCentros(JSON.parse(saved));
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

    const addToCompare = (centro: Centro) => {
        if (selectedCentros.length >= 3) {
            return;
        }
        if (selectedCentros.some(c => c.id === centro.id)) {
            return;
        }
        
        setSelectedCentros(prev => [...prev, centro]);
        setIsOpen(true);
    };

    const removeFromCompare = (id: number) => {
        setSelectedCentros(prev => prev.filter(c => c.id !== id));
        if (selectedCentros.length <= 1) {
             setIsOpen(false);
        }
    };

    const clearComparison = () => {
        setSelectedCentros([]);
        setIsOpen(false);
    };

    return (
        <ComparisonContext.Provider value={{ 
            selectedCentros, 
            addToCompare, 
            removeFromCompare, 
            clearComparison,
            isOpen,
            setIsOpen
        }}>
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