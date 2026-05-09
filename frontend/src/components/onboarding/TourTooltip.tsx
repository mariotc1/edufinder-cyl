'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, Heart, MapPin, Hand, ChevronRight, X } from 'lucide-react';
import TourProgress from './TourProgress';
import type { TourStep } from './tourSteps';

interface TourTooltipProps {
  step: TourStep;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  onPrev: () => void;
  isActive: boolean;
}

const iconMap = {
  sparkles: Sparkles,
  search: Search,
  heart: Heart,
  map: MapPin,
  'hand-wave': Hand,
};

export default function TourTooltip({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onSkip,
  onPrev,
  isActive,
}: TourTooltipProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [desktopPosition, setDesktopPosition] = useState<{ top: number; left: number } | null>(null);
  const [elementNotFound, setElementNotFound] = useState(false);

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const isCenteredStep = !step.targetSelector || step.placement === 'center';

  // Detect viewport and mobile state
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateViewport = () => {
      // Use visualViewport for accurate mobile viewport (accounts for keyboard, etc.)
      const vh = window.visualViewport?.height || window.innerHeight;
      const vw = window.innerWidth;
      setViewportHeight(vh);
      setIsMobile(vw < 768);
    };

    updateViewport();

    window.addEventListener('resize', updateViewport);
    window.visualViewport?.addEventListener('resize', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.visualViewport?.removeEventListener('resize', updateViewport);
    };
  }, []);

  // Calculate desktop position (only for non-mobile, non-centered steps)
  useEffect(() => {
    if (!isActive || isMobile || isCenteredStep) {
      setDesktopPosition(null);
      setElementNotFound(false);
      return;
    }

    const calculateDesktopPosition = () => {
      const targetSelector = step.targetSelector;
      if (!targetSelector) {
        setElementNotFound(true);
        return;
      }

      const element = document.querySelector(targetSelector);
      if (!element) {
        // Element not found - use centered fallback
        setDesktopPosition(null);
        setElementNotFound(true);
        return;
      }

      // Element found
      setElementNotFound(false);
      const rect = element.getBoundingClientRect();
      const padding = step.spotlightPadding || 8;
      const tooltipGap = 16;
      const tooltipWidth = 380;
      const tooltipHeight = 320;

      let top = rect.bottom + padding + tooltipGap;
      let left = rect.left + rect.width / 2;

      // Check vertical overflow
      if (top + tooltipHeight > window.innerHeight - 20) {
        // Place above the element
        top = rect.top - padding - tooltipGap - tooltipHeight;
        if (top < 20) {
          // If still overflows, center vertically
          top = (window.innerHeight - tooltipHeight) / 2;
        }
      }

      // Check horizontal overflow
      if (left - tooltipWidth / 2 < 16) {
        left = tooltipWidth / 2 + 16;
      } else if (left + tooltipWidth / 2 > window.innerWidth - 16) {
        left = window.innerWidth - tooltipWidth / 2 - 16;
      }

      setDesktopPosition({ top, left });
    };

    const timer = setTimeout(calculateDesktopPosition, 100);
    window.addEventListener('resize', calculateDesktopPosition);
    window.addEventListener('scroll', calculateDesktopPosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateDesktopPosition);
      window.removeEventListener('scroll', calculateDesktopPosition, true);
    };
  }, [isActive, isMobile, isCenteredStep, step]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        onNext();
      } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onSkip, onNext, onPrev, currentStepIndex]);

  const Icon = step.icon ? iconMap[step.icon] : null;

  if (!isActive) return null;

  // Animation variants
  const mobileVariants = {
    initial: { opacity: 0, y: 100 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 400, damping: 35 }
    },
    exit: { opacity: 0, y: 50, transition: { duration: 0.2 } },
  };

  const desktopVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 400, damping: 30 }
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  const centeredVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 300, damping: 25 }
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  // Check if target element exists on mobile
  const [mobileElementNotFound, setMobileElementNotFound] = useState(false);

  useEffect(() => {
    if (!isActive || !isMobile || isCenteredStep) {
      setMobileElementNotFound(false);
      return;
    }

    const targetSelector = step.targetSelectorMobile || step.targetSelector;
    if (!targetSelector) {
      setMobileElementNotFound(true);
      return;
    }

    // Check with a slight delay to allow DOM updates
    const timer = setTimeout(() => {
      const element = document.querySelector(targetSelector);
      setMobileElementNotFound(!element);
    }, 150);

    return () => clearTimeout(timer);
  }, [isActive, isMobile, isCenteredStep, step, currentStepIndex]);

  // Determine which layout to use
  // Use centered fallback when element not found
  const useMobileLayout = isMobile && !isCenteredStep && !mobileElementNotFound;
  const useCenteredLayout = isCenteredStep || (!isMobile && elementNotFound) || (isMobile && mobileElementNotFound);

  return (
    <AnimatePresence mode="wait">
      {/* MOBILE LAYOUT: Bottom sheet style */}
      {useMobileLayout && (
        <motion.div
          key={`mobile-${step.id}`}
          variants={mobileVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed z-[201] inset-x-0 bottom-0 px-3 pb-3 pointer-events-auto"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden max-w-lg mx-auto">
            {/* Gradient top bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300" />

            {/* Drag indicator */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-neutral-300 rounded-full" />
            </div>

            {/* Skip button */}
            <button
              onClick={onSkip}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-500"
              aria-label="Saltar tour"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content - Compact for mobile */}
            <div className="px-5 pt-2 pb-5">
              <div className="flex items-start gap-4">
                {/* Icon - Smaller on mobile */}
                {Icon && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                    className="w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-[#223945] to-blue-600 flex items-center justify-center shadow-lg"
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                )}

                {/* Text content */}
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-lg font-bold text-[#223945] mb-1">
                    {step.title}
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Progress + Actions row */}
              <div className="mt-5 flex items-center justify-between gap-4">
                {/* Progress dots - Smaller */}
                <div className="flex-shrink-0">
                  <TourProgress currentStep={currentStepIndex} totalSteps={totalSteps} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {isFirstStep ? (
                    <button
                      onClick={onSkip}
                      className="px-3 py-2 text-sm font-medium text-neutral-500"
                    >
                      Saltar
                    </button>
                  ) : (
                    <button
                      onClick={onPrev}
                      className="px-3 py-2 text-sm font-medium text-neutral-500"
                    >
                      Atrás
                    </button>
                  )}

                  <motion.button
                    onClick={onNext}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#223945] to-blue-600 text-white text-sm font-bold rounded-xl shadow-lg"
                  >
                    {isLastStep ? 'Finalizar' : 'Siguiente'}
                    {!isLastStep && <ChevronRight className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* CENTERED LAYOUT: Welcome step & mobile centered */}
      {useCenteredLayout && (
        <motion.div
          key={`centered-${step.id}`}
          variants={centeredVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed z-[201] inset-0 flex items-center justify-center p-4 pointer-events-auto"
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden w-full"
            style={{ maxWidth: '380px', maxHeight: `${viewportHeight - 32}px` }}
          >
            {/* Gradient top bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300" />

            {/* Skip button */}
            <button
              onClick={onSkip}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600 z-10"
              aria-label="Saltar tour"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="px-6 pt-8 pb-6">
              {/* Icon */}
              {Icon && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#223945] to-blue-600 flex items-center justify-center shadow-lg"
                >
                  <Icon className="w-8 h-8 text-white" />
                </motion.div>
              )}

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-xl font-bold text-[#223945] text-center mb-3"
              >
                {step.title}
              </motion.h3>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-neutral-600 text-center text-sm leading-relaxed mb-6"
              >
                {step.description}
              </motion.p>

              {/* Progress */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mb-6"
              >
                <TourProgress currentStep={currentStepIndex} totalSteps={totalSteps} />
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between gap-3"
              >
                {isFirstStep ? (
                  <button
                    onClick={onSkip}
                    className="px-4 py-2.5 text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    Saltar tour
                  </button>
                ) : (
                  <button
                    onClick={onPrev}
                    className="px-4 py-2.5 text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    Anterior
                  </button>
                )}

                <motion.button
                  onClick={onNext}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#223945] to-blue-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  {isFirstStep ? (
                    'Comenzar'
                  ) : isLastStep ? (
                    'Finalizar'
                  ) : (
                    <>
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* DESKTOP LAYOUT: Positioned near element */}
      {!useMobileLayout && !useCenteredLayout && desktopPosition && (
        <motion.div
          key={`desktop-${step.id}`}
          variants={desktopVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed z-[201] w-[380px] pointer-events-auto"
          style={{
            top: desktopPosition.top,
            left: desktopPosition.left,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
            {/* Gradient top bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300" />

            {/* Skip button */}
            <button
              onClick={onSkip}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600"
              aria-label="Saltar tour"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="px-6 pt-8 pb-6">
              {/* Icon */}
              {Icon && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#223945] to-blue-600 flex items-center justify-center shadow-lg"
                >
                  <Icon className="w-7 h-7 text-white" />
                </motion.div>
              )}

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-xl font-bold text-[#223945] text-center mb-2"
              >
                {step.title}
              </motion.h3>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-neutral-600 text-center text-sm leading-relaxed mb-6"
              >
                {step.description}
              </motion.p>

              {/* Progress */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mb-6"
              >
                <TourProgress currentStep={currentStepIndex} totalSteps={totalSteps} />
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between gap-3"
              >
                {isFirstStep ? (
                  <button
                    onClick={onSkip}
                    className="px-4 py-2.5 text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    Saltar tour
                  </button>
                ) : (
                  <button
                    onClick={onPrev}
                    className="px-4 py-2.5 text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    Anterior
                  </button>
                )}

                <motion.button
                  onClick={onNext}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#223945] to-blue-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  {isLastStep ? (
                    'Finalizar'
                  ) : (
                    <>
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
