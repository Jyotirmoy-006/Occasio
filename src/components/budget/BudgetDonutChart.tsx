'use client';

import React from 'react';
import { formatCurrency, formatPercent } from '@/domain/budget/format';
import type { Currency } from '@/lib/constants';
import type { BudgetCategory } from '@/domain/schemas/budget';
import { BudgetTableAlternative } from './BudgetTableAlternative';
import { BudgetLegend } from './BudgetLegend';

interface BudgetDonutChartProps {
  categories: BudgetCategory[];
  totalMinor: number;
  currency: Currency;
  showTableAlternative: boolean;
  tableId: string;
  activeCategoryHover: string | null;
  setActiveCategoryHover: (id: string | null) => void;
}

export function BudgetDonutChart({
  categories,
  totalMinor,
  currency,
  showTableAlternative,
  tableId,
  activeCategoryHover,
  setActiveCategoryHover,
}: BudgetDonutChartProps) {
  const radius = 80;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;

  const donutSlices = categories.reduce<
    Array<{
      id: string;
      label: string;
      color: string;
      allocatedMinorUnits: number;
      allocatedPercent: number;
      actualMinorUnits: number;
      locked: boolean;
      fraction: number;
      strokeDasharray: string;
      strokeDashoffset: number;
    }>
  >((acc, cat) => {
    const prevOffset = acc.reduce((sum, item) => sum + item.fraction, 0);
    const fraction = totalMinor > 0 ? cat.allocatedMinorUnits / totalMinor : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -prevOffset * circumference;
    acc.push({
      ...cat,
      fraction,
      strokeDasharray,
      strokeDashoffset,
    });
    return acc;
  }, []);

  const activeCategory = activeCategoryHover
    ? categories.find((c) => c.id === activeCategoryHover)
    : null;

  return (
    <>
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="text-base font-serif text-ink">Allocation Distribution</h2>
        <span className="text-xs font-mono text-ink-muted">{categories.length} segments</span>
      </div>

      {!showTableAlternative ? (
        <div className="relative w-64 h-64 flex items-center justify-center my-4" role="img" aria-label="Budget allocation donut chart">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="var(--color-border)"
              strokeWidth={strokeWidth}
            />
            {donutSlices.map((slice) => (
              <circle
                key={slice.id}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={activeCategoryHover === slice.id ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setActiveCategoryHover(slice.id)}
                onMouseLeave={() => setActiveCategoryHover(null)}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            <span className="text-xs uppercase font-mono text-ink-muted">
              {activeCategory ? activeCategory.label : 'Total Budget'}
            </span>
            <span className="text-xl font-serif text-ink tabular-nums font-semibold mt-0.5">
              {activeCategory
                ? formatCurrency(activeCategory.allocatedMinorUnits, currency)
                : formatCurrency(totalMinor, currency)}
            </span>
            <span className="text-xs text-ink-muted mt-0.5">
              {activeCategory
                ? formatPercent(activeCategory.allocatedPercent)
                : '100% Allocated'}
            </span>
          </div>
        </div>
      ) : (
        <BudgetTableAlternative
          categories={categories}
          currency={currency}
          tableId={tableId}
        />
      )}

      <BudgetLegend categories={categories} onHover={setActiveCategoryHover} />
    </>
  );
}
