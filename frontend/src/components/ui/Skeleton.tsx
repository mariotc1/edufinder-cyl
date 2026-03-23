import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

// Componente Skeleton base reutilizable
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-neutral-200/70',
        className
      )}
    />
  );
}

// Skeleton para texto de una línea
export function SkeletonText({ className, width = 'w-full' }: SkeletonProps & { width?: string }) {
  return <Skeleton className={cn('h-4', width, className)} />;
}

// Skeleton para título
export function SkeletonTitle({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-7 w-3/4', className)} />;
}

// Skeleton circular (avatares, iconos)
export function SkeletonCircle({ className, size = 'w-10 h-10' }: SkeletonProps & { size?: string }) {
  return <Skeleton className={cn('rounded-full', size, className)} />;
}

// Skeleton para badges
export function SkeletonBadge({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-6 w-20 rounded-full', className)} />;
}

// Skeleton para botones
export function SkeletonButton({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-10 w-32 rounded-lg', className)} />;
}
