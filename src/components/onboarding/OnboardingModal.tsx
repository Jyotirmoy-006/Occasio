'use client';

import React, { useEffect, useRef } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { SAMPLE_PLANS } from '@/domain/sample-plans';
import { X } from 'lucide-react';

import { OnboardingWelcome } from './OnboardingWelcome';
import { WizardProgressRail } from './WizardProgressRail';
import { OnboardingStepContent } from './OnboardingStepContent';
import { OnboardingFooter } from './OnboardingFooter';
import { useOnboardingFlow } from './useOnboardingFlow';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function trapTabKey(e: KeyboardEvent, container: HTMLElement | null) {
  if (e.key !== 'Tab' || !container) return;
  const focusables = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last?.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first?.focus();
  }
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { createNewPlan } = usePlan();
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const flow = useOnboardingFlow(onClose);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (flow.isDirtyRef.current) {
          const confirmClose = window.confirm('Discard unsaved draft and close?');
          if (confirmClose) onClose();
        } else {
          onClose();
        }
      }

      trapTabKey(e, modalRef.current);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, flow.isDirtyRef]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (flow.isDirtyRef.current) {
      if (window.confirm('Discard unsaved draft and close?')) onClose();
    } else {
      onClose();
    }
  };

  const handleSelectSample = (type: 'wedding' | 'birthday' | 'community') => {
    createNewPlan(SAMPLE_PLANS[type]);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-[#1C1917]/55 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      ref={modalRef}
    >
      <div
        className="w-full h-full sm:h-auto sm:max-h-[calc(100dvh-32px)] sm:max-w-4xl flex flex-col bg-[#FAF7F2] rounded-none sm:rounded-xl shadow-2xl border-0 sm:border border-border overflow-hidden"
        style={{ backgroundColor: '#FAF7F2' }}
      >
        <header
          className="sticky top-0 z-20 bg-[#FAF7F2] hairline-b px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: '#FAF7F2' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-[var(--color-accent)] text-paper flex items-center justify-center font-serif text-sm font-bold select-none">
              O
            </div>
            <div>
              <h2 id="onboarding-title" className="font-serif text-lg font-bold text-ink">
                {flow.view === 'welcome' ? 'Start Planning' : 'Create New Event Plan'}
              </h2>
              {flow.view === 'wizard' && (
                <p className="text-[12px] text-ink-muted">Step {flow.step} of 4</p>
              )}
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close dialog"
            className="p-2 min-h-[44px] min-w-[44px] rounded-md hover:bg-surface text-ink-muted hover:text-ink transition-colors cursor-pointer flex items-center justify-center"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </header>

        <div
          className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#FAF7F2]"
          style={{ backgroundColor: '#FAF7F2' }}
        >
          {flow.view === 'welcome' ? (
            <OnboardingWelcome
              onStartWizard={() => flow.setView('wizard')}
              onSelectSample={handleSelectSample}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <WizardProgressRail
                currentStep={flow.step}
                onSelectStep={flow.setStep}
              />

              <div className="md:col-span-9">
                <OnboardingStepContent flow={flow} />
              </div>
            </div>
          )}
        </div>

        <OnboardingFooter
          view={flow.view}
          step={flow.step}
          isGenerating={flow.isGenerating}
          onClose={onClose}
          onBackToWelcome={() => flow.setView('welcome')}
          onPrevStep={flow.prevStep}
          onNextStep={flow.nextStep}
          onCreatePlan={flow.handleCreatePlan}
        />
      </div>
    </div>
  );
}
