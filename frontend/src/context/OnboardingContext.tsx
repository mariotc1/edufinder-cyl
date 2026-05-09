'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { tourSteps, type TourStep } from '@/components/onboarding/tourSteps';
import { hapticFeedback } from '@/lib/haptics';

const STORAGE_KEY = 'edufinder_onboarding_completed';

interface OnboardingContextType {
  isActive: boolean;
  currentStepIndex: number;
  currentStep: TourStep | null;
  totalSteps: number;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  restartTour: () => void;
  hasCompletedOnboarding: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const hasCompleted = !!stored;
      setHasCompletedOnboarding(hasCompleted);

      // Auto-start tour if never completed
      if (!hasCompleted) {
        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
          setIsActive(true);
          hapticFeedback('success'); // Vibración de bienvenida
        }, 1000);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('Error reading onboarding state:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const currentStep = isActive ? tourSteps[currentStepIndex] : null;

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < tourSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Last step - complete the tour
      completeTour();
    }
  }, [currentStepIndex]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const completeTour = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
    setIsActive(false);
    setCurrentStepIndex(0);
  }, []);

  const skipTour = useCallback(() => {
    completeTour();
  }, [completeTour]);

  const restartTour = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Error removing onboarding state:', error);
    }
    setCurrentStepIndex(0);
    setIsActive(true);
    hapticFeedback('success'); // Vibración de bienvenida al reiniciar
  }, []);

  // Don't render until initialized to prevent hydration mismatch
  if (!isInitialized) {
    return <>{children}</>;
  }

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        currentStepIndex,
        currentStep,
        totalSteps: tourSteps.length,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        completeTour,
        restartTour,
        hasCompletedOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    // Return a no-op context for pages outside the provider (e.g., admin)
    return {
      isActive: false,
      currentStepIndex: 0,
      currentStep: null,
      totalSteps: 0,
      startTour: () => {},
      nextStep: () => {},
      prevStep: () => {},
      skipTour: () => {},
      completeTour: () => {},
      restartTour: () => {},
      hasCompletedOnboarding: true,
    };
  }
  return context;
}
