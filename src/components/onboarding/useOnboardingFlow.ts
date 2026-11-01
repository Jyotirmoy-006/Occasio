'use client';

import { useState } from 'react';
import type { OnboardingInput, EventType } from '@/domain/schemas/plan';
import { parseInputToMinorUnits } from '@/domain/budget/format';
import { createDefaultBudget } from '@/domain/budget/allocation';
import { usePlan } from '@/lib/context/PlanContext';
import { buildPlanFromInput } from '@/domain/plan/factory';
import { validateOnboardingField } from '@/domain/plan/validate';
import { useOnboardingDraft } from './useOnboardingDraft';

export const EVENT_PRIORITIES: Record<EventType, string[]> = {
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

export type WizardStep = 1 | 2 | 3 | 4;

function checkShortLeadTime(eventDate: string): boolean {
  if (!eventDate) return false;
  const diff = new Date(eventDate).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 && days < 45;
}

export function useOnboardingFlow(onClose: () => void) {
  const { createNewPlan } = usePlan();
  const [view, setView] = useState<'welcome' | 'wizard'>('welcome');
  const [step, setStep] = useState<WizardStep>(1);

  const draftState = useOnboardingDraft(view);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0] ?? '';
  const isShortLeadTime = checkShortLeadTime(draftState.eventDate);

  const parsedBudget = parseInputToMinorUnits(draftState.budgetDisplay, draftState.currency);
  const budgetMinorUnits = parsedBudget !== null && parsedBudget > 0 ? parsedBudget : 1000000;
  const liveBudget = createDefaultBudget(draftState.eventType, budgetMinorUnits);
  const approxPerGuest = draftState.guestCount > 0 ? Math.round(budgetMinorUnits / draftState.guestCount) : 0;
  const currentPriorityOptions = EVENT_PRIORITIES[draftState.eventType];

  const handleTogglePriority = (priority: string) => {
    draftState.setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : prev.length < 5
        ? [...prev, priority]
        : prev,
    );
  };

  const handleToggleDietary = (diet: string) => {
    draftState.setDietaryRequirements((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet],
    );
  };

  const validateField = (field: string) => {
    const nextErrors = validateOnboardingField(
      field,
      {
        eventName: draftState.eventName,
        eventDate: draftState.eventDate,
        city: draftState.city,
        budgetMinorUnits,
        todayStr,
      },
      errors,
    );
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !draftState.eventName.trim()) {
      validateField('eventName');
      return;
    }
    if (step === 2 && (!validateField('eventDate') || !validateField('city'))) {
      return;
    }
    if (step === 3 && !validateField('budget')) {
      return;
    }
    setStep((s) => (s === 1 ? 2 : s === 2 ? 3 : 4));
  };

  const prevStep = () => {
    setStep((s) => (s === 4 ? 3 : s === 3 ? 2 : 1));
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const payload: OnboardingInput = {
        eventType: draftState.eventType,
        eventName: draftState.eventName.trim() || `${draftState.eventType.toUpperCase()} Celebration`,
        eventDate: draftState.eventDate,
        guestCount: draftState.guestCount,
        budgetMinorUnits,
        currency: draftState.currency,
        city: draftState.city.trim(),
        style: draftState.style.trim(),
        culturalNeeds: draftState.culturalNeeds.trim(),
        dietaryRequirements: draftState.dietaryRequirements,
        priorities: draftState.selectedPriorities,
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

      const newPlan = buildPlanFromInput(payload, ideas);
      createNewPlan(newPlan);
      draftState.clearDraft();
      onClose();
    } catch (err) {
      console.error('Plan generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    view,
    setView,
    step,
    setStep,
    nextStep,
    prevStep,
    ...draftState,
    errors,
    validateField,
    isGenerating,
    showPrivacyDetails,
    setShowPrivacyDetails,
    todayStr,
    isShortLeadTime,
    liveBudget,
    approxPerGuest,
    currentPriorityOptions,
    handleTogglePriority,
    handleToggleDietary,
    handleCreatePlan,
  };
}
