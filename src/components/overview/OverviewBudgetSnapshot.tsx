'use client';

import React from 'react';
import type { Currency } from '@/lib/constants';
import { formatMoney } from '@/lib/format';
import { Tooltip } from '@/components/ui/Tooltip';
import { ArrowRight } from 'lucide-react';
import { OverviewBudgetTable } from './OverviewBudgetTable';

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

      {/* Visual SVG Donut */}
      <div className="flex items-center justify-center py-2">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
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

            <circle cx="50" cy="50" r="28" fill="none" stroke="#E6DFD5" strokeWidth="3" />
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

      <OverviewBudgetTable
        totalBudgetMinor={totalBudgetMinor}
        committedMinor={committedMinor}
        remainingMinor={remainingMinor}
        currency={currency}
        donutSegments={donutSegments}
      />
    </div>
  );
}
