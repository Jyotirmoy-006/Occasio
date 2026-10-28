'use client';

import React, { useState } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { OnboardingInputSchema, type OnboardingInput, type EventType } from '@/domain/schemas/plan';
import { parseInputToMinorUnits } from '@/domain/budget/format';
import { SUPPORTED_CURRENCIES, type Currency } from '@/lib/constants';
import { WeddingMotif, BirthdayMotif, CommunityMotif } from '@/components/icons/EventMotifs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Sparkles, Shield, Check } from 'lucide-react';

export function OnboardingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { createNewPlan, isDemoMode } = usePlan();

  // Form State
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState<number>(100);
  const [budgetDisplay, setBudgetDisplay] = useState('25,000');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [city, setCity] = useState('');
  const [style, setStyle] = useState('');
  const [culturalNeeds, setCulturalNeeds] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(['Venue', 'Catering & Bar']);

  // Validation Errors & Generation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  if (!isOpen) return null;

  const priorityOptions = [
    'Venue',
    'Catering & Bar',
    'Photography & Video',
    'Music & Entertainment',
    'Florals & Decor',
    'Attire & Styling',
    'Guest Experience & Favors',
  ];

  const handleTogglePriority = (priority: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : prev.length < 5
        ? [...prev, priority]
        : prev,
    );
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Parse budget to minor units
    const parsedMinor = parseInputToMinorUnits(budgetDisplay, currency);
    if (parsedMinor === null || parsedMinor <= 0) {
      setErrors({ budget: 'Please enter a valid budget amount.' });
      return;
    }

    const inputData: OnboardingInput = {
      eventType,
      eventName: eventName.trim() || `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} Celebration`,
      eventDate,
      guestCount: Number(guestCount),
      budgetMinorUnits: parsedMinor,
      currency,
      city: city.trim(),
      style: style.trim(),
      culturalNeeds: culturalNeeds.trim(),
      priorities: selectedPriorities,
    };

    // Inline Zod Validation
    const validation = OnboardingInputSchema.safeParse(inputData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const fieldName = issue.path[0]?.toString() || 'general';
        fieldErrors[fieldName] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    // Call Generation API with Progress Animation
    setIsGenerating(true);
    setGenerationStep('Calculating integer budget allocations and category weights...');

    try {
      const stepTimer1 = setTimeout(() => {
        setGenerationStep('Backward-planning milestone roadmap from your event date...');
      }, 700);

      const stepTimer2 = setTimeout(() => {
        setGenerationStep('Synthesizing creative themes and contrast-checked palettes...');
      }, 1400);

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.data),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!res.ok) {
        throw new Error('Plan generation failed');
      }

      const data = await res.json();
      createNewPlan(data.plan);
      onClose();
    } catch {
      setErrors({ general: 'Could not generate plan. Please verify your connection.' });
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
    >
      <Card className="w-full max-w-2xl bg-paper border border-border shadow-2xl p-6 sm:p-8 my-8 text-left animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4 mb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)] font-semibold">
              New Occasio Project
            </span>
            <h2 id="onboarding-modal-title" className="text-2xl sm:text-3xl font-serif text-ink mt-1">
              Guided Event Architect
            </h2>
            <p className="text-xs text-ink-muted mt-1">
              Deterministic financial rules and backward-planned timelines meet Gemini creative synthesis.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ink-muted hover:text-ink rounded min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Responsible AI Privacy Guarantee Banner */}
        <div className="mb-6 p-3.5 rounded-md bg-surface border border-border flex items-start gap-3">
          <Shield className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
          <div className="text-[11px] text-ink-muted leading-relaxed">
            <strong className="text-ink">Privacy Guarantee:</strong> Occasio never asks for or stores guest names, phone
            numbers, or personal emails. All event planning data remains stored locally on your device.
          </div>
        </div>

        {isGenerating ? (
          /* Animated Generation Skeleton State */
          <div className="py-16 text-center space-y-6 animate-pulse" aria-live="polite">
            <div className="w-16 h-16 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent)] flex items-center justify-center mx-auto text-[var(--color-accent)]">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-ink font-semibold">Architecting Your Event Plan</h3>
              <p className="text-xs font-mono text-ink-muted mt-2">{generationStep}</p>
            </div>
            <div className="max-w-md mx-auto h-2 bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-accent)] w-3/4 animate-pulse rounded-full" />
            </div>
          </div>
        ) : (
          /* Guided Multi-Step Form */
          <form onSubmit={handleCreatePlan} className="space-y-6">
            {errors.general && (
              <div className="p-3 bg-error-bg text-error text-xs rounded-md font-medium" role="alert">
                {errors.general}
              </div>
            )}

            {/* 1. Event Type Selection with Custom SVGs */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink block mb-2">
                1. Select Event Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Event type">
                {[
                  { id: 'wedding', label: 'Wedding', desc: 'Romance & Ceremony', icon: <WeddingMotif className="w-6 h-6" /> },
                  { id: 'birthday', label: 'Birthday', desc: 'Milestones & Partying', icon: <BirthdayMotif className="w-6 h-6" /> },
                  { id: 'community', label: 'Community', desc: 'Gatherings & Festivals', icon: <CommunityMotif className="w-6 h-6" /> },
                ].map((item) => {
                  const isSelected = eventType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setEventType(item.id as EventType)}
                      className={`p-4 rounded-lg border text-left flex flex-col justify-between min-h-[90px] transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-ink ring-1 ring-[var(--color-accent)]'
                          : 'border-border bg-paper hover:bg-surface text-ink-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={isSelected ? 'text-[var(--color-accent)]' : 'text-ink-muted'}>
                          {item.icon}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[var(--color-accent)]" />}
                      </div>
                      <div className="mt-2">
                        <span className="font-serif font-semibold text-sm text-ink block">{item.label}</span>
                        <span className="text-[11px] text-ink-muted">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Core Logistics: Name, Date, Guest Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Event Name"
                placeholder="e.g. Maya & Leo’s Solstice Wedding"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                error={errors.eventName}
                required
              />

              <Input
                label="Target Event Date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                error={errors.eventDate}
                hint="Used for backward-planning milestones"
                required
              />
            </div>

            {/* 3. Budget & Currency & Guests */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Input
                    label="Total Budget"
                    placeholder="25,000"
                    value={budgetDisplay}
                    onChange={(e) => setBudgetDisplay(e.target.value)}
                    error={errors.budget}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink block mb-1.5">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    aria-label="Select Currency"
                    className="w-full min-h-[44px] px-3 py-2 bg-paper border border-border rounded-md text-sm text-ink focus:outline-none focus:border-[var(--color-accent)]"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="Guest Count"
                type="number"
                min="1"
                max="10000"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                error={errors.guestCount}
                required
              />
            </div>

            {/* 4. Location & Aesthetic Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="City / Region"
                placeholder="e.g. Kyoto, Japan or Aspen, Colorado"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                error={errors.city}
                required
              />

              <Input
                label="Style / Vibe"
                placeholder="e.g. Minimalist Wabi-Sabi, Editorial Romance"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                hint="Guides theme and color palette generation"
              />
            </div>

            {/* 5. Cultural, Dietary, or Accessibility Requirements */}
            <Input
              label="Cultural, Dietary & Accessibility Inclusions"
              placeholder="e.g. Vegetarian/Halal menu, wheelchair accessible venue, bilingual signage"
              value={culturalNeeds}
              onChange={(e) => setCulturalNeeds(e.target.value)}
              hint="We respect all traditions and ensure no default assumptions are made."
            />

            {/* 6. Priority Checkboxes */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink block mb-2">
                Top Priorities (Up to 5)
              </label>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map((opt) => {
                  const isChecked = selectedPriorities.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleTogglePriority(opt)}
                      className={`text-xs px-3 py-2 rounded-full border transition-colors cursor-pointer select-none ${
                        isChecked
                          ? 'bg-ink text-paper border-ink font-medium'
                          : 'bg-paper text-ink-muted border-border hover:bg-surface'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs font-mono text-ink-muted">
                {isDemoMode ? '⚡ Demo Mode Active' : '✨ Gemini Flash AI'}
              </span>
              <div className="flex items-center gap-3">
                <Button variant="secondary" type="button" onClick={onClose} className="min-h-[44px]">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="gap-2 min-h-[44px]">
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Complete Plan</span>
                </Button>
              </div>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
