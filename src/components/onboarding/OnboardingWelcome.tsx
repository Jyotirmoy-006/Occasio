'use client';

import React from 'react';
import { SAMPLE_PLANS } from '@/domain/sample-plans';
import { Button } from '@/components/ui/Button';
import { WeddingMotif, BirthdayMotif, CommunityMotif } from '@/components/icons/EventMotifs';

interface OnboardingWelcomeProps {
  onStartWizard: () => void;
  onSelectSample: (type: 'wedding' | 'birthday' | 'community') => void;
}

export function OnboardingWelcome({
  onStartWizard,
  onSelectSample,
}: OnboardingWelcomeProps) {
  return (
    <div className="space-y-8 max-w-2xl mx-auto py-4">
      <div className="text-center space-y-2">
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
          How would you like to begin?
        </h3>
        <p className="text-sm text-ink-muted">
          Create a custom tailored plan from scratch or explore with a sample plan.
        </p>
      </div>

      {/* Start from Scratch Action */}
      <div className="p-6 rounded-lg border-2 border-dashed border-[var(--color-accent)]/40 hover:border-[var(--color-accent)] bg-[var(--color-accent-subtle)]/30 transition-all text-center space-y-3">
        <h4 className="font-serif text-lg font-semibold text-ink">
          Start from Scratch
        </h4>
        <p className="text-xs text-ink-muted max-w-md mx-auto">
          Walk through the 4-step wizard with customized event date, guest count, live budget donut, and tailored priorities.
        </p>
        <Button
          variant="primary"
          onClick={onStartWizard}
          className="min-h-[44px] px-6 text-sm"
        >
          Start New Plan Wizard
        </Button>
      </div>

      {/* Sample Plans Section */}
      <div className="space-y-4">
        <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-ink-muted block text-center">
          Or Explore a Pre-Built Sample
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Wedding Sample */}
          <button
            onClick={() => onSelectSample('wedding')}
            className="p-4 rounded-lg bg-surface hover:bg-surface-raised border border-border text-left transition-all cursor-pointer group space-y-2"
          >
            <div className="w-8 h-8 rounded bg-[#1B4D3E]/10 text-[#1B4D3E] flex items-center justify-center">
              <WeddingMotif className="w-5 h-5" />
            </div>
            <h5 className="font-serif text-sm font-bold text-ink group-hover:text-[var(--color-accent)]">
              {SAMPLE_PLANS.wedding.eventName}
            </h5>
            <p className="text-[12px] text-ink-muted">
              120 guests · $30,000 · Hudson Valley, NY
            </p>
          </button>

          {/* Birthday Sample */}
          <button
            onClick={() => onSelectSample('birthday')}
            className="p-4 rounded-lg bg-surface hover:bg-surface-raised border border-border text-left transition-all cursor-pointer group space-y-2"
          >
            <div className="w-8 h-8 rounded bg-[#8B263E]/10 text-[#8B263E] flex items-center justify-center">
              <BirthdayMotif className="w-5 h-5" />
            </div>
            <h5 className="font-serif text-sm font-bold text-ink group-hover:text-[var(--color-accent)]">
              {SAMPLE_PLANS.birthday.eventName}
            </h5>
            <p className="text-[12px] text-ink-muted">
              40 guests · $4,500 · Brooklyn, NY
            </p>
          </button>

          {/* Community Sample */}
          <button
            onClick={() => onSelectSample('community')}
            className="p-4 rounded-lg bg-surface hover:bg-surface-raised border border-border text-left transition-all cursor-pointer group space-y-2"
          >
            <div className="w-8 h-8 rounded bg-[#1F4E5B]/10 text-[#1F4E5B] flex items-center justify-center">
              <CommunityMotif className="w-5 h-5" />
            </div>
            <h5 className="font-serif text-sm font-bold text-ink group-hover:text-[var(--color-accent)]">
              {SAMPLE_PLANS.community.eventName}
            </h5>
            <p className="text-[12px] text-ink-muted">
              250 guests · $12,000 · Austin, TX
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

