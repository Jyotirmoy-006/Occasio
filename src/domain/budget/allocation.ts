/**
 * Budget allocation — Phase 2 domain logic.
 * Pure functions; no side effects; no I/O.
 *
 * INVARIANTS (enforced by tests):
 * 1. sum(categories.allocatedMinorUnits) === totalMinorUnits
 * 2. All allocatedMinorUnits >= 0
 * 3. Rounding distributes remainder to the largest unlocked category
 */

import type { Budget, BudgetCategory } from '@/domain/schemas/budget';
import type { EventType } from '@/lib/constants';

// Default percentage allocations per event type. Must sum to 100.
const DEFAULT_ALLOCATIONS: Record<EventType, Array<{ id: string; label: string; percent: number; color: string }>> = {
  wedding: [
    { id: 'venue', label: 'Venue', percent: 30, color: '#2D5016' },
    { id: 'catering', label: 'Catering & Bar', percent: 28, color: '#4A7A28' },
    { id: 'photography', label: 'Photography & Video', percent: 12, color: '#6B9E40' },
    { id: 'music', label: 'Music & Entertainment', percent: 8, color: '#8B4513' },
    { id: 'florals', label: 'Florals & Decor', percent: 8, color: '#A0522D' },
    { id: 'attire', label: 'Attire & Beauty', percent: 6, color: '#C4713E' },
    { id: 'transport', label: 'Transport', percent: 3, color: '#78716C' },
    { id: 'stationery', label: 'Stationery & Gifts', percent: 2, color: '#A8A29E' },
    { id: 'misc', label: 'Miscellaneous', percent: 3, color: '#D6D3D1' },
  ],
  birthday: [
    { id: 'venue', label: 'Venue', percent: 25, color: '#8B4513' },
    { id: 'catering', label: 'Food & Drinks', percent: 30, color: '#A0522D' },
    { id: 'entertainment', label: 'Entertainment', percent: 15, color: '#C4713E' },
    { id: 'decor', label: 'Decorations', percent: 10, color: '#2D5016' },
    { id: 'cake', label: 'Cake & Desserts', percent: 8, color: '#4A7A28' },
    { id: 'photography', label: 'Photography', percent: 7, color: '#6B9E40' },
    { id: 'misc', label: 'Miscellaneous', percent: 5, color: '#78716C' },
  ],
  community: [
    { id: 'venue', label: 'Venue & Permits', percent: 20, color: '#2D5016' },
    { id: 'catering', label: 'Food & Refreshments', percent: 25, color: '#4A7A28' },
    { id: 'equipment', label: 'Equipment & AV', percent: 15, color: '#6B9E40' },
    { id: 'marketing', label: 'Marketing & Signage', percent: 10, color: '#8B4513' },
    { id: 'entertainment', label: 'Performers & Activities', percent: 12, color: '#A0522D' },
    { id: 'volunteers', label: 'Volunteer Support', percent: 8, color: '#C4713E' },
    { id: 'insurance', label: 'Insurance & Safety', percent: 5, color: '#78716C' },
    { id: 'misc', label: 'Miscellaneous', percent: 5, color: '#D6D3D1' },
  ],
};

/**
 * Creates a default budget allocation for a given event type and total budget.
 *
 * @param eventType - The type of event
 * @param totalMinorUnits - Total budget in minor currency units (integer cents)
 * @returns A valid Budget object where categories sum to totalMinorUnits
 */
export function createDefaultBudget(eventType: EventType, totalMinorUnits: number): Budget {
  if (!Number.isInteger(totalMinorUnits) || totalMinorUnits < 0) {
    throw new RangeError(`totalMinorUnits must be a non-negative integer, got: ${totalMinorUnits}`);
  }

  const defs = DEFAULT_ALLOCATIONS[eventType];
  const categories = allocateByPercents(defs, totalMinorUnits);

  return { categories, totalMinorUnits };
}

/**
 * Allocates a total across categories by percentage, distributing rounding
 * remainder to the category with the largest allocation (to preserve invariant 1).
 */
export function allocateByPercents(
  defs: Array<{ id: string; label: string; percent: number; color: string }>,
  totalMinorUnits: number,
): BudgetCategory[] {
  const percentSum = defs.reduce((s, d) => s + d.percent, 0);
  if (Math.abs(percentSum - 100) > 0.001) {
    throw new Error(`Percentages must sum to 100, got: ${percentSum}`);
  }

  const rawAmounts = defs.map((d) => ({
    ...d,
    raw: (d.percent / 100) * totalMinorUnits,
    floor: Math.floor((d.percent / 100) * totalMinorUnits),
  }));

  const floorSum = rawAmounts.reduce((s, d) => s + d.floor, 0);
  const remainder = totalMinorUnits - floorSum;

  const withFractions = rawAmounts
    .map((d, i) => ({ index: i, fraction: d.raw - d.floor }))
    .sort((a, b) => b.fraction - a.fraction);

  const allocated = rawAmounts.map((d) => d.floor);
  for (let i = 0; i < remainder; i++) {
    const idx = withFractions[i % withFractions.length]?.index;
    if (idx !== undefined) allocated[idx]++;
  }

  return rawAmounts.map((d, i) => ({
    id: d.id,
    label: d.label,
    allocatedPercent: d.percent,
    allocatedMinorUnits: allocated[i] ?? 0,
    actualMinorUnits: 0,
    color: d.color,
    locked: false,
  }));
}

/**
 * Rebalances the budget when one category's allocation changes.
 * The changed category's new value is set; all unlocked other categories
 * are scaled proportionally; locked categories stay fixed.
 * The total always equals budget.totalMinorUnits.
 */
export function rebalanceBudget(
  budget: Budget,
  changedId: string,
  newMinorUnits: number,
): Budget {
  if (!Number.isInteger(newMinorUnits) || newMinorUnits < 0) {
    throw new RangeError(`newMinorUnits must be a non-negative integer`);
  }

  const total = budget.totalMinorUnits;
  const changed = budget.categories.find((c) => c.id === changedId);
  if (!changed) throw new Error(`Category "${changedId}" not found`);

  const lockedTotal = budget.categories
    .filter((c) => c.locked && c.id !== changedId)
    .reduce((s, c) => s + c.allocatedMinorUnits, 0);

  const available = total - lockedTotal;
  const clamped = Math.min(Math.max(0, newMinorUnits), available);
  const remainingForOthers = available - clamped;

  const unlocked = budget.categories.filter((c) => !c.locked && c.id !== changedId);
  const unlockedTotal = unlocked.reduce((s, c) => s + c.allocatedMinorUnits, 0);

  let newCategories: BudgetCategory[];

  if (unlocked.length === 0 || unlockedTotal === 0) {
    const perCategory = unlocked.length > 0 ? Math.floor(remainingForOthers / unlocked.length) : 0;
    let r = remainingForOthers - perCategory * unlocked.length;

    newCategories = budget.categories.map((c) => {
      if (c.id === changedId) {
        return { ...c, allocatedMinorUnits: clamped, allocatedPercent: total > 0 ? (clamped / total) * 100 : 0 };
      }
      if (c.locked) return c;
      const extra = r-- > 0 ? 1 : 0;
      const amount = perCategory + extra;
      return { ...c, allocatedMinorUnits: amount, allocatedPercent: total > 0 ? (amount / total) * 100 : 0 };
    });
  } else {
    const rawAmounts = unlocked.map((c) => ({
      id: c.id,
      raw: (c.allocatedMinorUnits / unlockedTotal) * remainingForOthers,
    }));

    const floored = rawAmounts.map((r) => ({ ...r, floor: Math.floor(r.raw) }));
    const floorSum = floored.reduce((s, r) => s + r.floor, 0);
    const rem = remainingForOthers - floorSum;

    const sorted = [...floored]
      .map((r, i) => ({ index: i, fraction: r.raw - r.floor }))
      .sort((a, b) => b.fraction - a.fraction);

    const finalAmounts = floored.map((r) => r.floor);
    for (let i = 0; i < rem; i++) {
      const idx = sorted[i % sorted.length]?.index;
      if (idx !== undefined) finalAmounts[idx]++;
    }

    const amountMap = new Map(rawAmounts.map((r, i) => [r.id, finalAmounts[i] ?? 0]));

    newCategories = budget.categories.map((c) => {
      if (c.id === changedId) {
        return { ...c, allocatedMinorUnits: clamped, allocatedPercent: total > 0 ? (clamped / total) * 100 : 0 };
      }
      if (c.locked) return c;
      const amount = amountMap.get(c.id) ?? c.allocatedMinorUnits;
      return { ...c, allocatedMinorUnits: amount, allocatedPercent: total > 0 ? (amount / total) * 100 : 0 };
    });
  }

  // Ensure invariant: sum equals total
  const sum = newCategories.reduce((s, c) => s + c.allocatedMinorUnits, 0);
  if (sum !== total) {
    const diff = total - sum;
    newCategories = newCategories.map((c) =>
      c.id === changedId ? { ...c, allocatedMinorUnits: c.allocatedMinorUnits + diff } : c,
    );
  }

  return { ...budget, categories: newCategories };
}

/**
 * Updates the total budget, scaling all unlocked categories proportionally.
 */
export function resizeBudget(budget: Budget, newTotalMinorUnits: number): Budget {
  if (!Number.isInteger(newTotalMinorUnits) || newTotalMinorUnits < 0) {
    throw new RangeError(`newTotalMinorUnits must be a non-negative integer`);
  }

  if (budget.totalMinorUnits === 0) {
    const defs = budget.categories.map((c) => ({
      id: c.id,
      label: c.label,
      percent: 100 / budget.categories.length,
      color: c.color,
    }));
    return {
      ...budget,
      totalMinorUnits: newTotalMinorUnits,
      categories: allocateByPercents(defs, newTotalMinorUnits),
    };
  }

  const ratio = newTotalMinorUnits / budget.totalMinorUnits;
  const scaled = budget.categories.map((c) => ({
    ...c,
    raw: c.allocatedMinorUnits * ratio,
    floor: Math.floor(c.allocatedMinorUnits * ratio),
  }));

  const floorSum = scaled.reduce((s, c) => s + c.floor, 0);
  const remainder = newTotalMinorUnits - floorSum;

  const sorted = scaled
    .map((c, i) => ({ index: i, fraction: c.raw - c.floor }))
    .sort((a, b) => b.fraction - a.fraction);

  const finalAmounts = scaled.map((c) => c.floor);
  for (let i = 0; i < remainder; i++) {
    const idx = sorted[i % sorted.length]?.index;
    if (idx !== undefined) finalAmounts[idx]++;
  }

  return {
    totalMinorUnits: newTotalMinorUnits,
    categories: budget.categories.map((c, i) => ({
      ...c,
      allocatedMinorUnits: finalAmounts[i] ?? 0,
      allocatedPercent: newTotalMinorUnits > 0 ? ((finalAmounts[i] ?? 0) / newTotalMinorUnits) * 100 : 0,
    })),
  };
}
