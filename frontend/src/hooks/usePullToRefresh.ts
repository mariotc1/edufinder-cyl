'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Options {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPullDistance?: number;
  disabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 52,
  maxPullDistance = 85,
  disabled = false,
}: Options) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  // All refs — handlers never go stale, no deps issues
  const startYRef       = useRef(0);
  const activeRef       = useRef(false);
  const isRefreshingRef = useRef(false);
  const pullDistRef     = useRef(0);
  const onRefreshRef    = useRef(onRefresh);
  onRefreshRef.current  = onRefresh;
  const thresholdRef    = useRef(threshold);
  thresholdRef.current  = threshold;
  const maxRef          = useRef(maxPullDistance);
  maxRef.current        = maxPullDistance;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshingRef.current) return;
    if (window.scrollY !== 0) return;
    startYRef.current = e.touches[0].clientY;
    activeRef.current = true;
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!activeRef.current || isRefreshingRef.current) return;

    const delta = e.touches[0].clientY - startYRef.current;

    if (delta <= 0) {
      if (pullDistRef.current !== 0) {
        pullDistRef.current = 0;
        setPullDistance(0);
        setIsPulling(false);
      }
      return;
    }

    // Linear resistance: feels natural, ~95px pull to trigger threshold
    const distance = Math.min(delta * 0.55, maxRef.current);
    pullDistRef.current = distance;
    setPullDistance(distance);
    setIsPulling(true);

    if (delta > 8) e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (!activeRef.current) return;
    activeRef.current = false;
    setIsPulling(false);

    const captured = pullDistRef.current;
    pullDistRef.current = 0;
    setPullDistance(0);

    if (captured >= thresholdRef.current) {
      if (navigator.vibrate) navigator.vibrate(10);
      isRefreshingRef.current = true;
      setIsRefreshing(true);
      try {
        await onRefreshRef.current();
      } catch {
        // silent — page-level error handling applies
      } finally {
        await new Promise(r => setTimeout(r, 600));
        isRefreshingRef.current = false;
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (disabled) return;
    // Stable handlers — effect only re-runs if disabled changes
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove',  handleTouchMove,  { passive: false });
    document.addEventListener('touchend',   handleTouchEnd,   { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove',  handleTouchMove);
      document.removeEventListener('touchend',   handleTouchEnd);
    };
  }, [disabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { pullDistance, isRefreshing, isPulling };
}
