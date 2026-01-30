'use client';

import { AuthProvider } from '@/context/AuthContext';
import { FavoritesAnimationProvider } from '@/context/FavoritesAnimationContext';
import { ComparisonProvider } from '@/context/ComparisonContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ComparisonProvider>
        <FavoritesAnimationProvider>
          {children}
        </FavoritesAnimationProvider>
      </ComparisonProvider>
    </AuthProvider>
  );
}
