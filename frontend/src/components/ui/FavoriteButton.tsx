import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
    isFavorite: boolean;
    onClick: (e: React.MouseEvent) => void;
    className?: string;
    loading?: boolean;
}

export default function FavoriteButton({ isFavorite, onClick, className = '', loading = false }: FavoriteButtonProps) {
    return (
        <motion.button
            onClick={onClick}
            whileTap={{ scale: 0.8 }}
            className={`p-3 rounded-full bg-white border border-neutral-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all group ${className}`}
            title={isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
            disabled={loading}
        >
            <Heart 
                className={`w-8 h-8 transition-colors ${
                    isFavorite 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-neutral-300 group-hover:text-red-400'
                }`} 
            />
        </motion.button>
    );
}
