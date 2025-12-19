import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a numeric price value as Ethiopian Birr (ETB).
 * Uses Vite env var `VITE_ETB_RATE` as an optional conversion multiplier.
 * If `VITE_ETB_RATE` is not provided the function will format the raw number.
 */
export function formatETB(amount?: number | null) {
  const raw = Number(amount || 0);
  const rate = Number(import.meta.env.VITE_ETB_RATE) || 1;
  const value = raw * rate;

  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
  }).format(value);
}
