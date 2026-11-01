'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface WizardProgressRailProps {
  currentStep: 1 | 2 | 3 | 4;
  onSelectStep: (step: 1 | 2 | 3 | 4) => void;
}

const STEPS: Array<{ s: 1 | 2 | 3 | 4; title: string }> = [
  { s: 1, title: 'Event & Name' },
  { s: 2, title: 'Date & Location' },
  { s: 3, title: 'Budget Allocation' },
  { s: 4, title: 'Style & Review' },
];

export function WizardProgressRail({ currentStep, onSelectStep }: WizardProgressRailProps) {
  return (
    <aside className="md:col-span-3 hairline-r md:pr-6 space-y-3" aria-label="Wizard Steps">
      <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
        Steps
      </span>

      <ol className="space-y-2 text-sm font-medium">
        {STEPS.map(({ s, title }) => (
          <li key={s}>
            <button
              onClick={() => {
                if (s < currentStep) onSelectStep(s);
              }}
              disabled={s > currentStep}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2.5 transition-colors ${
                currentStep === s
                  ? 'bg-[var(--color-accent-subtle)] text-ink font-bold'
                  : s < currentStep
                  ? 'text-ink hover:bg-surface cursor-pointer'
                  : 'text-ink-muted/50 cursor-not-allowed'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center tabular-nums ${
                  currentStep === s
                    ? 'bg-[var(--color-accent)] text-paper'
                    : s < currentStep
                    ? 'bg-border text-ink'
                    : 'border border-border text-ink-muted'
                }`}
              >
                {s < currentStep ? <Check className="w-3 h-3 stroke-[2]" /> : s}
              </span>
              <span className={`text-[13px] ${currentStep === s ? 'text-ink font-bold' : ''}`}>
                {title}
              </span>
            </button>
          </li>
        ))}
      </ol>

      {/* Asterisk Legend */}
      <p className="text-[11px] text-ink-muted pt-4 hairline-t">
        <span className="text-red-700 font-bold">*</span> indicates required field
      </p>
    </aside>
  );
}

