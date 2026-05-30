'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourSpotlightProps {
  targetSelector: string;
  padding?: number;
  isActive: boolean;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function TourSpotlight({
  targetSelector,
  padding = 8,
  isActive,
}: TourSpotlightProps) {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updateTargetRect = useCallback(() => {
    // While a scroll-into-view animation is in progress, don't interfere
    if (isScrollingRef.current) return;

    if (!targetSelector) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(targetSelector);
    if (!element) {
      setTargetRect(null);
      return;
    }

    const rect = element.getBoundingClientRect();

    // Elements inside fixed containers (e.g. bottom nav tabs) are always "visible"
    let el: Element | null = element;
    let isInFixedContainer = false;
    while (el) {
      if (window.getComputedStyle(el).position === 'fixed') {
        isInFixedContainer = true;
        break;
      }
      el = el.parentElement;
    }

    // On mobile leave space for bottom nav + tooltip sheet above it
    const bottomSheetHeight = isMobile ? 280 : 0;
    const visibleHeight = window.innerHeight - bottomSheetHeight;
    const isVisible = isInFixedContainer || (rect.top >= 0 && rect.top < visibleHeight);

    if (!isVisible) {
      isScrollingRef.current = true;
      // Smooth scroll on desktop (polished UX); instant on mobile (browsers animate slowly)
      element.scrollIntoView({ behavior: isMobile ? 'instant' : 'smooth', block: 'center' });

      setTimeout(() => {
        isScrollingRef.current = false;
        const newRect = element.getBoundingClientRect();
        setTargetRect({
          top: newRect.top - padding,
          left: newRect.left - padding,
          width: newRect.width + padding * 2,
          height: newRect.height + padding * 2,
        });
      }, isMobile ? 80 : 500);
      return;
    }

    setTargetRect({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });
  }, [targetSelector, padding, isMobile]);

  // Reset scroll guard when step changes
  useEffect(() => {
    isScrollingRef.current = false;
  }, [targetSelector]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(updateTargetRect, 150);

    const handleResize = () => updateTargetRect();
    const handleScroll = () => updateTargetRect();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    const resizeObserver = new ResizeObserver(updateTargetRect);
    const element = targetSelector ? document.querySelector(targetSelector) : null;
    if (element) resizeObserver.observe(element);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      resizeObserver.disconnect();
    };
  }, [isActive, targetSelector, updateTargetRect]);

  if (!isActive) return null;

  const showFullOverlay = !targetSelector;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[200] pointer-events-auto"
        aria-hidden="true"
      >
        {showFullOverlay ? (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        ) : targetRect ? (
          <>
            <svg
              className="absolute inset-0 w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <defs>
                <mask id="spotlight-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <rect
                    x={targetRect.left}
                    y={targetRect.top}
                    width={targetRect.width}
                    height={targetRect.height}
                    rx="12"
                    ry="12"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.7)"
                mask="url(#spotlight-mask)"
              />
            </svg>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute pointer-events-none rounded-xl"
              style={{
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-xl"
                animate={{
                  boxShadow: [
                    '0 0 0 2px rgba(59, 130, 246, 0.6), 0 0 15px 3px rgba(59, 130, 246, 0.3)',
                    '0 0 0 4px rgba(59, 130, 246, 0.4), 0 0 25px 6px rgba(59, 130, 246, 0.2)',
                    '0 0 0 2px rgba(59, 130, 246, 0.6), 0 0 15px 3px rgba(59, 130, 246, 0.3)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          </>
        ) : (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
