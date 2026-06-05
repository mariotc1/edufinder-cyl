'use client';

import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import PullToRefreshIndicator from './PullToRefreshIndicator';

interface Props {
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
}

/**
 * Drop-in component: renders the fixed PTR indicator and wires up the gesture.
 * Place it anywhere inside a 'use client' page — the indicator floats above everything.
 */
export default function PullToRefresh({ onRefresh, disabled }: Props) {
  const { pullDistance, isRefreshing, isPulling } = usePullToRefresh({ onRefresh, disabled });

  return (
    <PullToRefreshIndicator
      pullDistance={pullDistance}
      isRefreshing={isRefreshing}
      isPulling={isPulling}
    />
  );
}
