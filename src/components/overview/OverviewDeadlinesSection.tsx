'use client';

import React from 'react';
import Image from 'next/image';
import type { Milestone } from '@/domain/schemas/timeline';
import { formatEventDate } from '@/lib/format';
import { Tooltip } from '@/components/ui/Tooltip';
import { ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface OverviewDeadlinesSectionProps {
  activeMilestones: Milestone[];
  milestonesByPhase: Record<string, Milestone[]>;
  todayStr: string;
  now: Date;
  onToggleMilestone: (id: string) => void;
  onNavigateTimeline: () => void;
}

export function OverviewDeadlinesSection({
  activeMilestones,
  milestonesByPhase,
  todayStr,
  now,
  onToggleMilestone,
  onNavigateTimeline,
}: OverviewDeadlinesSectionProps) {
  return (
    <div className="paper-sheet paper-sheet-hover p-6 sm:p-7 space-y-5">
      <div className="flex items-center justify-between pb-3 hairline-b">
        <div>
          <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
            I. Milestones & Agenda
          </span>
          <h3 id="section-next-up" className="font-serif text-xl sm:text-2xl font-bold text-ink letterpress-display">
            Immediate Deadlines
          </h3>
          <p className="text-sm text-ink-muted">
            Backward-scheduled from celebration day (snapped to weekdays).
          </p>
        </div>

        <Tooltip content="Open full milestone Gantt timeline">
          <button
            onClick={onNavigateTimeline}
            className="text-sm font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          >
            <span>View Timeline</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      {activeMilestones.length === 0 ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-24 h-24 mx-auto opacity-70">
            <Image src="/images/empty/milestones.svg" alt="" width={96} height={96} />
          </div>
          <p className="text-sm text-ink-muted italic">All scheduled milestones are complete!</p>
        </div>
      ) : (
        <div className="space-y-4" aria-label="Upcoming Milestones by Phase">
          {Object.entries(milestonesByPhase).map(([phaseName, items]) => (
            <div key={phaseName} className="space-y-2">
              <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted px-1 block">
                {phaseName}
              </span>
              <ul className="space-y-2.5">
                {items.map((milestone) => {
                  const isOverdue = milestone.dueDate < todayStr;
                  const diffDays = Math.round(
                    (new Date(milestone.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
                  );
                  const isDueSoon = !isOverdue && diffDays <= 14;

                  return (
                    <li
                      key={milestone.id}
                      className="p-3.5 rounded-lg bg-[var(--color-inset,#F1EADC)] border border-border flex items-center justify-between gap-4 transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-card,#FFFDF8)]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => onToggleMilestone(milestone.id)}
                          aria-label={`Mark "${milestone.label}" as complete`}
                          className="w-5 h-5 rounded border border-border hover:border-[var(--color-accent)] flex items-center justify-center cursor-pointer bg-[var(--color-card,#FFFDF8)] text-transparent hover:text-[var(--color-accent)] transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">
                            {milestone.label}
                          </p>
                          <p className="text-xs text-ink-muted">
                            Due {formatEventDate(milestone.dueDate, { includeRelative: true })}
                          </p>
                        </div>
                      </div>

                      {/* Status Tag ONLY when due within 14 days or overdue */}
                      <div className="shrink-0">
                        {isOverdue ? (
                          <span className="flex items-center gap-1 text-[12px] font-semibold text-[var(--color-danger,#9B2C2C)] px-2.5 py-1 rounded bg-[var(--color-danger-bg,#FDEEED)] border border-[var(--color-danger,#9B2C2C)]/20">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Overdue
                          </span>
                        ) : isDueSoon ? (
                          <span className="flex items-center gap-1 text-[12px] font-semibold text-[var(--color-caution,#8A5A00)] px-2.5 py-1 rounded bg-[var(--color-caution-bg,#FCF6E8)] border border-[var(--color-caution,#8A5A00)]/20">
                            <Clock className="w-3.5 h-3.5" />
                            Due Soon
                          </span>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

