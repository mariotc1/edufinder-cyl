'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import TourSpotlight from './TourSpotlight';
import TourTooltip from './TourTooltip';

export default function OnboardingTour() {
  const pathname = usePathname();
  const {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    nextStep,
    prevStep,
    skipTour,
  } = useOnboarding();

  const [isMounted, setIsMounted] = useState(false);
  const [isMenuReady, setIsMenuReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle client-side mounting and mobile detection
  useEffect(() => {
    setIsMounted(true);
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle opening mobile menu when step requires it
  useEffect(() => {
    if (!isActive || !currentStep || !isMounted) {
      setIsMenuReady(true);
      return;
    }

    // Check if this step requires mobile menu on mobile
    if (isMobile && currentStep.requiresMobileMenu) {
      setIsMenuReady(false);

      // Dispatch event to open mobile menu
      window.dispatchEvent(new CustomEvent('onboarding:openMobileMenu'));

      // Wait for menu animation to complete before showing tooltip
      const timer = setTimeout(() => {
        setIsMenuReady(true);
      }, 400);

      return () => clearTimeout(timer);
    } else {
      setIsMenuReady(true);
    }
  }, [isActive, currentStep, isMobile, isMounted, currentStepIndex]);

  // Only show on home page
  const isHomePage = pathname === '/';

  // Don't render during SSR or on non-home pages
  if (!isMounted || !isHomePage || !isActive || !currentStep) {
    return null;
  }

  // Wait for menu to be ready on mobile
  if (!isMenuReady && isMobile && currentStep.requiresMobileMenu) {
    return null;
  }

  const targetSelector = isMobile && currentStep.targetSelectorMobile
    ? currentStep.targetSelectorMobile
    : currentStep.targetSelector;

  return (
    <>
      {/* Spotlight overlay */}
      <TourSpotlight
        targetSelector={targetSelector}
        padding={currentStep.spotlightPadding}
        isActive={isActive}
      />

      {/* Tooltip */}
      <TourTooltip
        step={currentStep}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipTour}
        isActive={isActive}
      />
    </>
  );
}
