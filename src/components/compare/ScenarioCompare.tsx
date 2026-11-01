'use client';

import React from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { Button } from '@/components/ui/Button';
import { Copy, X } from 'lucide-react';
import { ScenarioMetricCards } from './ScenarioMetricCards';
import { ScenarioBaselineColumn } from './ScenarioBaselineColumn';
import { ScenarioExperimentColumn } from './ScenarioExperimentColumn';

export function ScenarioCompare() {
  const { plan, scenarioPlan, duplicatePlanForScenario, updateScenarioPlan, clearScenarioPlan } =
    usePlan();

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

  return (
    <div className="space-y-8 animate-fade-in text-left">
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

      <ScenarioMetricCards plan={plan} scenarioPlan={scenarioPlan} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <ScenarioBaselineColumn plan={plan} />
        <ScenarioExperimentColumn
          plan={plan}
          scenarioPlan={scenarioPlan}
          updateScenarioPlan={updateScenarioPlan}
        />
      </div>
    </div>
  );
}
