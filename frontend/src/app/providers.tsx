'use client';

import { AuthProvider } from '@/context/AuthContext';
import { FavoritesAnimationProvider } from '@/context/FavoritesAnimationContext';
import { ComparisonProvider } from '@/context/ComparisonContext';
import { OnboardingProvider } from '@/context/OnboardingContext';
import PWAProvider from '@/components/PWAProvider';
import { SplashScreen } from '@/components/pwa/SplashScreen';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ComparisonProvider>
        <FavoritesAnimationProvider>
          <PWAProvider>
            <OnboardingProvider>
              <SplashScreen />
              {children}
            </OnboardingProvider>
          </PWAProvider>
        </FavoritesAnimationProvider>
      </ComparisonProvider>
    </AuthProvider>
  );
}
