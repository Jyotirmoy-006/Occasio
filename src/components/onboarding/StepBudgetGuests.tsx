'use client';

import React from 'react';
import { formatMoney, SUPPORTED_CURRENCIES } from '@/lib/format';
import type { createDefaultBudget } from '@/domain/budget/allocation';

interface StepBudgetGuestsProps {
  currency: string;
  setCurrency: (c: string) => void;
  budgetDisplay: string;
  setBudgetDisplay: (b: string) => void;
  approxPerGuest: number;
  liveBudget: ReturnType<typeof createDefaultBudget>;
  error?: string;
  onBlurBudget: () => void;
}

export function StepBudgetGuests({
  currency,
  setCurrency,
  budgetDisplay,
  setBudgetDisplay,
  approxPerGuest,
  liveBudget,
  error,
  onBlurBudget,
}: StepBudgetGuestsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Currency selector */}
        <div>
          <label htmlFor="field-currency" className="block text-sm font-semibold text-ink mb-1">
            Currency
          </label>
          <select
            id="field-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2.5 rounded-md border border-border text-sm bg-paper text-ink cursor-pointer focus:border-[var(--color-accent)]"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Total Budget Input */}
        <div>
          <label htmlFor="field-budget" className="block text-sm font-semibold text-ink mb-1">
            Total Budget <span className="text-red-700">*</span>
          </label>
          <input
            id="field-budget"
            inputMode="numeric"
            type="text"
            value={budgetDisplay}
            onChange={(e) => setBudgetDisplay(e.target.value)}
            onBlur={onBlurBudget}
            placeholder="25,000"
            aria-required="true"
            aria-invalid={!!error}
            aria-describedby={error ? 'err-budget' : undefined}
            className="w-full px-3.5 py-2.5 rounded-md border border-border text-sm tabular-nums font-semibold bg-paper text-ink focus:border-[var(--color-accent)]"
          />
          {error && (
            <p id="err-budget" className="text-xs text-red-700 mt-1" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Live Metric: Approx Per Guest */}
      <div className="p-3 rounded-md bg-surface border border-border flex items-center justify-between text-xs">
        <span className="text-ink-muted">Approximate budget per guest:</span>
        <span className="font-bold tabular-nums text-ink text-sm">
          {formatMoney(approxPerGuest, currency)}
        </span>
      </div>

      {/* Live Deterministic Allocation Donut Preview */}
      <div className="p-4 rounded-lg bg-surface border border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink uppercase tracking-wide">
            Live Category Allocation Preview
          </span>
          <span className="text-[11px] text-ink-muted">
            (Math computed in pure code)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {liveBudget.categories.slice(0, 6).map((cat) => (
            <div key={cat.id} className="p-2 rounded bg-paper border border-border text-xs">
              <span className="text-ink-muted block truncate">{cat.label}</span>
              <span className="font-bold tabular-nums text-ink">
                {formatMoney(cat.allocatedMinorUnits, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

