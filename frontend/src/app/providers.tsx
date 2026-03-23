'use client';

import { AuthProvider } from '@/context/AuthContext';
import { FavoritesAnimationProvider } from '@/context/FavoritesAnimationContext';
import { ComparisonProvider } from '@/context/ComparisonContext';
import PWAProvider from '@/components/PWAProvider';

// PROVEEDORES GLOBALES DE CLIENTE (CLIENT PROVIDERS)
// Envuelve la aplicación con los contextos necesarios (Auth, Animation, Comparison, PWA)
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ComparisonProvider>
        <FavoritesAnimationProvider>
          <PWAProvider>
            {children}
          </PWAProvider>
        </FavoritesAnimationProvider>
      </ComparisonProvider>
    </AuthProvider>
  );
}