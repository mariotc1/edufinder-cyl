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

export function useFavorite({ centro, initialIsFavorite = false, onToggle }: UseFavoriteProps) {
    const { user, openLoginModal } = useAuth();
    const { triggerAnimation } = useFavoritesAnimation();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    const toggleFavorite = async (e: React.MouseEvent, elementRef?: HTMLElement) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            openLoginModal();
            return;
        }

        if (loading) return;

        // Optimistic update
        const newStatus = !isFavorite;
        setIsFavorite(newStatus);
        if (onToggle) onToggle(newStatus);

        // Trigger Animation
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
            mutate('/favoritos'); // Revalidate global favorites cache
        } catch (error) {
            // Revert
            setIsFavorite(!newStatus);
            if (onToggle) onToggle(!newStatus);
        } finally {
            setLoading(false);
        }
    };

    return { isFavorite, toggleFavorite, loading };
}
