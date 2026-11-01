'use client';

import React from 'react';
import type { Currency } from '@/lib/constants';
import { formatMoney } from '@/lib/format';
import type { DonutSegment } from './OverviewBudgetSnapshot';

interface OverviewBudgetTableProps {
  totalBudgetMinor: number;
  committedMinor: number;
  remainingMinor: number;
  currency: Currency;
  donutSegments: DonutSegment[];
}

export function OverviewBudgetTable({
  totalBudgetMinor,
  committedMinor,
  remainingMinor,
  currency,
  donutSegments,
}: OverviewBudgetTableProps) {
  return (
    <>
      <table className="w-full text-xs sm:text-sm" aria-label="Budget Breakdown Summary">
        <tbody>
          <tr className="border-b border-border py-2 flex justify-between">
            <td className="text-ink-muted">Total Planned Budget</td>
            <td className="font-semibold tabular-nums text-ink">
              {formatMoney(totalBudgetMinor, currency, { hideZeroCents: true })}
            </td>
          </tr>
          <tr className="border-b border-border py-2 flex justify-between">
            <td className="text-ink-muted">Committed (Quotes)</td>
            <td className="font-semibold tabular-nums text-ink">
              {formatMoney(committedMinor, currency, { hideZeroCents: true })}
            </td>
          </tr>
          <tr className="py-2 flex justify-between">
            <td className="text-ink-muted">Remaining (Uncommitted)</td>
            <td className="font-semibold tabular-nums text-ink">
              {formatMoney(remainingMinor, currency, { hideZeroCents: true })}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="pt-2 border-t border-border grid grid-cols-1 gap-1.5 text-xs">
        {donutSegments.map((seg) => (
          <div key={seg.id} className="flex items-center justify-between text-ink-muted">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="truncate">{seg.label}</span>
            </div>
            <span className="font-semibold tabular-nums text-ink shrink-0 ml-2">
              {Math.round(seg.percent)}%
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
