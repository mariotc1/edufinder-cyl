'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Define minimal Centro type for comparison to avoid circular deps
// We can expand this Interface as needed based on the API response
export interface Centro {
    id: number;
    nombre: string;
    naturaleza: string;
    localidad: string;
    provincia: string;
    // Add other properties that we might need for the "Tray" preview
    // Detailed properties will be fetched on the comparison page or passed fully
}

interface ComparisonContextType {
    selectedCentros: Centro[];
    addToCompare: (centro: Centro) => void;
    removeFromCompare: (id: number) => void;
    clearComparison: () => void;
    isOpen: boolean; // For mobile/tray visibility
    setIsOpen: (open: boolean) => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
    const [selectedCentros, setSelectedCentros] = useState<Centro[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth(); // Get auth state

    // Load from localStorage on mount (only if user might be logged in, currently we just load it)
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

    // Save to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('edufinder_compare', JSON.stringify(selectedCentros));
    }, [selectedCentros]);

    // Clear comparison when user logs out
    useEffect(() => {
        if (!user) {
            setSelectedCentros([]);
            setIsOpen(false);
            localStorage.removeItem('edufinder_compare');
        }
    }, [user]);

    const addToCompare = (centro: Centro) => {
        // Limit to 3
        if (selectedCentros.length >= 3) {
            // Optional: Show toast "Max 3 schools"
            return;
        }
        // Check duplicate
        if (selectedCentros.some(c => c.id === centro.id)) {
            // Optional: Show toast "Already added"
            return;
        }
        
        setSelectedCentros(prev => [...prev, centro]);
        setIsOpen(true); // Open tray when adding
    };

    const removeFromCompare = (id: number) => {
        setSelectedCentros(prev => prev.filter(c => c.id !== id));
        if (selectedCentros.length <= 1) {
             setIsOpen(false); // Close if empty (or only 1 left effectively 0)
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
