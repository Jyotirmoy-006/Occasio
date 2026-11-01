'use client';

import { useState, useEffect, useRef } from 'react';
import type { EventType } from '@/domain/schemas/plan';
import type { Currency } from '@/lib/constants';

export const DRAFT_STORAGE_KEY = 'occasio_onboarding_draft_v2';

export interface OnboardingDraftState {
  eventType: EventType;
  eventName: string;
  eventDate: string;
  guestCount: number;
  budgetDisplay: string;
  currency: Currency;
  city: string;
  style: string;
  dietaryRequirements: string[];
  culturalNeeds: string;
  selectedPriorities: string[];
}

function getStoredDraft(): OnboardingDraftState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useOnboardingDraft(view: 'welcome' | 'wizard') {
  const isDirtyRef = useRef(false);
  const [draft] = useState(() => getStoredDraft());

  const [eventType, setEventType] = useState<EventType>(() => draft?.eventType || 'wedding');
  const [eventName, setEventName] = useState<string>(() => draft?.eventName || '');
  const [eventDate, setEventDate] = useState<string>(() => draft?.eventDate || '');
  const [guestCount, setGuestCount] = useState<number>(() => draft?.guestCount || 100);
  const [budgetDisplay, setBudgetDisplay] = useState<string>(() => draft?.budgetDisplay || '25,000');
  const [currency, setCurrency] = useState<Currency>(() => draft?.currency || 'USD');
  const [city, setCity] = useState<string>(() => draft?.city || '');
  const [style, setStyle] = useState<string>(() => draft?.style || '');
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>(
    () => draft?.dietaryRequirements || [],
  );
  const [culturalNeeds, setCulturalNeeds] = useState<string>(() => draft?.culturalNeeds || '');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(
    () => draft?.selectedPriorities || ['Venue & Ceremony', 'Catering & Bar'],
  );

  useEffect(() => {
    if (view === 'wizard' && (eventName || city || style || eventDate)) {
      isDirtyRef.current = true;
      const currentDraft: OnboardingDraftState = {
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
        // Safe quota ignore
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

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
  };

  return {
    isDirtyRef,
    clearDraft,
    eventType,
    setEventType,
    eventName,
    setEventName,
    eventDate,
    setEventDate,
    guestCount,
    setGuestCount,
    budgetDisplay,
    setBudgetDisplay,
    currency,
    setCurrency,
    city,
    setCity,
    style,
    setStyle,
    dietaryRequirements,
    setDietaryRequirements,
    culturalNeeds,
    setCulturalNeeds,
    selectedPriorities,
    setSelectedPriorities,
  };
}
