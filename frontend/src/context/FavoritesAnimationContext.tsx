'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

interface AnimationItem {
  id: string;
  startRect: DOMRect;
  targetId: string; // ID of the navbar icon
}

interface FavoritesAnimationContextType {
  triggerAnimation: (startRect: DOMRect) => void;
}

const FavoritesAnimationContext = createContext<FavoritesAnimationContextType | undefined>(undefined);

export function FavoritesAnimationProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<AnimationItem[]>([]);
  
  const triggerAnimation = (startRect: DOMRect) => {
    const id = Math.random().toString(36).substring(7);
    // Determine target based on viewport width (mobile vs desktop)
    const targetId = window.innerWidth >= 768 ? 'nav-favorites-icon-desktop' : 'nav-mobile-menu-button';
    
    setItems(prev => [...prev, { id, startRect, targetId }]);

    // Clean up after animation
    setTimeout(() => {
      setItems(prev => prev.filter(item => item.id !== id));
    }, 1000);
  };

  return (
    <FavoritesAnimationContext.Provider value={{ triggerAnimation }}>
      {children}
      
      {/* Animation Layer */}
      <div className="fixed inset-0 pointer-events-none z-[100]">
        <AnimatePresence>
          {items.map(item => (
            <FlyingHeart key={item.id} item={item} />
          ))}
        </AnimatePresence>
      </div>
    </FavoritesAnimationContext.Provider>
  );
}

function FlyingHeart({ item }: { item: AnimationItem }) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const target = document.getElementById(item.targetId);
    if (target) {
      setTargetRect(target.getBoundingClientRect());
    }
  }, [item.targetId]);

  if (!targetRect) return null;

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
        zIndex: 100 
      }}
      animate={{ 
        left: targetRect.left + (targetRect.width / 2) - (item.startRect.width / 2),
        top: targetRect.top + (targetRect.height / 2) - (item.startRect.height / 2),
        scale: 0.5,
        opacity: 0
      }}
      transition={{ 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1], // Custom cubic bezier for smooth flight
      }}
      className="flex items-center justify-center text-red-500"
    >
      <Heart className="w-full h-full fill-red-500" />
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
