'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import {
  type OnboardingInput,
  type EventType,
} from '@/domain/schemas/plan';
import { parseInputToMinorUnits } from '@/domain/budget/format';
import { createDefaultBudget } from '@/domain/budget/allocation';
import { generateTimeline } from '@/domain/timeline/generate';
import { generateChecklist } from '@/domain/checklist/generate';
import type { Currency } from '@/lib/constants';
import { SAMPLE_PLANS } from '@/domain/sample-plans';
import { Button } from '@/components/ui/Button';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

import { OnboardingWelcome } from './OnboardingWelcome';
import { WizardProgressRail } from './WizardProgressRail';
import { StepEventDetails } from './StepEventDetails';
import { StepDateLocation } from './StepDateLocation';
import { StepBudgetGuests } from './StepBudgetGuests';
import { StepPriorities } from './StepPriorities';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DRAFT_STORAGE_KEY = 'occasio_onboarding_draft_v2';

function getStoredDraft() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const EVENT_PRIORITIES: Record<EventType, string[]> = {
  wedding: [
    'Venue & Ceremony',
    'Catering & Bar',
    'Photography & Video',
    'Music & Entertainment',
    'Florals & Decor',
    'Attire & Styling',
    'Guest Experience',
  ],
  birthday: [
    'Venue Rental',
    'Catering & Bites',
    'Cake & Dessert',
    'DJ & Entertainment',
    'Decor & Lighting',
    'Party Favors & Games',
  ],
  community: [
    'Venue & Permits',
    'Sound & Stage',
    'Food Stalls & Trucks',
    'Volunteers & Safety',
    'Family & Kids Activities',
    'Signage & Accessibility',
  ],
};

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { createNewPlan } = usePlan();
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const isDirtyRef = useRef(false);

  // View state: 'welcome' | 'wizard'
  const [view, setView] = useState<'welcome' | 'wizard'>('welcome');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields initialized lazily from draft if available
  const [draft] = useState(() => getStoredDraft());
  const [eventType, setEventType] = useState<EventType>(() => draft?.eventType || 'wedding');
  const [eventName, setEventName] = useState(() => draft?.eventName || '');
  const [eventDate, setEventDate] = useState(() => draft?.eventDate || '');
  const [guestCount, setGuestCount] = useState<number>(() => draft?.guestCount || 100);
  const [budgetDisplay, setBudgetDisplay] = useState(() => draft?.budgetDisplay || '25,000');
  const [currency, setCurrency] = useState(() => draft?.currency || 'USD');
  const [city, setCity] = useState(() => draft?.city || '');
  const [style, setStyle] = useState(() => draft?.style || '');
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>(() => draft?.dietaryRequirements || []);
  const [culturalNeeds, setCulturalNeeds] = useState(() => draft?.culturalNeeds || '');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(() => draft?.selectedPriorities || ['Venue & Ceremony', 'Catering & Bar']);

  // Validation errors (triggered onBlur)
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false);

  // Capture previously focused element on open & lock background scroll
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen]);

  // Autosave draft
  useEffect(() => {
    if (view === 'wizard' && (eventName || city || style || eventDate)) {
      isDirtyRef.current = true;
      const currentDraft = {
        eventType,
        eventName,
        eventDate,
        guestCount,
        budgetDisplay,
        currency,
        city,
        style,
        dietaryRequirements,
        culturalNeeds,
        selectedPriorities,
      };
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(currentDraft));
      } catch {
        // Quota exceeded safe ignore
      }
    }
  }, [
    view,
    eventType,
    eventName,
    eventDate,
    guestCount,
    budgetDisplay,
    currency,
    city,
    style,
    dietaryRequirements,
    culturalNeeds,
    selectedPriorities,
  ]);

  // Esc key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDirtyRef.current) {
          const confirmClose = window.confirm('Discard unsaved draft and close?');
          if (confirmClose) onClose();
        } else {
          onClose();
        }
      }

      // Simple focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Lead time calculation
  const todayStr = new Date().toISOString().split('T')[0];
  let leadTimeDays: number | null = null;
  if (eventDate) {
    const diff = new Date(eventDate).getTime() - new Date().getTime();
    leadTimeDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  const isShortLeadTime = leadTimeDays !== null && leadTimeDays > 0 && leadTimeDays < 45;

  // Live budget allocation computation for Step 3 preview
  const parsedBudget = parseInputToMinorUnits(budgetDisplay, currency as Currency);
  const budgetMinorUnits = parsedBudget !== null && parsedBudget > 0 ? parsedBudget : 1000000;
  const liveBudget = createDefaultBudget(eventType, budgetMinorUnits);
  const approxPerGuest = guestCount > 0 ? Math.round(budgetMinorUnits / guestCount) : 0;

  const currentPriorityOptions = EVENT_PRIORITIES[eventType];

  const handleTogglePriority = (priority: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : prev.length < 5
        ? [...prev, priority]
        : prev,
    );
  };

  const handleToggleDietary = (diet: string) => {
    setDietaryRequirements((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet],
    );
  };

  const validateField = (field: string) => {
    const newErrors = { ...errors };

    if (field === 'eventName') {
      if (!eventName.trim()) newErrors.eventName = 'Event name is required';
      else delete newErrors.eventName;
    }
    if (field === 'eventDate') {
      if (!eventDate) newErrors.eventDate = 'Event date is required';
      else if (eventDate <= todayStr) newErrors.eventDate = 'Date must be in the future';
      else delete newErrors.eventDate;
    }
    if (field === 'city') {
      if (!city.trim()) newErrors.city = 'City or region is required';
      else delete newErrors.city;
    }
    if (field === 'budget') {
      if (budgetMinorUnits <= 0) newErrors.budget = 'Please enter a valid budget amount';
      else delete newErrors.budget;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!eventName.trim()) {
        validateField('eventName');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const validDate = validateField('eventDate');
      const validCity = validateField('city');
      if (!validDate || !validCity) return;
      setStep(3);
    } else if (step === 3) {
      const validBudget = validateField('budget');
      if (!validBudget) return;
      setStep(4);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const payload: OnboardingInput = {
        eventType,
        eventName: eventName.trim() || `${eventType.toUpperCase()} Celebration`,
        eventDate,
        guestCount,
        budgetMinorUnits,
        currency: currency as Currency,
        city: city.trim(),
        style: style.trim(),
        culturalNeeds: culturalNeeds.trim(),
        dietaryRequirements,
        priorities: selectedPriorities,
      };

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let ideas;
      if (res.ok) {
        const data = await res.json();
        ideas = data.ideas;
      }

      const budget = createDefaultBudget(eventType, budgetMinorUnits);
      const timeline = generateTimeline(eventType, eventDate);
      const checklist = generateChecklist(eventType);

      const newPlan = {
        id: crypto.randomUUID(),
        schemaVersion: 1 as const,
        eventType,
        eventName: payload.eventName,
        eventDate: payload.eventDate,
        guestCount: payload.guestCount,
        budgetMinorUnits: payload.budgetMinorUnits,
        currency: payload.currency,
        city: payload.city,
        style: payload.style,
        culturalNeeds: payload.culturalNeeds,
        priorities: payload.priorities,
        budget,
        timeline,
        checklist,
        ideas: ideas || {
          themes: [],
          colorPalettes: [],
          menuIdeas: [],
          activities: [],
          decor: [],
          dayTimeline: [],
          provenance: {
            source: 'demo_engine' as const,
            timestamp: new Date().toISOString(),
            label: 'Demo engine',
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isAIGenerated: true,
      };

      createNewPlan(newPlan);
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {}
      onClose();
    } catch (err) {
      console.error('Plan generation error:', err);
    } finally {
      setIsGenerating(false);
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
        {/* Sticky Header */}
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
                {view === 'welcome' ? 'Start Planning' : 'Create New Event Plan'}
              </h2>
              {view === 'wizard' && (
                <p className="text-[12px] text-ink-muted">Step {step} of 4</p>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              if (isDirtyRef.current) {
                if (window.confirm('Discard unsaved draft and close?')) onClose();
              } else {
                onClose();
              }
            }}
            aria-label="Close dialog"
            className="p-2 min-h-[44px] min-w-[44px] rounded-md hover:bg-surface text-ink-muted hover:text-ink transition-colors cursor-pointer flex items-center justify-center"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </header>

        {/* Modal Body with internal scroll */}
        <div
          className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#FAF7F2]"
          style={{ backgroundColor: '#FAF7F2' }}
        >
          {view === 'welcome' ? (
            <OnboardingWelcome
              onStartWizard={() => setView('wizard')}
              onSelectSample={handleSelectSample}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <WizardProgressRail
                currentStep={step}
                onSelectStep={(s) => setStep(s)}
              />

              <div className="md:col-span-9">
                {step === 1 && (
                  <StepEventDetails
                    eventType={eventType}
                    setEventType={setEventType}
                    eventName={eventName}
                    setEventName={setEventName}
                    error={errors.eventName}
                    onBlur={() => validateField('eventName')}
                  />
                )}

                {step === 2 && (
                  <StepDateLocation
                    eventDate={eventDate}
                    setEventDate={setEventDate}
                    city={city}
                    setCity={setCity}
                    guestCount={guestCount}
                    setGuestCount={setGuestCount}
                    isShortLeadTime={isShortLeadTime}
                    todayStr={todayStr}
                    errors={errors}
                    onBlurDate={() => validateField('eventDate')}
                    onBlurCity={() => validateField('city')}
                  />
                )}

                {step === 3 && (
                  <StepBudgetGuests
                    currency={currency}
                    setCurrency={setCurrency}
                    budgetDisplay={budgetDisplay}
                    setBudgetDisplay={setBudgetDisplay}
                    approxPerGuest={approxPerGuest}
                    liveBudget={liveBudget}
                    error={errors.budget}
                    onBlurBudget={() => validateField('budget')}
                  />
                )}

                {step === 4 && (
                  <StepPriorities
                    style={style}
                    setStyle={setStyle}
                    dietaryRequirements={dietaryRequirements}
                    onToggleDietary={handleToggleDietary}
                    culturalNeeds={culturalNeeds}
                    setCulturalNeeds={setCulturalNeeds}
                    priorityOptions={currentPriorityOptions}
                    selectedPriorities={selectedPriorities}
                    onTogglePriority={handleTogglePriority}
                    showPrivacyDetails={showPrivacyDetails}
                    setShowPrivacyDetails={setShowPrivacyDetails}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer with Action Buttons */}
        <footer
          className="sticky bottom-0 z-20 bg-[#FAF7F2] hairline-t px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: '#FAF7F2' }}
        >
          {view === 'welcome' ? (
            <div className="w-full flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onClose()}
                className="min-h-[44px]"
              >
                Close
              </Button>
            </div>
          ) : (
            <>
              <div>
                {step > 1 ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
                    className="min-h-[44px] gap-1"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
                    <span>Back</span>
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setView('welcome')}
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
                    onClick={handleNextStep}
                    className="min-h-[44px] gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4 stroke-[1.5]" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCreatePlan}
                    disabled={isGenerating}
                    className="min-h-[44px] gap-2 px-6"
                  >
                    <Sparkles className="w-4 h-4 stroke-[1.5]" />
                    <span>{isGenerating ? 'Generating Plan...' : 'Generate Plan'}</span>
                  </Button>
                )}
              </div>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}
