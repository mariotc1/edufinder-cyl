import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// UTILIDAD: MERGE DE CLASES CSS
// Combina clsx (condicionales) y tailwind-merge (resolución de conflictos)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
