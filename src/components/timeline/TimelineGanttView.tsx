'use client';

import React from 'react';
import type { Milestone } from '@/domain/schemas/timeline';
import { Card } from '@/components/ui/Card';

interface TimelineGanttViewProps {
  milestones: Milestone[];
  eventDate: string;
}

export function TimelineGanttView({ milestones, eventDate }: TimelineGanttViewProps) {
  const maxWeeks = 52;

  return (
    <Card className="overflow-x-auto p-6">
      <div className="min-w-[640px] space-y-4">
        <div className="border-b border-border pb-2 flex justify-between text-xs font-mono text-ink-muted">
          <span>Weeks Before Event</span>
          <span>Event Date ({eventDate})</span>
        </div>
        {milestones.map((m) => {
          const leftPercent = Math.max(5, Math.min(90, 100 - (m.weeksBeforeEvent / maxWeeks) * 100));
          const isDone = m.status === 'done' || m.status === 'completed';

          return (
            <div key={m.id} className="relative py-2 flex items-center">
              <div className="w-48 text-xs font-medium text-ink truncate pr-4">{m.label}</div>
              <div className="flex-1 relative h-6 bg-surface/50 rounded-md flex items-center">
                <div
                  className={`absolute px-2.5 py-1 rounded text-xs text-white font-mono flex items-center gap-1 shadow-sm ${
                    isDone
                      ? 'bg-success'
                      : m.isCritical
                      ? 'bg-warning'
                      : 'bg-[var(--color-accent)]'
                  }`}
                  style={{ left: `${leftPercent}%` }}
                >
                  <span>{m.dueDate}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
