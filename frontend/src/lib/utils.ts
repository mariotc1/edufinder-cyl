import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// UTILIDAD: MERGE DE CLASES CSS
// Combina clsx (condicionales) y tailwind-merge (resolución de conflictos)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// UTILIDAD: FORMATO DE NÚMEROS
// useGrouping 'always': la norma es-ES no agrupa números de 4 cifras (1751 -> 1.751)
const numberFormat = new Intl.NumberFormat('es-ES', { useGrouping: 'always' } as Intl.NumberFormatOptions);
export function formatNumber(n: number) {
  return numberFormat.format(n);
}
