import { describe, it, expect } from 'vitest';
import {
  formatMoney,
  formatEventDate,
  getRelativeDayString,
  pluralize,
  inferDefaultCurrency,
} from '@/lib/format';

describe('i18n Formatting Module (A3)', () => {
  describe('formatMoney', () => {
    it('formats whole dollar amounts with no cents when hideZeroCents is true', () => {
      expect(formatMoney(1500000, 'USD', { hideZeroCents: true })).toBe('$15,000');
      expect(formatMoney(25000, 'USD', { hideZeroCents: true })).toBe('$250');
    });

    it('retains cents when fractional amount is non-zero', () => {
      expect(formatMoney(1500050, 'USD', { hideZeroCents: true })).toBe('$15,000.50');
      expect(formatMoney(1099, 'USD', { hideZeroCents: true })).toBe('$10.99');
    });

    it('formats other currencies with their locale symbol', () => {
      const gbp = formatMoney(120000, 'GBP', { hideZeroCents: true });
      expect(gbp).toContain('£1,200');

      const eur = formatMoney(500000, 'EUR', { hideZeroCents: true });
      expect(eur).toContain('5,000');
    });

    it('formats zero-decimal currencies like JPY correctly', () => {
      const jpy = formatMoney(15000, 'JPY');
      expect(jpy).toContain('15,000');
    });
  });

  describe('formatEventDate & relative dates', () => {
    it('formats dates into editorial string (e.g. "Sat, 28 Nov 2026")', () => {
      const res = formatEventDate('2026-11-28');
      expect(res).toBe('Sat, Nov 28, 2026');
    });

    it('appends relative note when includeRelative is true', () => {
      const ref = new Date(2026, 10, 28); // Nov 28 2026
      const future = new Date(2026, 11, 28); // Dec 28 2026 (30 days later)

      const res = formatEventDate(future, { includeRelative: true, referenceDate: ref });
      expect(res).toContain('(in 30 days)');
    });

    it('calculates human relative strings for today, tomorrow, yesterday', () => {
      const base = new Date(2026, 5, 15);
      const today = new Date(2026, 5, 15);
      const tomorrow = new Date(2026, 5, 16);
      const yesterday = new Date(2026, 5, 14);
      const future = new Date(2026, 5, 25);
      const past = new Date(2026, 5, 10);

      expect(getRelativeDayString(today, base)).toBe('today');
      expect(getRelativeDayString(tomorrow, base)).toBe('tomorrow');
      expect(getRelativeDayString(yesterday, base)).toBe('yesterday');
      expect(getRelativeDayString(future, base)).toBe('in 10 days');
      expect(getRelativeDayString(past, base)).toBe('5 days ago');
    });
  });

  describe('pluralize with Intl.PluralRules', () => {
    it('correctly handles count 0', () => {
      expect(pluralize(0, 'palette')).toBe('0 palettes');
      expect(pluralize(0, 'person', 'people')).toBe('0 people');
      expect(pluralize(0, 'task')).toBe('0 tasks');
    });

    it('correctly handles count 1 (singular)', () => {
      expect(pluralize(1, 'palette')).toBe('1 palette');
      expect(pluralize(1, 'person', 'people')).toBe('1 person');
      expect(pluralize(1, 'task')).toBe('1 task');
      expect(pluralize(1, 'activity', 'activities')).toBe('1 activity');
    });

    it('correctly handles count 2 (plural)', () => {
      expect(pluralize(2, 'palette')).toBe('2 palettes');
      expect(pluralize(2, 'person', 'people')).toBe('2 people');
      expect(pluralize(2, 'task')).toBe('2 tasks');
    });

    it('supports includeCount = false', () => {
      expect(pluralize(1, 'vendor', 'vendors', { includeCount: false })).toBe('vendor');
      expect(pluralize(5, 'vendor', 'vendors', { includeCount: false })).toBe('vendors');
    });
  });

  describe('inferDefaultCurrency', () => {
    it('returns USD safely in non-browser or default environment', () => {
      expect(inferDefaultCurrency()).toBe('USD');
    });
  });
});

