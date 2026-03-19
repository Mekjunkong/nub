import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Thai Baht currency.
 */
export function formatThaiCurrency(value: number, options?: { maximumFractionDigits?: number }): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  }).format(value);
}
