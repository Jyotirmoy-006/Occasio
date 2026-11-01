'use client';

import React from 'react';
import { DIETARY_CHIPS } from '@/domain/schemas/plan';
import { PrivacyTransparencyBox } from './PrivacyTransparencyBox';

interface StepPrioritiesProps {
  style: string;
  setStyle: (s: string) => void;
  dietaryRequirements: string[];
  onToggleDietary: (d: string) => void;
  culturalNeeds: string;
  setCulturalNeeds: (c: string) => void;
  priorityOptions: string[];
  selectedPriorities: string[];
  onTogglePriority: (p: string) => void;
  showPrivacyDetails: boolean;
  setShowPrivacyDetails: React.Dispatch<React.SetStateAction<boolean>>;
}

export function StepPriorities({
  style,
  setStyle,
  dietaryRequirements,
  onToggleDietary,
  culturalNeeds,
  setCulturalNeeds,
  priorityOptions,
  selectedPriorities,
  onTogglePriority,
  showPrivacyDetails,
  setShowPrivacyDetails,
}: StepPrioritiesProps) {
  return (
    <div className="space-y-6">
      {/* Style & Vibe */}
      <div>
        <label htmlFor="field-style" className="block text-sm font-semibold text-ink mb-1">
          Atmosphere & Style Vibe
        </label>
        <input
          id="field-style"
          type="text"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          placeholder="e.g. Modern botanical, rustic warmth, retro disco lounge"
          className="w-full px-3.5 py-2.5 rounded-md border border-border text-sm bg-paper text-ink focus:border-[var(--color-accent)]"
        />
        <p className="text-[11px] text-ink-muted mt-1">
          Optional. Shared with the AI. Avoid personal details.
        </p>
      </div>

      {/* Dietary Requirements Chips */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">
          Dietary Selections
        </label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_CHIPS.map((chip) => {
            const isSelected = dietaryRequirements.includes(chip);
            return (
              <button
                key={chip}
                type="button"
                onClick={() => onToggleDietary(chip)}
                aria-pressed={isSelected}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--color-accent)] text-paper border-[var(--color-accent)]'
                    : 'bg-paper text-ink border-border hover:bg-surface'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cultural / Traditions */}
      <div>
        <label htmlFor="field-cultural" className="block text-sm font-semibold text-ink mb-1">
          Cultural or Family Traditions
        </label>
        <input
          id="field-cultural"
          type="text"
          value={culturalNeeds}
          onChange={(e) => setCulturalNeeds(e.target.value)}
          placeholder="e.g. Tea ceremony, blessing ritual, kosher catering"
          className="w-full px-3.5 py-2.5 rounded-md border border-border text-sm bg-paper text-ink focus:border-[var(--color-accent)]"
        />
        <p className="text-[11px] text-ink-muted mt-1">
          Optional. Shared with the AI. Avoid personal details.
        </p>
      </div>

      {/* Priority Chips (2 of 5 count, disabled at 5) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-semibold text-ink">
            Planning Priorities
          </label>
          <span className="text-xs text-ink-muted tabular-nums">
            {selectedPriorities.length} of 5 selected
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {priorityOptions.map((priority) => {
            const isSelected = selectedPriorities.includes(priority);
            const isDisabled = !isSelected && selectedPriorities.length >= 5;

            return (
              <button
                key={priority}
                type="button"
                onClick={() => onTogglePriority(priority)}
                disabled={isDisabled}
                aria-pressed={isSelected}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-[var(--color-accent)] text-paper border-[var(--color-accent)] cursor-pointer'
                    : isDisabled
                    ? 'bg-surface text-ink-muted/50 border-border cursor-not-allowed'
                    : 'bg-paper text-ink border-border hover:bg-surface cursor-pointer'
                }`}
              >
                {priority}
              </button>
            );
          })}
        </div>
      </div>

      {/* Privacy Transparency Dropdown */}
      <PrivacyTransparencyBox
        isOpen={showPrivacyDetails}
        onToggle={() => setShowPrivacyDetails((prev) => !prev)}
      />
    </div>
  );
}
