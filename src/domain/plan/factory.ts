import type { OnboardingInput, Plan } from '@/domain/schemas/plan';
import type { Ideas } from '@/domain/schemas/ideas';
import { createDefaultBudget } from '@/domain/budget/allocation';
import { generateTimeline } from '@/domain/timeline/generate';
import { generateChecklist } from '@/domain/checklist/generate';

export function buildPlanFromInput(payload: OnboardingInput, ideas?: Ideas): Plan {
  const budget = createDefaultBudget(payload.eventType, payload.budgetMinorUnits);
  const timeline = generateTimeline(payload.eventType, payload.eventDate);
  const checklist = generateChecklist(payload.eventType);

  return {
    id: crypto.randomUUID(),
    schemaVersion: 1,
    eventType: payload.eventType,
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
      vendorQuestions: [],
      provenance: {
        source: 'demo_engine',
        timestamp: new Date().toISOString(),
        label: 'Demo engine',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isAIGenerated: true,
  };
}
