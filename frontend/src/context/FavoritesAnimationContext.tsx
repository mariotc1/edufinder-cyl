'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface CardData {
    title: string;
    naturaleza: string;
}

interface AnimationItem {
  id: string;
  startRect: DOMRect;
  targetId: string; // ID of the navbar icon
  data: CardData;
}

interface FavoritesAnimationContextType {
  triggerAnimation: (startRect: DOMRect, data: CardData) => void;
  favoritesPulse: boolean;
}

const FavoritesAnimationContext = createContext<FavoritesAnimationContextType | undefined>(undefined);

export function FavoritesAnimationProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<AnimationItem[]>([]);
  const [favoritesPulse, setFavoritesPulse] = useState(false);
  
  const triggerAnimation = (startRect: DOMRect, data: CardData) => {
    const id = Math.random().toString(36).substring(7);
    // Determine target based on viewport width (mobile vs desktop)
    const targetId = window.innerWidth >= 768 ? 'nav-favorites-icon-desktop' : 'nav-mobile-menu-button';
    
    setItems(prev => [...prev, { id, startRect, targetId, data }]);

    // Trigger pulse right when the animation is expected to end (1.2s duration)
    // We trigger it slightly before the end (1.0s) for better visual overlap
    setTimeout(() => {
        setFavoritesPulse(true);
        // Turn off pulse shortly after
        setTimeout(() => setFavoritesPulse(false), 300);
    }, 1000);

    // Clean up animation item
    setTimeout(() => {
      setItems(prev => prev.filter(item => item.id !== id));
    }, 1400); // 1.2s animation + buffer
  };

  return (
    <FavoritesAnimationContext.Provider value={{ triggerAnimation, favoritesPulse }}>
      {children}
      
      {/* Animation Layer */}
      <div className="fixed inset-0 pointer-events-none z-[100]">
        <AnimatePresence>
          {items.map(item => (
            <FlyingCard key={item.id} item={item} />
          ))}
        </AnimatePresence>
      </div>
    </FavoritesAnimationContext.Provider>
  );
}

function FlyingCard({ item }: { item: AnimationItem }) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const target = document.getElementById(item.targetId);
    if (target) {
      setTargetRect(target.getBoundingClientRect());
    }
  }, [item.targetId]);

  if (!targetRect) return null;

  // Helper for badge color - same as CentroCard logic
  const getNaturalezaBadge = (naturaleza: string) => {
    switch (naturaleza?.toUpperCase()) {
      case "PÚBLICO": return "bg-blue-50 text-blue-700 border-blue-200";
      case "PRIVADO": return "bg-amber-50 text-amber-700 border-amber-200";
      case "CONCERTADO": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <motion.div
      initial={{ 
        position: 'fixed',
        left: item.startRect.left,
        top: item.startRect.top,
        width: item.startRect.width,
        height: item.startRect.height,
        opacity: 1,
        scale: 1,
        borderRadius: "0.75rem", // rounded-xl
        zIndex: 100 
      }}
      animate={{ 
        left: targetRect.left + (targetRect.width / 2) - (item.startRect.width / 2),
        top: targetRect.top + (targetRect.height / 2) - (item.startRect.height / 2),
        scale: 0.1,
        opacity: 0,
        borderRadius: "50%" // Morph into circle as it enters
      }}
      transition={{ 
        duration: 1.2,  // Slower duration
        ease: [0.2, 0.8, 0.2, 1], // More emphasis on start accel
      }}
      className="bg-white border border-neutral-200 shadow-2xl overflow-hidden flex flex-col pointer-events-none"
    >
        {/* Simplified Card Content for the "Ghost" */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-primary-500 to-primary-300"></div>
        
        <div className="p-5 flex-grow flex flex-col">
            <div className="flex justify-start items-center gap-2 mb-3">
                 <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border ${getNaturalezaBadge(item.data.naturaleza)}`}>
                    {item.data.naturaleza || "Otro"}
                 </span>
            </div>
            
            <h3 className="text-[17px] font-bold text-[#111827] mb-3 line-clamp-2 leading-snug">
                {item.data.title}
            </h3>
            
            <div className="mt-auto opacity-50">
                 <div className="h-2 w-1/2 bg-neutral-100 rounded mb-2"></div>
                 <div className="h-2 w-3/4 bg-neutral-100 rounded"></div>
            </div>
        </div>
    </motion.div>
  );
}

export function useFavoritesAnimation() {
  const context = useContext(FavoritesAnimationContext);
  if (!context) {
    throw new Error('useFavoritesAnimation must be used within FavoritesAnimationProvider');
  }
  return context;
}
