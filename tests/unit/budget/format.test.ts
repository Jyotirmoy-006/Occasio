import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  minorToMajor,
  majorToMinor,
  formatPercent,
  parseInputToMinorUnits,
  getMinorUnitsPerMajor,
} from '@/domain/budget/format';

describe('Currency and Number Formatting', () => {
  it('correctly reports minor units per major', () => {
    expect(getMinorUnitsPerMajor('USD')).toBe(100);
    expect(getMinorUnitsPerMajor('EUR')).toBe(100);
    expect(getMinorUnitsPerMajor('GBP')).toBe(100);
    expect(getMinorUnitsPerMajor('JPY')).toBe(1);
  });

  it('converts minor units to major units', () => {
    expect(minorToMajor(15050, 'USD')).toBe(150.5);
    expect(minorToMajor(5000, 'JPY')).toBe(5000);
    expect(minorToMajor(0, 'EUR')).toBe(0);
  });

  it('converts major units to minor units safely', () => {
    expect(majorToMinor(150.5, 'USD')).toBe(15050);
    expect(majorToMinor(5000, 'JPY')).toBe(5000);
    expect(majorToMinor(19.99, 'GBP')).toBe(1999);
  });

  it('formats currency with symbol and decimal rules', () => {
    const usd = formatCurrency(250000, 'USD', 'en-US');
    expect(usd).toContain('2,500.00');

    const jpy = formatCurrency(5000, 'JPY', 'en-US');
    expect(jpy).toContain('5,000');
    expect(jpy).not.toContain('.00');
  });

  it('formats percentages accurately', () => {
    expect(formatPercent(28.333, 1)).toBe('28.3%');
    expect(formatPercent(100, 0)).toBe('100%');
  });

  it('parses user input strings to minor units', () => {
    expect(parseInputToMinorUnits('1,500.50', 'USD')).toBe(150050);
    expect(parseInputToMinorUnits('1.500,50', 'EUR')).toBe(150050);
    expect(parseInputToMinorUnits('25,50', 'EUR')).toBe(2550);
    expect(parseInputToMinorUnits('$2,500', 'USD')).toBe(250000);
    expect(parseInputToMinorUnits('invalid', 'USD')).toBeNull();
    expect(parseInputToMinorUnits('-50', 'USD')).toBeNull();
    expect(parseInputToMinorUnits('', 'USD')).toBeNull();
  });
});
