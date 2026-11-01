'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface OnboardingFooterProps {
  view: 'welcome' | 'wizard';
  step: 1 | 2 | 3 | 4;
  isGenerating: boolean;
  onClose: () => void;
  onBackToWelcome: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onCreatePlan: (e: React.FormEvent) => void;
}

export function OnboardingFooter({
  view,
  step,
  isGenerating,
  onClose,
  onBackToWelcome,
  onPrevStep,
  onNextStep,
  onCreatePlan,
}: OnboardingFooterProps) {
  if (view === 'welcome') {
    return (
      <footer
        className="sticky bottom-0 z-20 bg-[#FAF7F2] hairline-t px-6 py-4 flex items-center justify-end"
        style={{ backgroundColor: '#FAF7F2' }}
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          className="min-h-[44px]"
        >
          Close
        </Button>
      </footer>
    );
  }

  return (
    <footer
      className="sticky bottom-0 z-20 bg-[#FAF7F2] hairline-t px-6 py-4 flex items-center justify-between"
      style={{ backgroundColor: '#FAF7F2' }}
    >
      <div>
        {step > 1 ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={onPrevStep}
            className="min-h-[44px] gap-1"
          >
            <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
            <span>Back</span>
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={onBackToWelcome}
            className="min-h-[44px]"
          >
            Welcome
          </Button>
        )}
      </div>

      <div>
        {step < 4 ? (
          <Button
            variant="primary"
            size="sm"
            onClick={onNextStep}
            className="min-h-[44px] gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4 stroke-[1.5]" />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={onCreatePlan}
            disabled={isGenerating}
            className="min-h-[44px] gap-2 px-6"
          >
            <Sparkles className="w-4 h-4 stroke-[1.5]" />
            <span>{isGenerating ? 'Generating Plan...' : 'Generate Plan'}</span>
          </Button>
        )}
      </div>
    </footer>
  );
}
