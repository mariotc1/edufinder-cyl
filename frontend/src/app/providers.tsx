'use client';

import { AuthProvider } from '@/context/AuthContext';
import { FavoritesAnimationProvider } from '@/context/FavoritesAnimationContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FavoritesAnimationProvider>
        {children}
      </FavoritesAnimationProvider>
    </AuthProvider>
  );
}
