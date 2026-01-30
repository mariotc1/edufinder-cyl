'use client';

import { Scale } from 'lucide-react';
import { useComparison, Centro } from '@/context/ComparisonContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AddToCompareButtonProps {
    centro: Centro;
    className?: string;
    showLabel?: boolean;
}

export default function AddToCompareButton({ centro, className, showLabel = false }: AddToCompareButtonProps) {
    const { selectedCentros, addToCompare, removeFromCompare } = useComparison();
    const { user, openLoginModal } = useAuth();
    
    // Check if this specific centro is already selected
    const isSelected = selectedCentros.some(c => c.id === centro.id);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if inside a Link
        e.stopPropagation();
        
        if (!user) {
            openLoginModal();
            return;
        }

        if (isSelected) {
            removeFromCompare(centro.id);
        } else {
            addToCompare(centro);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                "group relative flex items-center gap-2 transition-all p-1.5 rounded-full",
                isSelected 
                    ? "bg-[#223945] text-white shadow-md" 
                    : "bg-white/80 hover:bg-white text-neutral-500 hover:text-[#223945] shadow-sm border border-neutral-100",
                className
            )}
            title={isSelected ? "Quitar del comparador" : "Comparar este centro"}
        >
             <motion.div
                whileTap={{ scale: 0.9 }}
                animate={isSelected ? { rotate: [0, -10, 10, 0] } : {}}
             >
                <Scale className={cn("w-4 h-4", isSelected ? "stroke-2" : "stroke-[1.5]")} />
             </motion.div>
             
             {showLabel && (
                 <span className={cn("text-xs font-bold uppercase tracking-wider pr-1", isSelected ? "text-white" : "text-neutral-600")}>
                     {isSelected ? "Añadido" : "Comparar"}
                 </span>
             )}
        </button>
    );
}
