import { describe, it, expect } from 'vitest';
import { buildGenerationPrompt } from '@/lib/ai/prompts';
import { AI_PAYLOAD_EXACT_FIELDS } from '@/domain/schemas/plan';
import type { OnboardingInput } from '@/domain/schemas/plan';

describe('AI Payload Privacy & Data Minimization (Requirement E)', () => {
  const mockInput: OnboardingInput = {
    eventType: 'wedding',
    eventName: 'Confidential Secret Wedding of John and Jane Doe',
    eventDate: '2027-06-15',
    guestCount: 150,
    budgetMinorUnits: 2500000,
    currency: 'USD',
    city: 'Seattle, WA',
    style: 'Modern Botanical Elegance',
    culturalNeeds: 'Vegetarian family options',
    dietaryRequirements: ['Vegetarian', 'Gluten-free'],
    priorities: ['Photography', 'Catering'],
  };

  it('strictly excludes the event name from the AI payload prompt', () => {
    const prompt = buildGenerationPrompt(mockInput);

    // Assert that the private event name is nowhere in the prompt
    expect(prompt).not.toContain('Confidential Secret Wedding');
    expect(prompt).not.toContain('John');
    expect(prompt).not.toContain('Jane Doe');
  });

  it('only transmits allowed non-personal event planning parameters', () => {
    const prompt = buildGenerationPrompt(mockInput);

    // Allowed functional parameters are present
    expect(prompt).toContain('wedding');
    expect(prompt).toContain('Seattle, WA');
    expect(prompt).toContain('Modern Botanical Elegance');
    expect(prompt).toContain('Vegetarian');
    expect(prompt).toContain('Photography');
    expect(prompt).toContain('USD');
  });

  it('has a defined single source of truth for all transmitted fields', () => {
    expect(AI_PAYLOAD_EXACT_FIELDS.length).toBeGreaterThanOrEqual(8);
    const fieldNames = AI_PAYLOAD_EXACT_FIELDS.map((f) => f.field);

    // Event name is NOT in the transmitted fields
    expect(fieldNames).not.toContain('eventName');
    expect(fieldNames).toContain('eventType');
    expect(fieldNames).toContain('leadTimeDays');
    expect(fieldNames).toContain('dietaryRequirements');
  });
});

