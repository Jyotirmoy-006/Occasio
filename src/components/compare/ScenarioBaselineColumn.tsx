'use client';

import React from 'react';
import type { Plan } from '@/domain/schemas/plan';
import { formatCurrency } from '@/domain/budget/format';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface ScenarioBaselineColumnProps {
  plan: Plan;
}

export function ScenarioBaselineColumn({ plan }: ScenarioBaselineColumnProps) {
  return (
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
          <span className="font-mono font-semibold text-ink">
            {formatCurrency(plan.budgetMinorUnits, plan.currency)}
          </span>
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
  );
}
