import { useState, useEffect } from 'react';
import { mutate } from 'swr';
import { useAuth } from '@/context/AuthContext';
import { useFavoritesAnimation } from '@/context/FavoritesAnimationContext';
import { addFavorite, removeFavorite } from '@/services/api';
import { Centro } from '@/types';

interface UseFavoriteProps {
    centro: Centro;
    initialIsFavorite?: boolean;
    onToggle?: (newStatus: boolean) => void;
}

// HOOK PERSONALIZADO: GESTIÓN DE FAVORITOS
// Maneja la lógica de añadir/quitar favoritos, animación y estado de carga
export function useFavorite({ centro, initialIsFavorite = false, onToggle }: UseFavoriteProps) {
    const { user, openLoginModal } = useAuth();
    const { triggerAnimation } = useFavoritesAnimation();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    // Acción de alternar favorito (toggle)
    const toggleFavorite = async (e: React.MouseEvent, elementRef?: HTMLElement) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            openLoginModal();
            return;
        }

        if (loading) return;

        const newStatus = !isFavorite;
        setIsFavorite(newStatus);
        if (onToggle) onToggle(newStatus);

        // Dispara la animación de "vuelo" hacia el icono de favoritos si se añade
        if (newStatus && elementRef) {
            const rect = elementRef.getBoundingClientRect();
            triggerAnimation(rect, {
                title: centro.nombre,
                naturaleza: centro.naturaleza
            });
        }

        setLoading(true);
        try {
            if (newStatus) {
                await addFavorite(centro.id);
            } else {
                await removeFavorite(centro.id);
            }
            mutate('/favoritos');

        } catch (error) {
            // Revertir estado optimista en caso de error
            setIsFavorite(!newStatus);
            if (onToggle) onToggle(!newStatus);

        } finally {
            setLoading(false);
        }
    };

    return { isFavorite, toggleFavorite, loading };
}
