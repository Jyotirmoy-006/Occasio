'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePlan } from '@/lib/context/PlanContext';
import { OverviewView } from '@/components/overview/OverviewView';

const BudgetView = dynamic(() => import('@/components/budget/BudgetView').then((m) => m.BudgetView), {
  loading: () => <div className="py-12 text-center text-sm text-ink-muted">Loading budget...</div>,
});
const TimelineView = dynamic(() => import('@/components/timeline/TimelineView').then((m) => m.TimelineView), {
  loading: () => <div className="py-12 text-center text-sm text-ink-muted">Loading timeline...</div>,
});
const ChecklistView = dynamic(() => import('@/components/checklist/ChecklistView').then((m) => m.ChecklistView), {
  loading: () => <div className="py-12 text-center text-sm text-ink-muted">Loading checklist...</div>,
});
const IdeasView = dynamic(() => import('@/components/ideas/IdeasView').then((m) => m.IdeasView), {
  loading: () => <div className="py-12 text-center text-sm text-ink-muted">Loading ideas...</div>,
});
const CopilotView = dynamic(() => import('@/components/copilot/CopilotView').then((m) => m.CopilotView), {
  loading: () => <div className="py-12 text-center text-sm text-ink-muted">Loading copilot...</div>,
});
const ScenarioCompare = dynamic(() => import('@/components/compare/ScenarioCompare').then((m) => m.ScenarioCompare), {
  loading: () => <div className="py-12 text-center text-sm text-ink-muted">Loading scenario comparison...</div>,
});

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
