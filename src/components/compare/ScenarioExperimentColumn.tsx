'use client';

import React from 'react';
import type { Plan } from '@/domain/schemas/plan';
import { formatCurrency, minorToMajor, parseInputToMinorUnits } from '@/domain/budget/format';
import { resizeBudget } from '@/domain/budget/allocation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface ScenarioExperimentColumnProps {
  plan: Plan;
  scenarioPlan: Plan;
  updateScenarioPlan: (updater: (prev: Plan) => Plan) => void;
}

export function ScenarioExperimentColumn({
  plan,
  scenarioPlan,
  updateScenarioPlan,
}: ScenarioExperimentColumnProps) {
  return (
    <Card className="border-t-4 border-t-[var(--color-accent)] bg-surface/30">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <div>
          <span className="text-xs font-mono uppercase text-[var(--color-accent)]">Alternative Scenario</span>
          <h2 className="text-lg font-serif font-semibold text-ink">{scenarioPlan.eventName}</h2>
        </div>
        <Badge variant="accent">Experiment</Badge>
      </div>

      <div className="space-y-4">
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
  );
}
