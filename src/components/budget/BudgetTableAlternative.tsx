'use client';

import React from 'react';
import type { BudgetCategory } from '@/domain/schemas/budget';
import type { Currency } from '@/lib/constants';
import { formatCurrency, formatPercent } from '@/domain/budget/format';

interface BudgetTableAlternativeProps {
  categories: BudgetCategory[];
  currency: Currency;
  tableId: string;
}

export function BudgetTableAlternative({
  categories,
  currency,
  tableId,
}: BudgetTableAlternativeProps) {
  return (
    <div id={tableId} className="w-full overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-border text-ink-muted font-mono">
            <th className="py-2">Category</th>
            <th className="py-2 text-right">Allocated</th>
            <th className="py-2 text-right">%</th>
            <th className="py-2 text-right">Actual</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id} className="border-b border-border/50">
              <td className="py-2 font-medium flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                {cat.label}
              </td>
              <td className="py-2 text-right tabular-nums font-mono">
                {formatCurrency(cat.allocatedMinorUnits, currency)}
              </td>
              <td className="py-2 text-right tabular-nums">{formatPercent(cat.allocatedPercent)}</td>
              <td className="py-2 text-right tabular-nums font-mono">
                {formatCurrency(cat.actualMinorUnits, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
