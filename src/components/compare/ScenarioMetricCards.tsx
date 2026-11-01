'use client';

import React from 'react';
import type { Plan } from '@/domain/schemas/plan';
import { formatCurrency } from '@/domain/budget/format';
import { Card } from '@/components/ui/Card';

interface ScenarioMetricCardsProps {
  plan: Plan;
  scenarioPlan: Plan;
}

export function ScenarioMetricCards({ plan, scenarioPlan }: ScenarioMetricCardsProps) {
  const planPerGuest = plan.guestCount > 0 ? plan.budgetMinorUnits / plan.guestCount : 0;
  const scenarioPerGuest =
    scenarioPlan.guestCount > 0 ? scenarioPlan.budgetMinorUnits / scenarioPlan.guestCount : 0;
  const budgetDiffMinor = scenarioPlan.budgetMinorUnits - plan.budgetMinorUnits;
  const guestDiff = scenarioPlan.guestCount - plan.guestCount;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Budget Delta */}
      <Card>
        <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Budget Variance</span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-serif text-ink tabular-nums">
            {budgetDiffMinor >= 0
              ? `+${formatCurrency(budgetDiffMinor, plan.currency)}`
              : formatCurrency(budgetDiffMinor, plan.currency)}
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
  );
}
