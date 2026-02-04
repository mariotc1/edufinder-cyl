'use client';

import { AuthProvider } from '@/context/AuthContext';
import { FavoritesAnimationProvider } from '@/context/FavoritesAnimationContext';
import { ComparisonProvider } from '@/context/ComparisonContext';

// PROVEEDORES GLOBALES DE CLIENTE (CLIENT PROVIDERS)
// Envuelve la aplicación con los contextos necesarios (Auth, Animation, Comparison)
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