'use client';

import React from 'react';
import type { DayTimelineItem } from '@/domain/schemas/ideas';
import { Card } from '@/components/ui/Card';
import { Clock } from 'lucide-react';

interface IdeasTimelineSectionProps {
  dayTimeline: DayTimelineItem[];
}

export function IdeasTimelineSection({ dayTimeline }: IdeasTimelineSectionProps) {
  return (
    <section aria-labelledby="day-heading" className="space-y-4 pt-4 border-t border-border/60">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-[var(--color-accent)]" />
        <h2 id="day-heading" className="text-xl font-serif text-ink">Day-of Itinerary & Schedule</h2>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-border/60">
          {dayTimeline.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-surface/30"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold px-2 py-1 bg-surface border border-border rounded text-ink min-w-[60px] text-center">
                  {item.time}
                </span>
                <div>
                  <span className="font-medium text-sm text-ink">{item.label}</span>
                  {item.notes && <p className="text-xs text-ink-muted mt-0.5">{item.notes}</p>}
                </div>
              </div>
              <span className="text-xs font-mono text-ink-muted self-end sm:self-center">
                Duration: {item.duration}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
