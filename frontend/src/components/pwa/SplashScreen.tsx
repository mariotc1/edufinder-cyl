'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

/**
 * Detecta si la app está en modo standalone (PWA instalada)
 */
function getIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = 'standalone' in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  return isStandaloneMedia || isIOSStandalone;
}

function subscribe(callback: () => void): () => void {
  const mediaQuery = window.matchMedia('(display-mode: standalone)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function useIsStandalone(): boolean {
  return useSyncExternalStore(
    subscribe,
    getIsStandalone,
    () => false // Server snapshot
  );
}

/**
 * SplashScreen para PWA
 * Se muestra solo cuando la app está instalada (modo standalone)
 */
export function SplashScreen() {
  const isStandalone = useIsStandalone();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isStandalone) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isStandalone]);

  if (!isStandalone || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(to bottom, #dbeafe, #ffffff, #eff6ff)',
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative w-36 h-36 sm:w-44 sm:h-44"
        >
          <Image
            src="/img/logo-edufinderCYL.png"
            alt="EduFinder CYL"
            fill
            priority
            className="object-contain"
          />
        </motion.div>

        {/* Nombre */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-[#223945]">
            EduFinder <span className="text-[#f59e0b]">CYL</span>
          </h1>
          <p className="mt-2 text-sm text-[#64748b]">
            Encuentra tu centro educativo
          </p>
        </motion.div>

        {/* Indicador de carga */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex gap-1.5"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-[#223945]/40"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-8 text-xs text-[#94a3b8]"
        >
          Datos abiertos de Castilla y León
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
