'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { HealthAlert } from '@/domain/plan/health';

export type { HealthAlert };

interface OverviewHealthSectionProps {
  healthAlerts: HealthAlert[];
}

export function OverviewHealthSection({ healthAlerts }: OverviewHealthSectionProps) {
  return (
    <div className="paper-sheet paper-sheet-hover p-6 sm:p-7 space-y-3">
      <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
        II. Health & Advisory
      </span>
      <h3 className="font-serif text-xl font-bold text-ink letterpress-display">
        Plan Health Audit
      </h3>
      <p className="text-sm text-ink-muted">
        Rule-based evaluation of contract milestones, vendor statuses, and budget buffer.
      </p>

      <ul className="space-y-2.5 pt-1" aria-label="Plan Health Alerts">
        {healthAlerts.map((alert) => (
          <li
            key={alert.id}
            className={`p-3.5 rounded-lg flex items-start gap-3 text-xs sm:text-sm leading-relaxed ${
              alert.type === 'warning' || alert.type === 'caution'
                ? 'bg-[var(--color-caution-bg,#FCF6E8)] text-[var(--color-caution,#8A5A00)] border border-[var(--color-caution,#8A5A00)]/30'
                : 'bg-[var(--color-success-bg,#EAF3EE)] text-[var(--color-success,#2F6B4F)] border border-[var(--color-success,#2F6B4F)]/30'
            }`}
          >
            {alert.type === 'warning' || alert.type === 'caution' ? (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{alert.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
