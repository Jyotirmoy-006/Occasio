/**
 * CSV export utilities for Budget and Checklist.
 * Formats data cleanly with RFC 4180 escaping.
 */

import type { Budget } from '@/domain/schemas/budget';
import type { Checklist } from '@/domain/schemas/checklist';
import type { Currency } from '@/lib/constants';
import { minorToMajor } from '@/domain/budget/format';

/**
 * Escapes a cell value for CSV (RFC 4180).
 * Encloses in quotes if containing comma, newline, or double quote.
 */
export function escapeCSVCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports budget categories to CSV format.
 */
export function exportBudgetCsv(budget: Budget, currency: Currency): string {
  const headers = ['Category', 'Allocated Amount', 'Actual Spent', 'Allocated %', 'Locked', 'Currency'];
  const rows = budget.categories.map((cat) => [
    cat.label,
    minorToMajor(cat.allocatedMinorUnits, currency).toFixed(2),
    minorToMajor(cat.actualMinorUnits, currency).toFixed(2),
    `${cat.allocatedPercent.toFixed(1)}%`,
    cat.locked ? 'Yes' : 'No',
    currency,
  ]);

  const summaryRow = [
    'TOTAL',
    minorToMajor(budget.totalMinorUnits, currency).toFixed(2),
    minorToMajor(
      budget.categories.reduce((acc, c) => acc + c.actualMinorUnits, 0),
      currency
    ).toFixed(2),
    '100.0%',
    '',
    currency,
  ];

  const allLines = [
    headers.map(escapeCSVCell).join(','),
    ...rows.map((row) => row.map(escapeCSVCell).join(',')),
    summaryRow.map(escapeCSVCell).join(','),
  ];

  return allLines.join('\r\n');
}

/**
 * Exports vendor checklist to CSV format.
 */
export function exportChecklistCsv(checklist: Checklist, currency: Currency): string {
  const headers = ['Vendor Type', 'Category', 'Status', 'Quote Amount', 'Notes', 'Key Questions'];
  const rows = checklist.items.map((item) => [
    item.vendorType,
    item.category,
    item.status,
    item.quoteMinorUnits !== null ? minorToMajor(item.quoteMinorUnits, currency).toFixed(2) : 'Unquoted',
    item.notes,
    item.questionsToAsk.join('; '),
  ]);

  const allLines = [
    headers.map(escapeCSVCell).join(','),
    ...rows.map((row) => row.map(escapeCSVCell).join(',')),
  ];

  return allLines.join('\r\n');
}

