'use client';

import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Check, ArrowDown } from 'lucide-react';

interface Props {
  pullDistance: number;
  isRefreshing: boolean;
  isPulling: boolean;
}

const THRESHOLD = 52;
const MAX_PULL  = 85;

export default function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  isPulling,
}: Props) {
  const threshold = THRESHOLD;
  const [showDone, setShowDone] = useState(false);
  const prevRefreshing = useRef(false);

  // Show "Listo" checkmark briefly after refresh completes
  useEffect(() => {
    if (prevRefreshing.current && !isRefreshing) {
      setShowDone(true);
      const t = setTimeout(() => setShowDone(false), 700);
      return () => clearTimeout(t);
    }
    prevRefreshing.current = isRefreshing;
  }, [isRefreshing]);

  const progress  = Math.min(pullDistance / threshold, 1);
  const isReady   = progress >= 1;
  const isVisible = pullDistance > 4 || isRefreshing || showDone;

  // Pill tracks finger; when refreshing or done it sits at fixed offset
  const pillY = isRefreshing || showDone
    ? 14
    : Math.max(-64, (pullDistance / MAX_PULL) * 64 - 20);

  const springTransition = isPulling
    ? 'none'
    : 'transform 0.42s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.25s ease';

  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[150] flex justify-center pointer-events-none"
      style={{
        transform:  `translateY(${pillY}px)`,
        transition: springTransition,
      }}
    >
      <div
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-xs font-bold
          transition-colors duration-200 select-none
          ${showDone
            ? 'bg-green-500 text-white shadow-green-500/30'
            : isRefreshing
            ? 'bg-[#223945] text-white shadow-[#223945]/25'
            : isReady
            ? 'bg-[#223945] text-white shadow-[#223945]/20'
            : 'bg-white/90 backdrop-blur-md text-[#223945] shadow-neutral-200/80'
          }
        `}
      >
        {/* Icon */}
        {showDone ? (
          <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={3} />
        ) : isRefreshing ? (
          <RefreshCw className="w-3.5 h-3.5 flex-shrink-0 animate-spin" />
        ) : (
          <ArrowDown
            className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-150"
            style={{ transform: `rotate(${isReady ? 180 : 0}deg)` }}
          />
        )}

        {/* Label */}
        <span className="whitespace-nowrap">
          {showDone
            ? 'Actualizado'
            : isRefreshing
            ? 'Actualizando…'
            : isReady
            ? 'Suelta para actualizar'
            : 'Tira para actualizar'}
        </span>
      </div>
    </div>
  );
}
