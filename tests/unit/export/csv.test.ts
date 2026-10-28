import { describe, it, expect } from 'vitest';
import { exportBudgetCsv, exportChecklistCsv, escapeCSVCell } from '@/domain/export/csv';
import { createDefaultBudget } from '@/domain/budget/allocation';
import { generateChecklist } from '@/domain/checklist/generate';

describe('CSV Export Utilities', () => {
  it('escapes cells containing commas, quotes, and newlines', () => {
    expect(escapeCSVCell('Simple')).toBe('Simple');
    expect(escapeCSVCell('Hello, World')).toBe('"Hello, World"');
    expect(escapeCSVCell('Line1\nLine2')).toBe('"Line1\nLine2"');
    expect(escapeCSVCell('She said "Yes"')).toBe('"She said ""Yes"""');
  });

  it('exports budget data to valid CSV with headers and totals', () => {
    const budget = createDefaultBudget('wedding', 500000);
    const csv = exportBudgetCsv(budget, 'USD');

    expect(csv).toContain('Category,Allocated Amount,Actual Spent,Allocated %,Locked,Currency');
    expect(csv).toContain('Venue');
    expect(csv).toContain('TOTAL,5000.00');
  });

  it('exports checklist items to valid CSV', () => {
    const checklist = generateChecklist('birthday');
    const csv = exportChecklistCsv(checklist, 'USD');

    expect(csv).toContain('Vendor Type,Category,Status,Quote Amount,Notes,Key Questions');
    expect(csv).toContain('Venue');
    expect(csv).toContain('to-contact');
  });
});
