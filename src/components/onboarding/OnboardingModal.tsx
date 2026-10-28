'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import {
  type OnboardingInput,
  type EventType,
  DIETARY_CHIPS,
  AI_PAYLOAD_EXACT_FIELDS,
} from '@/domain/schemas/plan';
import { parseInputToMinorUnits } from '@/domain/budget/format';
import { createDefaultBudget } from '@/domain/budget/allocation';
import { generateTimeline } from '@/domain/timeline/generate';
import { generateChecklist } from '@/domain/checklist/generate';
import { formatMoney, formatEventDate, SUPPORTED_CURRENCIES } from '@/lib/format';
import type { Currency } from '@/lib/constants';
import { WeddingMotif, BirthdayMotif, CommunityMotif } from '@/components/icons/EventMotifs';
import { SAMPLE_PLANS } from '@/domain/sample-plans';
import { Button } from '@/components/ui/Button';
import { X, ChevronLeft, ChevronRight, Check, Sparkles, Shield, AlertTriangle, Info } from 'lucide-react';

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

  // Priority options per event type
  const eventPriorities: Record<EventType, string[]> = {
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

  const currentPriorityOptions = eventPriorities[eventType];

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
            /* Welcome Screen with Start From Scratch and 3 Sample Plans */
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
                  onClick={() => setView('wizard')}
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
                    onClick={() => handleSelectSample('wedding')}
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
                    onClick={() => handleSelectSample('birthday')}
                    className="p-4 rounded-lg bg-surface hover:bg-surface-raised border border-border text-left transition-all cursor-pointer group space-y-2"
                  >
                    <div className="w-8 h-8 rounded bg-[#9C411E]/10 text-[#9C411E] flex items-center justify-center">
                      <BirthdayMotif className="w-5 h-5" />
                    </div>
                    <h5 className="font-serif text-sm font-bold text-ink group-hover:text-[var(--color-accent)]">
                      {SAMPLE_PLANS.birthday.eventName}
                    </h5>
                    <p className="text-[12px] text-ink-muted">
                      50 guests · $8,000 · Chicago, IL
                    </p>
                  </button>

                  {/* Community Sample */}
                  <button
                    onClick={() => handleSelectSample('community')}
                    className="p-4 rounded-lg bg-surface hover:bg-surface-raised border border-border text-left transition-all cursor-pointer group space-y-2"
                  >
                    <div className="w-8 h-8 rounded bg-[#165359]/10 text-[#165359] flex items-center justify-center">
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
          ) : (
            /* 4-Step Wizard Container */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left Progress Rail */}
              <aside className="md:col-span-3 hairline-r md:pr-6 space-y-3" aria-label="Wizard Steps">
                <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
                  Steps
                </span>

                <ol className="space-y-2 text-sm font-medium">
                  {[
                    { s: 1, title: 'Event & Name' },
                    { s: 2, title: 'Date & Location' },
                    { s: 3, title: 'Budget Allocation' },
                    { s: 4, title: 'Style & Review' },
                  ].map(({ s, title }) => (
                    <li key={s}>
                      <button
                        onClick={() => {
                          if (s < step) setStep(s as 1 | 2 | 3 | 4);
                        }}
                        disabled={s > step}
                        className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2.5 transition-colors ${
                          step === s
                            ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-semibold'
                            : s < step
                            ? 'text-ink hover:bg-surface cursor-pointer'
                            : 'text-ink-muted/50 cursor-not-allowed'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center tabular-nums ${
                            step === s
                              ? 'bg-[var(--color-accent)] text-paper'
                              : s < step
                              ? 'bg-border text-ink'
                              : 'border border-border text-ink-muted'
                          }`}
                        >
                          {s < step ? <Check className="w-3 h-3 stroke-[2]" /> : s}
                        </span>
                        <span className="text-[13px]">{title}</span>
                      </button>
                    </li>
                  ))}
                </ol>

                {/* Asterisk Legend */}
                <p className="text-[11px] text-ink-muted pt-4 hairline-t">
                  <span className="text-red-700 font-bold">*</span> indicates required field
                </p>
              </aside>

              {/* Main Wizard Form Content */}
              <div className="md:col-span-9">
                {/* STEP 1: Event Type & Name */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block font-serif text-lg font-bold text-ink mb-1">
                        Select Event Type <span className="text-red-700">*</span>
                      </label>
                      <p className="text-xs text-ink-muted mb-4">
                        Sets domain categories, milestone timelines, and tailored checklist guides.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { type: 'wedding' as const, label: 'Wedding', motif: <WeddingMotif className="w-6 h-6" /> },
                          { type: 'birthday' as const, label: 'Birthday', motif: <BirthdayMotif className="w-6 h-6" /> },
                          { type: 'community' as const, label: 'Community', motif: <CommunityMotif className="w-6 h-6" /> },
                        ].map((item) => (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => setEventType(item.type)}
                            className={`p-4 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[110px] ${
                              eventType === item.type
                                ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] shadow-xs'
                                : 'border-border bg-paper hover:bg-surface'
                            }`}
                          >
                            <span className={eventType === item.type ? 'text-[var(--color-accent)]' : 'text-ink-subtle'}>
                              {item.motif}
                            </span>
                            <span className="font-serif text-base font-semibold text-ink">
                              {item.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="field-event-name" className="block text-sm font-semibold text-ink mb-1">
                        Event Title / Name <span className="text-red-700">*</span>
                      </label>
                      <input
                        id="field-event-name"
                        type="text"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        onBlur={() => validateField('eventName')}
                        placeholder="e.g. Maya’s 30th Birthday or Harvest Festival 2027"
                        aria-required="true"
                        aria-invalid={!!errors.eventName}
                        aria-describedby={errors.eventName ? 'err-event-name' : undefined}
                        className={`w-full px-3.5 py-2.5 rounded-md border text-sm bg-paper text-ink transition-colors ${
                          errors.eventName ? 'border-red-600 focus:ring-red-600' : 'border-border focus:border-[var(--color-accent)]'
                        }`}
                      />
                      {errors.eventName && (
                        <p id="err-event-name" className="text-xs text-red-700 mt-1" role="alert">
                          {errors.eventName}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2: Date & Location */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="field-event-date" className="block text-sm font-semibold text-ink mb-1">
                        Event Date <span className="text-red-700">*</span>
                      </label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <input
                          id="field-event-date"
                          type="date"
                          min={todayStr}
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          onBlur={() => validateField('eventDate')}
                          aria-required="true"
                          aria-invalid={!!errors.eventDate}
                          aria-describedby={errors.eventDate ? 'err-event-date' : undefined}
                          className="px-3.5 py-2.5 rounded-md border border-border text-sm bg-paper text-ink focus:border-[var(--color-accent)]"
                        />
                        {eventDate && (
                          <span className="text-sm text-ink font-medium">
                            {formatEventDate(eventDate, { includeRelative: true })}
                          </span>
                        )}
                      </div>

                      {errors.eventDate && (
                        <p id="err-event-date" className="text-xs text-red-700 mt-1" role="alert">
                          {errors.eventDate}
                        </p>
                      )}

                      {/* Short Lead Time Warning Notice */}
                      {isShortLeadTime && (
                        <div className="mt-3 p-3 rounded-md bg-[#FEF3E2] border border-[#8A4500]/30 flex items-start gap-2.5 text-xs text-[#8A4500]">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            <strong>Short lead time:</strong> we’ll compress the timeline and prioritize urgent vendor bookings.
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Guest Count Stepper */}
                      <div>
                        <label htmlFor="field-guest-count" className="block text-sm font-semibold text-ink mb-1">
                          Estimated Guest Count <span className="text-red-700">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setGuestCount((g) => Math.max(1, g - 10))}
                            className="w-10 h-10 rounded-md border border-border bg-surface text-ink font-bold hover:bg-surface-raised cursor-pointer flex items-center justify-center"
                            aria-label="Decrease guest count by 10"
                          >
                            -
                          </button>
                          <input
                            id="field-guest-count"
                            aria-label="Estimated Guest Count"
                            type="number"
                            min="1"
                            max="5000"
                            value={guestCount}
                            onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-24 text-center py-2 rounded-md border border-border text-sm tabular-nums bg-paper text-ink font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => setGuestCount((g) => Math.min(5000, g + 10))}
                            className="w-10 h-10 rounded-md border border-border bg-surface text-ink font-bold hover:bg-surface-raised cursor-pointer flex items-center justify-center"
                            aria-label="Increase guest count by 10"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* City/Region */}
                      <div>
                        <label htmlFor="field-city" className="block text-sm font-semibold text-ink mb-1">
                          City / Region <span className="text-red-700">*</span>
                        </label>
                        <input
                          id="field-city"
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          onBlur={() => validateField('city')}
                          placeholder="e.g. Seattle, WA or London, UK"
                          aria-required="true"
                          aria-invalid={!!errors.city}
                          aria-describedby={errors.city ? 'err-city' : undefined}
                          className="w-full px-3.5 py-2.5 rounded-md border border-border text-sm bg-paper text-ink focus:border-[var(--color-accent)]"
                        />
                        {errors.city && (
                          <p id="err-city" className="text-xs text-red-700 mt-1" role="alert">
                            {errors.city}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Budget & Live Allocation Donut */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Currency selector */}
                      <div>
                        <label htmlFor="field-currency" className="block text-sm font-semibold text-ink mb-1">
                          Currency
                        </label>
                        <select
                          id="field-currency"
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-md border border-border text-sm bg-paper text-ink cursor-pointer focus:border-[var(--color-accent)]"
                        >
                          {SUPPORTED_CURRENCIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Total Budget Input */}
                      <div>
                        <label htmlFor="field-budget" className="block text-sm font-semibold text-ink mb-1">
                          Total Budget <span className="text-red-700">*</span>
                        </label>
                        <input
                          id="field-budget"
                          inputMode="numeric"
                          type="text"
                          value={budgetDisplay}
                          onChange={(e) => setBudgetDisplay(e.target.value)}
                          onBlur={() => validateField('budget')}
                          placeholder="25,000"
                          aria-required="true"
                          aria-invalid={!!errors.budget}
                          aria-describedby={errors.budget ? 'err-budget' : undefined}
                          className="w-full px-3.5 py-2.5 rounded-md border border-border text-sm tabular-nums font-semibold bg-paper text-ink focus:border-[var(--color-accent)]"
                        />
                        {errors.budget && (
                          <p id="err-budget" className="text-xs text-red-700 mt-1" role="alert">
                            {errors.budget}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Live Metric: Approx Per Guest */}
                    <div className="p-3 rounded-md bg-surface border border-border flex items-center justify-between text-xs">
                      <span className="text-ink-muted">Approximate budget per guest:</span>
                      <span className="font-bold tabular-nums text-ink text-sm">
                        {formatMoney(approxPerGuest, currency)}
                      </span>
                    </div>

                    {/* Live Deterministic Allocation Donut Preview */}
                    <div className="p-4 rounded-lg bg-surface border border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-ink uppercase tracking-wide">
                          Live Category Allocation Preview
                        </span>
                        <span className="text-[11px] text-ink-muted">
                          (Math computed in pure code)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {liveBudget.categories.slice(0, 6).map((cat) => (
                          <div key={cat.id} className="p-2 rounded bg-paper border border-border text-xs">
                            <span className="text-ink-muted block truncate">{cat.label}</span>
                            <span className="font-bold tabular-nums text-ink">
                              {formatMoney(cat.allocatedMinorUnits, currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Style, Dietary, Priorities & Review */}
                {step === 4 && (
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
                              onClick={() => handleToggleDietary(chip)}
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
                        {currentPriorityOptions.map((priority) => {
                          const isSelected = selectedPriorities.includes(priority);
                          const isDisabled = !isSelected && selectedPriorities.length >= 5;

                          return (
                            <button
                              key={priority}
                              type="button"
                              onClick={() => handleTogglePriority(priority)}
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

                    {/* Privacy Transparency Dropdown (Requirement E) */}
                    <div className="p-4 rounded-lg bg-surface border border-border space-y-2">
                      <div className="flex items-start gap-2.5 text-xs text-ink">
                        <Shield className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Private & Local-First</p>
                          <p className="text-ink-muted text-[12px]">
                            Saved only on this device. When AI is on, these details are sent to Gemini to create your plan ideas.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowPrivacyDetails((prev) => !prev)}
                        className="text-[12px] font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
                        {showPrivacyDetails ? 'Hide transmission details' : 'Exactly what is sent'}
                      </button>

                      {showPrivacyDetails && (
                        <div className="pt-2 hairline-t text-[11px] text-ink-muted space-y-1">
                          <p className="font-semibold text-ink">Transmitted Fields (Single Source of Truth):</p>
                          <ul className="list-disc list-inside space-y-0.5">
                            {AI_PAYLOAD_EXACT_FIELDS.map((f) => (
                              <li key={f.field}>
                                <strong>{f.label}:</strong> {f.description}
                              </li>
                            ))}
                          </ul>
                          <p className="text-[10px] text-ink-muted italic pt-1">
                            * Notice: Event name, personal names, phone numbers, and emails are strictly excluded.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
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
