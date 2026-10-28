'use client';

import React from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { OverviewView } from '@/components/overview/OverviewView';
import { BudgetView } from '@/components/budget/BudgetView';
import { TimelineView } from '@/components/timeline/TimelineView';
import { ChecklistView } from '@/components/checklist/ChecklistView';
import { IdeasView } from '@/components/ideas/IdeasView';
import { CopilotView } from '@/components/copilot/CopilotView';
import { ScenarioCompare } from '@/components/compare/ScenarioCompare';

export default function HomePage() {
  const { activeTab, plan } = usePlan();

  if (!plan) {
    return (
      <div className="py-24 text-center space-y-4">
        <h1 className="text-2xl font-serif text-ink">Loading Occasio Plan...</h1>
        <p className="text-xs text-ink-muted">Retrieving your localized plan state.</p>
      </div>
    );
  }

  switch (activeTab) {
    case 'budget':
      return <BudgetView />;
    case 'timeline':
      return <TimelineView />;
    case 'checklist':
      return <ChecklistView />;
    case 'ideas':
      return <IdeasView />;
    case 'copilot':
      return <CopilotView />;
    case 'compare':
      return <ScenarioCompare />;
    case 'overview':
    default:
      return <OverviewView />;
  }
}
