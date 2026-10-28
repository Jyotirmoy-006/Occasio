/**
 * Internationalized formatting module for Occasio.
 *
 * Implements:
 * 1. Locale-aware currency formatting with tabular numeral support and optional cents stripping
 * 2. Automatic currency inference from browser locale and timezone
 * 3. Human-friendly event date formatting ("Sat, 28 Nov 2026") with relative time notes ("in 30 days")
 * 4. Intl.PluralRules-based linguistic pluralization (fixes "1 palettes")
 */

import { parseLocalDate } from '@/domain/timeline/generate';

/**
 * Infer default currency from browser locale and timezone.
 * Safe to call on both server and client (falls back to USD).
 */
export function inferDefaultCurrency(): string {
  if (typeof window === 'undefined') return 'USD';

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = (navigator.language || '').toLowerCase();

    if (tz.includes('Europe/London') || lang.startsWith('en-gb')) return 'GBP';
    if (tz.includes('Europe/') || lang.startsWith('de') || lang.startsWith('fr') || lang.startsWith('es') || lang.startsWith('it')) return 'EUR';
    if (tz.includes('Asia/Kolkata') || lang.startsWith('hi') || lang.endsWith('-in')) return 'INR';
    if (tz.includes('Australia/') || lang.endsWith('-au')) return 'AUD';
    if (tz.includes('Canada/') || lang.endsWith('-ca')) return 'CAD';
    if (tz.includes('Tokyo') || lang.startsWith('ja')) return 'JPY';
    return 'USD';
  } catch {
    return 'USD';
  }
}

/**
 * Supported currency list for the selector.
 */
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($) — US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) — Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) — British Pound' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD ($) — Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'AUD ($) — Australian Dollar' },
  { code: 'INR', symbol: '₹', label: 'INR (₹) — Indian Rupee' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥) — Japanese Yen' },
] as const;

/**
 * Formats minor units (cents) into a locale-aware currency string.
 * Strips cents if .00 and hideZeroCents is true.
 */
export function formatMoney(
  minorUnits: number,
  currency: string = 'USD',
  options: {
    hideZeroCents?: boolean;
    locale?: string;
  } = {},
): string {
  const { hideZeroCents = true, locale = 'en-US' } = options;
  const isZeroDecimal = currency.toUpperCase() === 'JPY';
  const majorValue = isZeroDecimal ? minorUnits : minorUnits / 100;

  const hasFraction = !isZeroDecimal && Math.abs(minorUnits % 100) > 0;
  const fractionDigits = isZeroDecimal ? 0 : hasFraction || !hideZeroCents ? 2 : 0;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(majorValue);
  } catch {
    // Fallback if currency code is unrecognized
    const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
    return `${symbol}${majorValue.toLocaleString('en-US', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })}`;
  }
}

/**
 * Formats an ISO date string ("2026-11-28") or Date into an editorial display:
 * e.g., "Sat, 28 Nov 2026" or "Sat, 28 Nov 2026 (in 30 days)".
 * Never displays raw ISO strings to the user.
 */
export function formatEventDate(
  dateInput: string | Date,
  options: {
    includeRelative?: boolean;
    referenceDate?: Date;
    locale?: string;
  } = {},
): string {
  const { includeRelative = false, referenceDate = new Date(), locale = 'en-US' } = options;

  let date: Date;
  if (typeof dateInput === 'string') {
    date = parseLocalDate(dateInput);
  } else {
    date = dateInput;
  }

  if (isNaN(date.getTime())) {
    return 'Date not set';
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedDate = formatter.format(date);

  if (!includeRelative) {
    return formattedDate;
  }

  const relative = getRelativeDayString(date, referenceDate);
  return `${formattedDate} (${relative})`;
}

/**
 * Returns a human-friendly relative day string (e.g. "today", "tomorrow", "in 14 days", "3 days ago").
 */
export function getRelativeDayString(targetDate: Date, referenceDate: Date = new Date()): string {
  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const refMidnight = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

  const diffMs = targetMidnight.getTime() - refMidnight.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays === -1) return 'yesterday';
  if (diffDays > 1) return `in ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}

/**
 * Linguistic pluralization using Intl.PluralRules.
 * Fixes grammatical bugs like "1 palettes".
 *
 * @example
 * pluralize(1, 'palette') => "1 palette"
 * pluralize(4, 'palette') => "4 palettes"
 * pluralize(0, 'person', 'people') => "0 people"
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string,
  options: { includeCount?: boolean; locale?: string } = {},
): string {
  const { includeCount = true, locale = 'en-US' } = options;
  const pr = new Intl.PluralRules(locale);
  const rule = pr.select(count);

  let word: string;
  if (rule === 'one') {
    word = singular;
  } else {
    word = plural || (singular.endsWith('y') && !singular.endsWith('ay') && !singular.endsWith('ey')
      ? `${singular.slice(0, -1)}ies`
      : `${singular}s`);
  }

  return includeCount ? `${count} ${word}` : word;
}
