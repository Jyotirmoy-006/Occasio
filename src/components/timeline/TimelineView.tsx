'use client';

import React, { useState } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import type { Plan } from '@/domain/schemas/plan';
import { daysUntilEvent } from '@/domain/timeline/generate';
import { Button } from '@/components/ui/Button';
import { Download, List, BarChart2 } from 'lucide-react';
import { TimelineSummaryCards } from './TimelineSummaryCards';
import { TimelineMilestoneItem } from './TimelineMilestoneItem';
import { TimelineGanttView } from './TimelineGanttView';
import { useTimelineActions } from './useTimelineActions';

export function TimelineView() {
  const { plan, updatePlan } = usePlan();
  if (!plan) return null;
  return <TimelineContent plan={plan} updatePlan={updatePlan} />;
}

interface TimelineContentProps {
  plan: Plan;
  updatePlan: (updater: (prev: Plan) => Plan) => void;
}

function TimelineContent({ plan, updatePlan }: TimelineContentProps) {
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const actions = useTimelineActions(plan, updatePlan);
  const { timeline, eventDate } = plan;
  const daysRemaining = daysUntilEvent(eventDate);
  const isPast = daysRemaining < 0;

  const categories = ['all', ...Array.from(new Set(timeline.milestones.map((m) => m.category)))];
  const filteredMilestones =
    filterCategory === 'all'
      ? timeline.milestones
      : timeline.milestones.filter((m) => m.category === filterCategory);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-ink-muted">Milestone Roadmap</span>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink mt-1">Timeline & Milestones</h1>
          <p className="text-sm text-ink-muted mt-1">
            Backward-planned milestones from your event date with accessible rescheduling controls.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-md overflow-hidden bg-surface">
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer ${
                viewMode === 'list' ? 'bg-paper text-ink font-medium shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              aria-label="Gantt chart view"
              className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer ${
                viewMode === 'gantt' ? 'bg-paper text-ink font-medium shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
            </button>
          </div>
          <Button variant="secondary" size="sm" onClick={actions.handleExportIcs} className="gap-2">
            <Download className="w-4 h-4" />
            <span>Export .ICS</span>
          </Button>
        </div>
      </div>

      <TimelineSummaryCards
        daysRemaining={daysRemaining}
        isPast={isPast}
        eventDate={eventDate}
        milestones={timeline.milestones}
      />

      <div className="flex flex-wrap gap-2 pt-2" role="tablist" aria-label="Filter milestones by category">
        {categories.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={filterCategory === cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 min-h-[36px] text-xs font-medium rounded-full border transition-colors cursor-pointer select-none ${
              filterCategory === cat
                ? 'bg-ink text-paper border-ink'
                : 'bg-paper text-ink-muted border-border hover:bg-surface hover:text-ink'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredMilestones.map((milestone) => (
            <TimelineMilestoneItem
              key={milestone.id}
              milestone={milestone}
              onStatusChange={actions.handleStatusChange}
              onShiftMilestone={actions.handleShiftMilestone}
            />
          ))}
        </div>
      ) : (
        <TimelineGanttView milestones={filteredMilestones} eventDate={eventDate} />
      )}
    </div>
  );
}
