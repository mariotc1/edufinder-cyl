import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';

export interface CycleSearchHistoryItem {
    id?: number;           // Solo existe si viene del backend
    search_term: string;
    updated_at?: string;   // ISO date
}

const STORAGE_KEY = 'edufinder_cycle_search_history';
const MAX_HISTORY_ITEMS = 8;

// HOOK PERSONALIZADO: GESTIÓN DE HISTORIAL DE BÚSQUEDAS DE CICLOS FP
// Combina localStorage (para todos) con sincronización al backend (para usuarios logueados)
export function useCycleSearchHistory() {
    const { user } = useAuth();
    const [history, setHistory] = useState<CycleSearchHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Cargar historial desde localStorage
    const loadFromLocalStorage = useCallback((): CycleSearchHistoryItem[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading cycle search history from localStorage:', error);
        }
        return [];
    }, []);

    // Guardar en localStorage
    const saveToLocalStorage = useCallback((items: CycleSearchHistoryItem[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (error) {
            console.error('Error saving cycle search history to localStorage:', error);
        }
    }, []);

    // Sincronizar con el backend (solo para usuarios logueados)
    const syncWithBackend = useCallback(async (localItems: CycleSearchHistoryItem[]): Promise<CycleSearchHistoryItem[]> => {
        try {
            const terms = localItems.map(item => item.search_term);
            const response = await api.post('/cycle-search-history/sync', { items: terms });
            return response.data.history.map((item: any) => ({
                id: item.id,
                search_term: item.search_term,
                updated_at: item.updated_at,
            }));
        } catch (error) {
            console.error('Error syncing cycle search history with backend:', error);
            return localItems;
        }
    }, []);

    // Cargar desde el backend (solo para usuarios logueados)
    const loadFromBackend = useCallback(async (): Promise<CycleSearchHistoryItem[]> => {
        try {
            const response = await api.get('/cycle-search-history');
            return response.data.map((item: any) => ({
                id: item.id,
                search_term: item.search_term,
                updated_at: item.updated_at,
            }));
        } catch (error) {
            console.error('Error loading cycle search history from backend:', error);
            return [];
        }
    }, []);

    // Cargar datos iniciales
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const localData = loadFromLocalStorage();

            if (user) {
                if (localData.length > 0) {
                    // Hay datos locales: sincronizar con backend
                    const synced = await syncWithBackend(localData);
                    setHistory(synced);
                    saveToLocalStorage(synced);
                } else {
                    // No hay datos locales: solo cargar del backend
                    const backendData = await loadFromBackend();
                    setHistory(backendData);
                    saveToLocalStorage(backendData);
                }
            } else {
                // Usuario anónimo: solo localStorage
                setHistory(localData);
            }
            setLoading(false);
        };

        loadData();
    }, [user, loadFromLocalStorage, loadFromBackend, syncWithBackend, saveToLocalStorage]);

    // Añadir un término al historial
    const addToHistory = useCallback(async (searchTerm: string) => {
        const term = searchTerm.trim();
        if (!term) return;

        // Actualizar estado local inmediatamente
        setHistory(prev => {
            const filtered = prev.filter(item =>
                item.search_term.toLowerCase() !== term.toLowerCase()
            );
            const newItem: CycleSearchHistoryItem = {
                search_term: term,
                updated_at: new Date().toISOString(),
            };
            const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
            saveToLocalStorage(updated);
            return updated;
        });

        // Si está logueado, guardar en el backend
        if (user) {
            try {
                const response = await api.post('/cycle-search-history', { search_term: term });
                setHistory(prev => {
                    const updated = prev.map(item =>
                        item.search_term.toLowerCase() === term.toLowerCase()
                            ? { ...item, id: response.data.item.id }
                            : item
                    );
                    saveToLocalStorage(updated);
                    return updated;
                });
            } catch (error) {
                console.error('Error saving to backend:', error);
            }
        }
    }, [user, saveToLocalStorage]);

    // Eliminar un término del historial
    const removeFromHistory = useCallback(async (searchTerm: string, itemId?: number) => {
        // Buscar el ID si no se proporcionó
        let idToDelete = itemId;
        if (!idToDelete) {
            const item = history.find(h =>
                h.search_term.toLowerCase() === searchTerm.toLowerCase()
            );
            idToDelete = item?.id;
        }

        setHistory(prev => {
            const updated = prev.filter(item =>
                item.search_term.toLowerCase() !== searchTerm.toLowerCase()
            );
            saveToLocalStorage(updated);
            return updated;
        });

        // Si está logueado y tenemos ID, eliminar del backend
        if (user && idToDelete) {
            try {
                await api.delete(`/cycle-search-history/${idToDelete}`);
            } catch (error) {
                console.error('Error removing from backend:', error);
            }
        }
    }, [user, saveToLocalStorage, history]);

    // Limpiar todo el historial
    const clearHistory = useCallback(async () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);

        if (user) {
            try {
                await api.delete('/cycle-search-history');
            } catch (error) {
                console.error('Error clearing history from backend:', error);
            }
        }
    }, [user]);

    return {
        history,
        loading,
        addToHistory,
        removeFromHistory,
        clearHistory,
    };
}
