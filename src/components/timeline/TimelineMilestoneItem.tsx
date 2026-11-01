'use client';

import React from 'react';
import type { Milestone, MilestoneStatus } from '@/domain/schemas/timeline';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Clock,
  CheckCircle2,
  Circle,
  Clock3,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface TimelineMilestoneItemProps {
  milestone: Milestone;
  onStatusChange: (id: string, nextStatus: MilestoneStatus) => void;
  onShiftMilestone: (id: string, daysShift: number) => void;
}

function getStatusIcon(status: MilestoneStatus) {
  switch (status) {
    case 'done':
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-success" />;
    case 'in-progress':
      return <Clock3 className="w-4 h-4 text-warning" />;
    case 'skipped':
      return <SkipForward className="w-4 h-4 text-ink-muted" />;
    default:
      return <Circle className="w-4 h-4 text-ink-muted" />;
  }
}

const NEXT_STATUS_MAP: Record<MilestoneStatus, MilestoneStatus> = {
  pending: 'in-progress',
  'in-progress': 'done',
  done: 'pending',
  completed: 'pending',
  skipped: 'pending',
};

export function TimelineMilestoneItem({
  milestone,
  onStatusChange,
  onShiftMilestone,
}: TimelineMilestoneItemProps) {
  const isDone = milestone.status === 'done' || milestone.status === 'completed';

  return (
    <Card
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition-colors ${
        isDone ? 'opacity-70 bg-surface/40' : 'bg-paper'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <button
          onClick={() => onStatusChange(milestone.id, NEXT_STATUS_MAP[milestone.status])}
          className="mt-0.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md hover:bg-surface cursor-pointer text-ink"
          aria-label={`Toggle status for ${milestone.label}, currently ${milestone.status}`}
        >
          {getStatusIcon(milestone.status)}
        </button>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`font-medium text-sm text-ink ${
                isDone ? 'line-through text-ink-muted' : ''
              }`}
            >
              {milestone.label}
            </span>
            {milestone.isCritical && (
              <Badge variant="warning" icon={<AlertCircle className="w-3 h-3" />}>
                Critical
              </Badge>
            )}
            <span className="text-xs px-2 py-0.5 rounded bg-surface border border-border text-ink-muted">
              {milestone.category}
            </span>
          </div>
          {milestone.description && (
            <p className="text-xs text-ink-muted mt-1 max-w-xl">{milestone.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
        <div className="text-right">
          <span className="text-xs font-mono font-medium text-ink tabular-nums flex items-center gap-1">
            <Clock className="w-3 h-3 text-ink-muted" />
            {milestone.dueDate}
          </span>
          <span className="text-xs text-ink-muted block font-mono">
            {milestone.weeksBeforeEvent}w prior
          </span>
        </div>

        <div className="flex items-center border border-border rounded-md bg-surface">
          <button
            onClick={() => onShiftMilestone(milestone.id, -7)}
            aria-label={`Move ${milestone.label} 1 week earlier`}
            className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center hover:bg-paper rounded-l text-ink-muted hover:text-ink cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onShiftMilestone(milestone.id, 7)}
            aria-label={`Move ${milestone.label} 1 week later`}
            className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center hover:bg-paper rounded-r text-ink-muted hover:text-ink cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
