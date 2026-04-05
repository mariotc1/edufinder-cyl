import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { Centro } from '@/types';

// Estructura mínima de un centro visitado para localStorage
export interface VisitedCentro {
    id: number;
    nombre: string;
    localidad: string;
    provincia: string;
    naturaleza: string;
    visitedAt: string; // ISO date
}

const STORAGE_KEY = 'edufinder_visited_centers';
const MAX_VISITED = 20;

// HOOK PERSONALIZADO: GESTIÓN DE CENTROS VISITADOS
// Combina localStorage (para todos) con sincronización al backend (para usuarios logueados)
export function useVisitedCenters() {
    const { user } = useAuth();
    const [visitedCenters, setVisitedCenters] = useState<VisitedCentro[]>([]);
    const [loading, setLoading] = useState(true);

    // Cargar centros visitados desde localStorage
    const loadFromLocalStorage = useCallback((): VisitedCentro[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading visited centers from localStorage:', error);
        }
        return [];
    }, []);

    // Guardar en localStorage
    const saveToLocalStorage = useCallback((centers: VisitedCentro[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(centers));
        } catch (error) {
            console.error('Error saving visited centers to localStorage:', error);
        }
    }, []);

    // Cargar desde el backend (solo para usuarios logueados)
    const loadFromBackend = useCallback(async (): Promise<VisitedCentro[]> => {
        try {
            const response = await api.get('/visited-centers');
            return response.data.map((visit: any) => ({
                id: visit.centro.id,
                nombre: visit.centro.nombre,
                localidad: visit.centro.localidad,
                provincia: visit.centro.provincia,
                naturaleza: visit.centro.naturaleza,
                visitedAt: visit.created_at,
            }));
        } catch (error) {
            console.error('Error loading visited centers from backend:', error);
            return [];
        }
    }, []);

    // Fusionar localStorage con datos del backend
    const mergeAndDedupe = useCallback((local: VisitedCentro[], backend: VisitedCentro[]): VisitedCentro[] => {
        const merged = [...backend, ...local];
        const seen = new Set<number>();
        const deduped = merged.filter(center => {
            if (seen.has(center.id)) return false;
            seen.add(center.id);
            return true;
        });
        // Ordenar por fecha más reciente
        return deduped
            .sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime())
            .slice(0, MAX_VISITED);
    }, []);

    // Cargar datos iniciales
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const localData = loadFromLocalStorage();

            if (user) {
                // Usuario logueado: cargar desde backend y fusionar
                const backendData = await loadFromBackend();
                const merged = mergeAndDedupe(localData, backendData);
                setVisitedCenters(merged);
                saveToLocalStorage(merged);
            } else {
                // Usuario anónimo: solo localStorage
                setVisitedCenters(localData);
            }
            setLoading(false);
        };

        loadData();
    }, [user, loadFromLocalStorage, loadFromBackend, mergeAndDedupe, saveToLocalStorage]);

    // Añadir un centro visitado
    const addVisitedCenter = useCallback((centro: Centro) => {
        const newVisit: VisitedCentro = {
            id: centro.id,
            nombre: centro.nombre,
            localidad: centro.localidad,
            provincia: centro.provincia,
            naturaleza: centro.naturaleza,
            visitedAt: new Date().toISOString(),
        };

        setVisitedCenters(prev => {
            // Eliminar si ya existe para moverlo al principio
            const filtered = prev.filter(c => c.id !== centro.id);
            const updated = [newVisit, ...filtered].slice(0, MAX_VISITED);
            saveToLocalStorage(updated);
            return updated;
        });
    }, [saveToLocalStorage]);

    // Limpiar historial
    const clearHistory = useCallback(async () => {
        setVisitedCenters([]);
        localStorage.removeItem(STORAGE_KEY);

        // Si está logueado, también eliminar en el backend
        if (user) {
            try {
                await api.delete('/visited-centers');
            } catch (error) {
                console.error('Error clearing history from backend:', error);
            }
        }
    }, [user]);

    // Eliminar un centro específico del historial
    const removeFromHistory = useCallback(async (centroId: number) => {
        setVisitedCenters(prev => {
            const updated = prev.filter(c => c.id !== centroId);
            saveToLocalStorage(updated);
            return updated;
        });

        // Si está logueado, también eliminar en el backend
        if (user) {
            try {
                await api.delete(`/visited-centers/${centroId}`);
            } catch (error) {
                console.error('Error removing from backend:', error);
            }
        }
    }, [saveToLocalStorage, user]);

    return {
        visitedCenters,
        loading,
        addVisitedCenter,
        clearHistory,
        removeFromHistory,
    };
}
