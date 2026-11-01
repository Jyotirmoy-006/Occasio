'use client';

import React from 'react';
import type { Currency } from '@/lib/constants';
import { formatMoney } from '@/lib/format';
import { Tooltip } from '@/components/ui/Tooltip';
import { ArrowRight } from 'lucide-react';

export interface DonutSegment {
  id: string;
  label: string;
  amountMinor: number;
  percent: number;
  color: string;
}

interface OverviewBudgetSnapshotProps {
  totalBudgetMinor: number;
  committedMinor: number;
  remainingMinor: number;
  committedPercent: number;
  currency: Currency;
  donutSegments: DonutSegment[];
  segmentsWithOffsets: Array<DonutSegment & { segLength: number; offset: number }>;
  circumference: number;
  onNavigateBudget: () => void;
}

export function OverviewBudgetSnapshot({
  totalBudgetMinor,
  committedMinor,
  remainingMinor,
  committedPercent,
  currency,
  donutSegments,
  segmentsWithOffsets,
  circumference,
  onNavigateBudget,
}: OverviewBudgetSnapshotProps) {
  return (
    <div className="paper-sheet paper-sheet-hover p-6 space-y-4">
      <div className="flex items-center justify-between pb-2 hairline-b">
        <div>
          <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
            III. Financial Ledger
          </span>
          <h3 id="section-budget-snapshot" className="font-serif text-xl font-bold text-ink letterpress-display">
            Budget Snapshot
          </h3>
        </div>
        <Tooltip content="Open full budget with linked sliders">
          <button
            onClick={onNavigateBudget}
            className="text-sm font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </div>

      {/* Visual SVG Donut: 7 Planned Segments Outer Ring + Committed Inner Ring */}
      <div className="flex items-center justify-center py-2">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {/* Outer Planned Ring Segments */}
            {segmentsWithOffsets.map((seg) => (
              <circle
                key={seg.id}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={seg.color}
                strokeWidth="8"
                strokeDasharray={`${seg.segLength} ${circumference - seg.segLength}`}
                strokeDashoffset={-seg.offset}
              />
            ))}

            {/* Thin Inner Ring for Committed Spend */}
            <circle
              cx="50"
              cy="50"
              r="28"
              fill="none"
              stroke="#E6DFD5"
              strokeWidth="3"
            />
            <circle
              cx="50"
              cy="50"
              r="28"
              fill="none"
              stroke="var(--color-foil-dark, #D9B65B)"
              strokeWidth="3"
              strokeDasharray={`${(committedPercent / 100) * (2 * Math.PI * 28)} ${2 * Math.PI * 28}`}
              strokeLinecap="round"
            />
          </svg>

          {/* Center Total Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
            <span className="font-serif text-base font-bold text-ink tabular-nums leading-tight">
              {formatMoney(totalBudgetMinor, currency, { hideZeroCents: true })}
            </span>
            <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted">
              {committedPercent}% Quoted
            </span>
          </div>
        </div>
      </div>

      {/* Accessible Summary Table: Total, Committed, Remaining */}
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

      {/* 7 Segments Interactive Legend */}
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
    </div>
  );
}

