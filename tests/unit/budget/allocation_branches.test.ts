import { describe, it, expect } from 'vitest';
import { createDefaultBudget, rebalanceBudget, resizeBudget, allocateByPercents } from '@/domain/budget/allocation';

describe('Budget Allocation Edge Cases & Branch Coverage', () => {
  it('throws when percentages do not sum to 100 in allocateByPercents', () => {
    expect(() =>
      allocateByPercents(
        [
          { id: 'a', label: 'A', percent: 60, color: '#111111' },
          { id: 'b', label: 'B', percent: 30, color: '#222222' },
        ],
        1000,
      ),
    ).toThrow('Percentages must sum to 100');
  });

  it('throws when category ID is not found in rebalanceBudget', () => {
    const budget = createDefaultBudget('wedding', 100000);
    expect(() => rebalanceBudget(budget, 'non-existent', 50000)).toThrow('not found');
  });

  it('throws when negative or non-integer newMinorUnits passed to rebalanceBudget', () => {
    const budget = createDefaultBudget('wedding', 100000);
    expect(() => rebalanceBudget(budget, 'venue', -100)).toThrow(RangeError);
    expect(() => rebalanceBudget(budget, 'venue', 100.5)).toThrow(RangeError);
  });

  it('handles rebalancing when all other categories are locked', () => {
    const budget = createDefaultBudget('wedding', 100000);
    const lockedBudget = {
      ...budget,
      categories: budget.categories.map((c, i) => (i === 0 ? c : { ...c, locked: true })),
    };

    // Changing the only unlocked category when all others locked
    const updated = rebalanceBudget(lockedBudget, budget.categories[0]!.id, 20000);
    expect(updated.categories[0]!.allocatedMinorUnits).toBeGreaterThanOrEqual(0);
  });

  it('resizes budget starting from 0 totalMinorUnits', () => {
    const zeroBudget = createDefaultBudget('birthday', 0);
    const resized = resizeBudget(zeroBudget, 50000);
    expect(resized.totalMinorUnits).toBe(50000);
    const sum = resized.categories.reduce((acc, c) => acc + c.allocatedMinorUnits, 0);
    expect(sum).toBe(50000);
  });

  it('throws on invalid newTotalMinorUnits in resizeBudget', () => {
    const budget = createDefaultBudget('wedding', 100000);
    expect(() => resizeBudget(budget, -10)).toThrow(RangeError);
    expect(() => resizeBudget(budget, 10.5)).toThrow(RangeError);
  });
});
