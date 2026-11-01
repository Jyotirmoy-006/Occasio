'use client';

import React from 'react';
import type { useOnboardingFlow } from './useOnboardingFlow';
import { StepEventDetails } from './StepEventDetails';
import { StepDateLocation } from './StepDateLocation';
import { StepBudgetGuests } from './StepBudgetGuests';
import { StepPriorities } from './StepPriorities';
import { isCurrency } from '@/lib/constants';

interface OnboardingStepContentProps {
  flow: ReturnType<typeof useOnboardingFlow>;
}

export function OnboardingStepContent({ flow }: OnboardingStepContentProps) {
  switch (flow.step) {
    case 1:
      return (
        <StepEventDetails
          eventType={flow.eventType}
          setEventType={flow.setEventType}
          eventName={flow.eventName}
          setEventName={flow.setEventName}
          error={flow.errors.eventName}
          onBlur={() => flow.validateField('eventName')}
        />
      );
    case 2:
      return (
        <StepDateLocation
          eventDate={flow.eventDate}
          setEventDate={flow.setEventDate}
          city={flow.city}
          setCity={flow.setCity}
          guestCount={flow.guestCount}
          setGuestCount={flow.setGuestCount}
          isShortLeadTime={flow.isShortLeadTime}
          todayStr={flow.todayStr}
          errors={flow.errors}
          onBlurDate={() => flow.validateField('eventDate')}
          onBlurCity={() => flow.validateField('city')}
        />
      );
    case 3:
      return (
        <StepBudgetGuests
          currency={flow.currency}
          setCurrency={(c: string) => {
            if (isCurrency(c)) flow.setCurrency(c);
          }}
          budgetDisplay={flow.budgetDisplay}
          setBudgetDisplay={flow.setBudgetDisplay}
          approxPerGuest={flow.approxPerGuest}
          liveBudget={flow.liveBudget}
          error={flow.errors.budget}
          onBlurBudget={() => flow.validateField('budget')}
        />
      );
    case 4:
      return (
        <StepPriorities
          style={flow.style}
          setStyle={flow.setStyle}
          dietaryRequirements={flow.dietaryRequirements}
          onToggleDietary={flow.handleToggleDietary}
          culturalNeeds={flow.culturalNeeds}
          setCulturalNeeds={flow.setCulturalNeeds}
          priorityOptions={flow.currentPriorityOptions}
          selectedPriorities={flow.selectedPriorities}
          onTogglePriority={flow.handleTogglePriority}
          showPrivacyDetails={flow.showPrivacyDetails}
          setShowPrivacyDetails={flow.setShowPrivacyDetails}
        />
      );
    default:
      return null;
  }
}
