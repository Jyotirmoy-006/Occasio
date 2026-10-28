'use client';

import React from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { formatCurrency, minorToMajor, parseInputToMinorUnits } from '@/domain/budget/format';
import { resizeBudget } from '@/domain/budget/allocation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Copy, X } from 'lucide-react';

export function ScenarioCompare() {
  const { plan, scenarioPlan, duplicatePlanForScenario, updateScenarioPlan, clearScenarioPlan } = usePlan();

  if (!plan) return null;

  if (!scenarioPlan) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 space-y-4 animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mx-auto text-[var(--color-accent)]">
          <Copy className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-serif text-ink">Scenario Comparison</h1>
        <p className="text-sm text-ink-muted max-w-md mx-auto">
          Duplicate your current plan to experiment with alternative budget totals or guest counts side-by-side without risking your baseline.
        </p>
        <Button onClick={duplicatePlanForScenario} className="gap-2 mt-4 min-h-[44px]">
          <Copy className="w-4 h-4" />
          <span>Create Alternative Scenario</span>
        </Button>
      </div>
    );
  }

  // Cost per guest comparison
  const planPerGuest = plan.guestCount > 0 ? plan.budgetMinorUnits / plan.guestCount : 0;
  const scenarioPerGuest = scenarioPlan.guestCount > 0 ? scenarioPlan.budgetMinorUnits / scenarioPlan.guestCount : 0;
  const budgetDiffMinor = scenarioPlan.budgetMinorUnits - plan.budgetMinorUnits;
  const guestDiff = scenarioPlan.guestCount - plan.guestCount;

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-ink-muted">Sensitivity Analysis</span>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink mt-1">Side-by-Side Comparison</h1>
          <p className="text-sm text-ink-muted mt-1">
            Compare your baseline plan against your experimental scenario.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={clearScenarioPlan} className="gap-2 text-error">
          <X className="w-4 h-4" />
          <span>Close Scenario</span>
        </Button>
      </div>

      {/* High-Level Comparison KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Budget Delta */}
        <Card>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Budget Variance</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-serif text-ink tabular-nums">
              {budgetDiffMinor >= 0 ? `+${formatCurrency(budgetDiffMinor, plan.currency)}` : formatCurrency(budgetDiffMinor, plan.currency)}
            </span>
          </div>
          <span className="text-xs text-ink-muted mt-1 block">
            {plan.eventName} vs Alternative
          </span>
        </Card>

        {/* Cost Per Guest Delta */}
        <Card>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Per-Guest Investment</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-serif text-ink tabular-nums">
              {formatCurrency(Math.round(scenarioPerGuest), plan.currency)}
            </span>
            <span className="text-xs text-ink-muted font-mono">
              Baseline: {formatCurrency(Math.round(planPerGuest), plan.currency)}
            </span>
          </div>
          <span className="text-xs text-ink-muted mt-1 block">
            Difference: {formatCurrency(Math.round(scenarioPerGuest - planPerGuest), plan.currency)} / guest
          </span>
        </Card>

        {/* Guest Count Delta */}
        <Card>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Guest Count Variance</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-serif text-ink tabular-nums">
              {scenarioPlan.guestCount} guests
            </span>
            <span className="text-xs text-ink-muted font-mono">
              Baseline: {plan.guestCount}
            </span>
          </div>
          <span className="text-xs text-ink-muted mt-1 block">
            {guestDiff >= 0 ? `+${guestDiff}` : guestDiff} guests delta
          </span>
        </Card>
      </div>

      {/* Side-by-Side Dual Column Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Baseline Plan (Read-Only) */}
        <Card className="border-t-4 border-t-ink">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <div>
              <span className="text-xs font-mono uppercase text-ink-muted">Baseline</span>
              <h2 className="text-lg font-serif font-semibold text-ink">{plan.eventName}</h2>
            </div>
            <Badge variant="neutral">Active Plan</Badge>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-ink-muted">Total Budget</span>
              <span className="font-mono font-semibold text-ink">{formatCurrency(plan.budgetMinorUnits, plan.currency)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-ink-muted">Guest Count</span>
              <span className="font-mono text-ink">{plan.guestCount} guests</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-ink-muted">Target City</span>
              <span className="text-ink">{plan.city}</span>
            </div>

            <div className="pt-2">
              <span className="font-mono uppercase text-[10px] text-ink-muted block mb-2">Category Allocations</span>
              <div className="space-y-1.5">
                {plan.budget.categories.map((c) => (
                  <div key={c.id} className="flex justify-between py-1 border-b border-border/20">
                    <span className="text-ink-muted">{c.label}</span>
                    <span className="font-mono">{formatCurrency(c.allocatedMinorUnits, plan.currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column: Scenario Plan (Interactive Tweaks) */}
        <Card className="border-t-4 border-t-[var(--color-accent)] bg-surface/30">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <div>
              <span className="text-xs font-mono uppercase text-[var(--color-accent)]">Alternative Scenario</span>
              <h2 className="text-lg font-serif font-semibold text-ink">{scenarioPlan.eventName}</h2>
            </div>
            <Badge variant="accent">Experiment</Badge>
          </div>

          {/* Interactive Tweakers */}
          <div className="space-y-4">
            {/* Budget Adjustment Tweak */}
            <div>
              <label className="text-xs font-mono uppercase text-ink-muted block mb-1">
                Adjust Scenario Total Budget
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  defaultValue={minorToMajor(scenarioPlan.budgetMinorUnits, plan.currency).toString()}
                  onBlur={(e) => {
                    const parsed = parseInputToMinorUnits(e.target.value, plan.currency);
                    if (parsed !== null) {
                      updateScenarioPlan((prev) => ({
                        ...prev,
                        budgetMinorUnits: parsed,
                        budget: resizeBudget(prev.budget, parsed),
                      }));
                    }
                  }}
                  className="flex-1 px-3 py-1.5 min-h-[44px] bg-paper border border-border rounded text-sm font-mono text-ink"
                  aria-label="Adjust scenario budget"
                />
                <span className="text-xs font-mono text-ink-muted">{plan.currency}</span>
              </div>
            </div>

            {/* Guest Count Adjustment Tweak */}
            <div>
              <label className="text-xs font-mono uppercase text-ink-muted block mb-1">
                Adjust Guest Count: {scenarioPlan.guestCount} guests
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="5"
                value={scenarioPlan.guestCount}
                onChange={(e) => {
                  const count = Number(e.target.value);
                  updateScenarioPlan((prev) => ({
                    ...prev,
                    guestCount: count,
                  }));
                }}
                className="w-full h-2 bg-paper rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
                aria-label="Adjust scenario guest count"
              />
            </div>

            {/* Scaled Category Allocations */}
            <div className="pt-2">
              <span className="font-mono uppercase text-[10px] text-ink-muted block mb-2">Scaled Allocations</span>
              <div className="space-y-1.5 text-xs">
                {scenarioPlan.budget.categories.map((c) => {
                  const baselineCat = plan.budget.categories.find((bc) => bc.id === c.id);
                  const delta = baselineCat ? c.allocatedMinorUnits - baselineCat.allocatedMinorUnits : 0;

                  return (
                    <div key={c.id} className="flex justify-between py-1 border-b border-border/20">
                      <span className="text-ink">{c.label}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span>{formatCurrency(c.allocatedMinorUnits, plan.currency)}</span>
                        {delta !== 0 && (
                          <span className={`text-[10px] ${delta > 0 ? 'text-success' : 'text-error'}`}>
                            ({delta > 0 ? `+${delta / 100}` : `${delta / 100}`})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
