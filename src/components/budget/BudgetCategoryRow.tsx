'use client';

import React from 'react';
import { formatCurrency, formatPercent, minorToMajor } from '@/domain/budget/format';
import type { Currency } from '@/lib/constants';
import type { BudgetCategory } from '@/domain/schemas/budget';
import { Badge } from '@/components/ui/Badge';
import { Lock, Unlock, AlertTriangle } from 'lucide-react';

interface BudgetCategoryRowProps {
  category: BudgetCategory;
  currency: Currency;
  totalMinor: number;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onToggleLock: (id: string) => void;
  onSliderChange: (id: string, newPercent: number) => void;
  onUpdateActual: (id: string, value: string) => void;
}

export function BudgetCategoryRow({
  category,
  currency,
  totalMinor,
  isHovered,
  onHover,
  onToggleLock,
  onSliderChange,
  onUpdateActual,
}: BudgetCategoryRowProps) {
  const isOverCategory = category.actualMinorUnits > category.allocatedMinorUnits;
  const percentOfTotal = totalMinor > 0 ? (category.allocatedMinorUnits / totalMinor) * 100 : 0;

  return (
    <div
      className={`p-3 rounded-md transition-colors ${
        isHovered ? 'bg-surface' : 'bg-transparent'
      }`}
      onMouseEnter={() => onHover(category.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Header Row: Label, Allocated Amount, Lock Toggle */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: category.color }} />
          <span className="font-medium text-sm text-ink">{category.label}</span>
          {category.locked && (
            <Badge variant="neutral" icon={<Lock className="w-3 h-3" />}>
              Locked
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-sm font-semibold text-ink tabular-nums font-mono">
              {formatCurrency(category.allocatedMinorUnits, currency)}
            </span>
            <span className="text-xs text-ink-muted block font-mono">
              {formatPercent(percentOfTotal)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleLock(category.id)}
            aria-label={category.locked ? `Unlock ${category.label}` : `Lock ${category.label}`}
            className="p-1.5 rounded hover:bg-surface text-ink-muted hover:text-ink cursor-pointer focus-visible:outline-2"
          >
            {category.locked ? <Lock className="w-4 h-4 text-warning" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Accessible Interactive Range Slider */}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          disabled={category.locked}
          value={Math.round(percentOfTotal)}
          onChange={(e) => onSliderChange(category.id, Number(e.target.value))}
          aria-label={`Allocate percentage for ${category.label}`}
          className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)] disabled:opacity-40"
        />
      </div>

      {/* Actual Spend Input & Warning */}
      <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-ink-muted">Actual spent:</span>
          <input
            type="text"
            defaultValue={minorToMajor(category.actualMinorUnits, currency).toString()}
            onBlur={(e) => onUpdateActual(category.id, e.target.value)}
            placeholder="0.00"
            aria-label={`Actual amount spent for ${category.label}`}
            className="w-24 px-2 py-1 bg-surface border border-border rounded text-ink font-mono text-xs text-right focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {isOverCategory && (
          <div className="flex items-center gap-1 text-error font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Over by {formatCurrency(category.actualMinorUnits - category.allocatedMinorUnits, currency)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
