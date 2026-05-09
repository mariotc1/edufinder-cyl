'use client';

import { motion } from 'framer-motion';

// Template de transición de página
// Se ejecuta en cada navegación, proporcionando animación suave entre páginas
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94], // Ease out quart - suave y natural
      }}
    >
      {children}
    </motion.div>
  );
}
