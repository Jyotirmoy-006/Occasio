/**
 * Currency formatting utilities.
 * Uses Intl.NumberFormat for locale-aware display.
 * All internal values are integer minor units (cents, paise, etc.)
 */

import type { Currency } from '@/lib/constants';

// Currencies with no minor units (e.g., JPY)
const ZERO_DECIMAL_CURRENCIES = new Set(['JPY', 'KRW', 'VND', 'IDR']);

/**
 * Returns the number of minor units per major unit for a currency.
 * e.g., USD -> 100, JPY -> 1
 */
export function getMinorUnitsPerMajor(currency: Currency): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency) ? 1 : 100;
}

/**
 * Converts minor units to a display-ready major unit number.
 * e.g., 150000 USD cents -> 1500.00
 */
export function minorToMajor(minorUnits: number, currency: Currency): number {
  return minorUnits / getMinorUnitsPerMajor(currency);
}

/**
 * Converts major units to integer minor units.
 * e.g., 1500.00 USD -> 150000 cents
 */
export function majorToMinor(majorUnits: number, currency: Currency): number {
  return Math.round(majorUnits * getMinorUnitsPerMajor(currency));
}

/**
 * Formats minor units as a localized currency string.
 * Uses tabular numerals for financial displays.
 */
export function formatCurrency(
  minorUnits: number,
  currency: Currency,
  locale?: string,
): string {
  const amount = minorToMajor(minorUnits, currency);
  return new Intl.NumberFormat(locale ?? undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: ZERO_DECIMAL_CURRENCIES.has(currency) ? 0 : 2,
    maximumFractionDigits: ZERO_DECIMAL_CURRENCIES.has(currency) ? 0 : 2,
  }).format(amount);
}

/**
 * Formats a percentage for display.
 * e.g., 28.333 -> "28.3%"
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Parses a user-input string (e.g., "1,500.00") into minor units.
 * Strips currency symbols and formatting before parsing.
 * Returns null if the input cannot be parsed.
 */
export function parseInputToMinorUnits(input: string, currency: Currency): number | null {
  const trimmed = input.trim();
  if (!trimmed || trimmed.includes('-')) return null;
  let cleaned = trimmed.replace(/[^\d.,]/g, '');
  if (!cleaned) return null;

  if (cleaned.includes(',') && cleaned.includes('.')) {
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    if (lastComma < lastDot) {
      cleaned = cleaned.replace(/,/g, '');
    } else {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }
  } else if (cleaned.includes(',')) {
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1]?.length === 2) {
      cleaned = cleaned.replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  }

  const parsed = parseFloat(cleaned);
  if (isNaN(parsed) || parsed < 0) return null;
  return majorToMinor(parsed, currency);
}
