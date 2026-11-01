'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Calendar } from 'lucide-react';
import type { Milestone } from '@/domain/schemas/timeline';

interface TimelineSummaryCardsProps {
  daysRemaining: number;
  isPast: boolean;
  eventDate: string;
  milestones: Milestone[];
}

export function TimelineSummaryCards({
  daysRemaining,
  isPast,
  eventDate,
  milestones,
}: TimelineSummaryCardsProps) {
  const completedCount = milestones.filter((m) => m.status === 'done' || m.status === 'completed').length;
  const totalCount = milestones.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const pendingCriticalCount = milestones.filter((m) => m.isCritical && m.status !== 'done' && m.status !== 'completed').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Days Countdown */}
      <Card className="border-l-4 border-l-[var(--color-accent)]">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Event Countdown</span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl sm:text-4xl font-serif text-ink tabular-nums">
            {isPast ? 'Event Passed' : `${daysRemaining}`}
          </span>
          {!isPast && <span className="text-sm font-sans text-ink-muted">days remaining</span>}
        </div>
        <span className="text-xs text-ink-muted mt-1 block flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {eventDate}
        </span>
      </Card>

      {/* Completion Progress */}
      <Card>
        <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Milestones Completed</span>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-3xl sm:text-4xl font-serif text-ink tabular-nums">
            {completedCount} <span className="text-base text-ink-muted font-sans">/ {totalCount}</span>
          </span>
          <span className="text-sm font-mono text-[var(--color-accent)] font-semibold">{progressPercent}%</span>
        </div>
        <div className="w-full bg-surface h-2 rounded-full overflow-hidden mt-3">
          <div
            className="bg-[var(--color-accent)] h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-label="Milestone completion progress"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </Card>

      {/* Critical Path Notice */}
      <Card>
        <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Critical Path</span>
        <p className="text-sm font-medium text-ink mt-1">
          {pendingCriticalCount} critical milestones pending
        </p>
        <p className="text-xs text-ink-muted mt-2">
          Venues, caterers, and key bookings require priority scheduling to guarantee availability.
        </p>
      </Card>
    </div>
  );
}
