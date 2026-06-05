'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useNavDirection } from '@/context/NavigationContext';

// Apple easing — snappy deceleration
const EASE_OUT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

type AnimConfig = {
  initial: Record<string, number>;
  animate: Record<string, number>;
  duration: number;
};

function getAnim(direction: 'push' | 'pop' | 'tab', pathname: string): AnimConfig {
  // Tab switch — pure cross-fade, feels instant
  if (direction === 'tab') {
    return {
      initial:  { opacity: 0 },
      animate:  { opacity: 1 },
      duration: 0.13,
    };
  }

  // Pop (back navigation) — slide out from left
  if (direction === 'pop') {
    return {
      initial:  { opacity: 0, x: -14 },
      animate:  { opacity: 1, x: 0 },
      duration: 0.2,
    };
  }

  // Push — auth pages emerge from below (modal feel)
  const isAuth =
    pathname.startsWith('/login') ||
    pathname.startsWith('/registro') ||
    pathname.startsWith('/forgot') ||
    pathname.startsWith('/reset') ||
    pathname.startsWith('/verificar');

  if (isAuth) {
    return {
      initial:  { opacity: 0, y: 16 },
      animate:  { opacity: 1, y: 0 },
      duration: 0.22,
    };
  }

  // Push — detail pages slide in from right
  return {
    initial:  { opacity: 0, x: 16 },
    animate:  { opacity: 1, x: 0 },
    duration: 0.22,
  };
}

export default function Template({ children }: { children: React.ReactNode }) {
  const direction = useNavDirection();
  const pathname  = usePathname();
  const { initial, animate, duration } = getAnim(direction, pathname);

  return (
    <div style={{ overflowX: 'hidden', width: '100%' }}>
      <motion.div
        key={pathname}
        initial={initial}
        animate={animate}
        transition={{ duration, ease: EASE_OUT }}
      >
        {children}
      </motion.div>
    </div>
  );
}
