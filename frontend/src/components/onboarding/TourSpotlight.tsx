'use client';

import { useEffect, useState, useCallback } from 'react';
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

  // Detect mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updateTargetRect = useCallback(() => {
    if (!targetSelector) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();

      // On mobile, we need to leave space for the bottom sheet tooltip
      // So we only highlight if the element is in the visible area
      const bottomSheetHeight = isMobile ? 200 : 0;
      const visibleHeight = window.innerHeight - bottomSheetHeight;

      // Check if element is reasonably visible
      const isVisible = rect.top >= 0 && rect.top < visibleHeight;

      if (!isVisible && isMobile) {
        // Try to scroll element into view
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

        // Recalculate after scroll
        setTimeout(() => {
          const newRect = element.getBoundingClientRect();
          setTargetRect({
            top: newRect.top - padding,
            left: newRect.left - padding,
            width: newRect.width + padding * 2,
            height: newRect.height + padding * 2,
          });
        }, 400);
        return;
      }

      setTargetRect({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
    } else {
      setTargetRect(null);
    }
  }, [targetSelector, padding, isMobile]);

  useEffect(() => {
    if (!isActive) return;

    // Initial calculation after DOM is ready
    const timer = setTimeout(updateTargetRect, 150);

    const handleResize = () => updateTargetRect();
    const handleScroll = () => updateTargetRect();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    // ResizeObserver for dynamic content
    const resizeObserver = new ResizeObserver(updateTargetRect);
    if (targetSelector) {
      const element = document.querySelector(targetSelector);
      if (element) {
        resizeObserver.observe(element);
      }
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      resizeObserver.disconnect();
    };
  }, [isActive, targetSelector, updateTargetRect]);

  if (!isActive) return null;

  // For center placement (welcome step) or no target
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
          // Simple dark overlay for centered modals
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        ) : targetRect ? (
          // SVG mask with cutout for spotlight effect
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

            {/* Glowing border around target */}
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
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          </>
        ) : (
          // Fallback dark overlay if element not found
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
