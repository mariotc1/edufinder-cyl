import { useState, useEffect, useCallback } from 'react';
import { mutate } from 'swr';
import { useAuth } from '@/context/AuthContext';
import { toggleCicloFavorite, getCiclosFavoritosByCentro } from '@/services/api';

interface UseCicloFavoriteProps {
    centroId: number;
}

interface UseCicloFavoriteReturn {
    ciclosFavoritosIds: number[];
    isLoading: boolean;
    toggleCiclo: (cicloId: number) => Promise<void>;
    isCicloFavorito: (cicloId: number) => boolean;
}

/**
 * HOOK: GESTIÓN DE CICLOS FAVORITOS
 *
 * Maneja el estado de ciclos favoritos para un centro específico.
 * Permite toggle de like y verifica si un ciclo está en favoritos.
 */
export function useCicloFavorite({ centroId }: UseCicloFavoriteProps): UseCicloFavoriteReturn {
    const { user, openLoginModal } = useAuth();
    const [ciclosFavoritosIds, setCiclosFavoritosIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingCicloId, setLoadingCicloId] = useState<number | null>(null);

    // Cargar ciclos favoritos del centro cuando hay usuario
    useEffect(() => {
        if (!user || !centroId) {
            setCiclosFavoritosIds([]);
            return;
        }

        const loadCiclosFavoritos = async () => {
            try {
                const data = await getCiclosFavoritosByCentro(centroId);
                setCiclosFavoritosIds(data.ciclo_ids || []);
            } catch {
                setCiclosFavoritosIds([]);
            }
        };

        loadCiclosFavoritos();
    }, [user, centroId]);

    // Toggle favorito de un ciclo
    const toggleCiclo = useCallback(async (cicloId: number) => {
        if (!user) {
            openLoginModal();
            return;
        }

        if (loadingCicloId === cicloId) return;

        // Estado optimista
        const wasLiked = ciclosFavoritosIds.includes(cicloId);
        const newIds = wasLiked
            ? ciclosFavoritosIds.filter(id => id !== cicloId)
            : [...ciclosFavoritosIds, cicloId];

        setCiclosFavoritosIds(newIds);
        setLoadingCicloId(cicloId);

        try {
            const response = await toggleCicloFavorite(cicloId);

            // Actualizar estado basado en respuesta del servidor
            if (response.is_favorite) {
                if (!newIds.includes(cicloId)) {
                    setCiclosFavoritosIds([...newIds, cicloId]);
                }
            } else {
                setCiclosFavoritosIds(newIds.filter(id => id !== cicloId));
            }

            // Revalidar favoritos (por si se añadió el centro automáticamente)
            if (response.centro_added) {
                mutate('/favoritos');
            }

            // Revalidar recomendaciones
            mutate('/recommendations/favorites');

        } catch {
            // Revertir estado optimista en caso de error
            setCiclosFavoritosIds(wasLiked
                ? [...ciclosFavoritosIds]
                : ciclosFavoritosIds.filter(id => id !== cicloId)
            );
        } finally {
            setLoadingCicloId(null);
        }
    }, [user, openLoginModal, ciclosFavoritosIds, loadingCicloId]);

    // Verificar si un ciclo está en favoritos
    const isCicloFavorito = useCallback((cicloId: number): boolean => {
        return ciclosFavoritosIds.includes(cicloId);
    }, [ciclosFavoritosIds]);

    return {
        ciclosFavoritosIds,
        isLoading,
        toggleCiclo,
        isCicloFavorito,
    };
}
