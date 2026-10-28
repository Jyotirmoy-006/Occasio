import { describe, it, expect } from 'vitest';
import { createDefaultBudget, rebalanceBudget, resizeBudget } from '@/domain/budget/allocation';
import type { Budget } from '@/domain/schemas/budget';

describe('Budget Allocation Domain Logic', () => {
  it('creates default budget summing exactly to totalMinorUnits for all event types', () => {
    const eventTypes = ['wedding', 'birthday', 'community'] as const;
    const totals = [100000, 54321, 999999, 100, 0];

    for (const type of eventTypes) {
      for (const total of totals) {
        const budget = createDefaultBudget(type, total);
        const sum = budget.categories.reduce((acc, c) => acc + c.allocatedMinorUnits, 0);
        expect(sum).toBe(total);
        expect(budget.totalMinorUnits).toBe(total);
        for (const cat of budget.categories) {
          expect(cat.allocatedMinorUnits).toBeGreaterThanOrEqual(0);
          expect(Number.isInteger(cat.allocatedMinorUnits)).toBe(true);
        }
      }
    }
  });

  it('rejects negative or non-integer totalMinorUnits', () => {
    expect(() => createDefaultBudget('wedding', -100)).toThrow(RangeError);
    expect(() => createDefaultBudget('wedding', 100.5)).toThrow(RangeError);
  });

  it('rebalances proportionally when one category changes, keeping total invariant', () => {
    const total = 100000; // $1,000.00
    const budget = createDefaultBudget('wedding', total);

    const firstCat = budget.categories[0]!;
    const newAmount = firstCat.allocatedMinorUnits + 10000; // Increase by $100

    const updated = rebalanceBudget(budget, firstCat.id, newAmount);
    const updatedCat = updated.categories.find((c) => c.id === firstCat.id)!;
    expect(updatedCat.allocatedMinorUnits).toBe(newAmount);

    const sum = updated.categories.reduce((acc, c) => acc + c.allocatedMinorUnits, 0);
    expect(sum).toBe(total);

    for (const c of updated.categories) {
      expect(c.allocatedMinorUnits).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(c.allocatedMinorUnits)).toBe(true);
    }
  });

  it('respects locked categories during rebalancing', () => {
    const total = 100000;
    const budget = createDefaultBudget('wedding', total);

    // Lock second category
    const modified: Budget = {
      ...budget,
      categories: budget.categories.map((c, i) => (i === 1 ? { ...c, locked: true } : c)),
    };

    const lockedAmount = modified.categories[1]!.allocatedMinorUnits;
    const firstCat = modified.categories[0]!;

    const updated = rebalanceBudget(modified, firstCat.id, firstCat.allocatedMinorUnits + 5000);
    expect(updated.categories[1]!.allocatedMinorUnits).toBe(lockedAmount);

    const sum = updated.categories.reduce((acc, c) => acc + c.allocatedMinorUnits, 0);
    expect(sum).toBe(total);
  });

  it('handles edge case when category is set to total budget (others become 0)', () => {
    const total = 50000;
    const budget = createDefaultBudget('birthday', total);
    const target = budget.categories[0]!;

    const updated = rebalanceBudget(budget, target.id, total);
    expect(updated.categories.find((c) => c.id === target.id)!.allocatedMinorUnits).toBe(total);

    const others = updated.categories.filter((c) => c.id !== target.id);
    for (const o of others) {
      expect(o.allocatedMinorUnits).toBe(0);
    }
    const sum = updated.categories.reduce((acc, c) => acc + c.allocatedMinorUnits, 0);
    expect(sum).toBe(total);
  });

  it('resizes total budget proportionally and preserves invariant', () => {
    const initial = 100000;
    const budget = createDefaultBudget('community', initial);
    const newTotal = 250000;

    const resized = resizeBudget(budget, newTotal);
    expect(resized.totalMinorUnits).toBe(newTotal);

    const sum = resized.categories.reduce((acc, c) => acc + c.allocatedMinorUnits, 0);
    expect(sum).toBe(newTotal);

    for (const c of resized.categories) {
      expect(c.allocatedMinorUnits).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(c.allocatedMinorUnits)).toBe(true);
    }
  });
});

