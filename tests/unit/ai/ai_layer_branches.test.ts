import { describe, it, expect } from 'vitest';
import { generateFallbackCopilotResponse } from '@/lib/ai/client';
import { buildGenerationPrompt, buildCopilotPrompt } from '@/lib/ai/prompts';
import { getDemoIdeas } from '@/lib/ai/demo-engine';
import { IdeasSchema } from '@/domain/schemas/ideas';

describe('AI Layer Fallback & Branch Coverage', () => {
  it('covers all copilot fallback response branches', () => {
    // 1. Cut/decrease branch
    const cutResp = generateFallbackCopilotResponse('Please reduce budget by 10%');
    expect(cutResp.explanation).toContain('reducing the overall budget');
    expect(cutResp.proposedChanges[0].value).toBe(0.9);

    const decreaseResp = generateFallbackCopilotResponse('decrease total spend');
    expect(decreaseResp.proposedChanges[0].value).toBe(0.9);

    // 2. Increase branch
    const incResp = generateFallbackCopilotResponse('Please increase budget by 10%');
    expect(incResp.explanation).toContain('increasing the total budget');
    expect(incResp.proposedChanges[0].value).toBe(1.1);

    const addBudgetResp = generateFallbackCopilotResponse('add budget to catering');
    expect(addBudgetResp.proposedChanges[0].value).toBe(1.1);

    // 3. Generic custom note branch
    const customResp = generateFallbackCopilotResponse('Schedule florist consultation on Thursday');
    expect(customResp.explanation.toLowerCase()).toContain('florist consultation');
    expect(customResp.proposedChanges[0].action).toBe('set');
  });

  it('covers prompt generation branches with full and partial input fields', () => {
    // With dietary, priorities, style, cultural needs
    const fullPrompt = buildGenerationPrompt({
      eventType: 'wedding',
      eventName: 'Omitted Private Title',
      eventDate: '2027-06-15',
      guestCount: 120,
      budgetMinorUnits: 3000000,
      currency: 'USD',
      city: 'Seattle, WA',
      style: 'Minimalist Scandinavian',
      dietaryRequirements: ['Vegan', 'Gluten-free'],
      culturalNeeds: 'Traditional toasts',
      priorities: ['Photography', 'Music'],
    });

    expect(fullPrompt).toContain('Minimalist Scandinavian');
    expect(fullPrompt).toContain('Vegan, Gluten-free');
    expect(fullPrompt).toContain('Photography, Music');
    expect(fullPrompt).not.toContain('Omitted Private Title');

    // Without optional fields and invalid date
    const emptyPrompt = buildGenerationPrompt({
      eventType: 'birthday',
      eventName: 'Secret Birthday',
      eventDate: 'invalid-date-format',
      guestCount: 50,
      budgetMinorUnits: 1500000,
      currency: 'EUR',
      city: 'Paris',
      style: '',
      dietaryRequirements: [],
      culturalNeeds: '',
      priorities: [],
    });

    expect(emptyPrompt).toContain('Standard catering');
    expect(emptyPrompt).toContain('None specified');
    expect(emptyPrompt).toContain('Balanced');
    expect(emptyPrompt).toContain('Flexible lead time');
    expect(emptyPrompt).not.toContain('Secret Birthday');
  });

  it('validates demo engine ideas schemas for all event types', () => {
    for (const type of ['wedding', 'birthday', 'community'] as const) {
      const ideas = getDemoIdeas(type);
      const parsed = IdeasSchema.safeParse(ideas);
      expect(parsed.success).toBe(true);
      expect(ideas.themes.length).toBeGreaterThan(0);
      expect(ideas.colorPalettes.length).toBeGreaterThan(0);
      expect(ideas.menuIdeas.length).toBeGreaterThan(0);
      expect(ideas.dayTimeline.length).toBeGreaterThan(0);
    }
  });

  it('buildCopilotPrompt formats user query and plan summary', () => {
    const prompt = buildCopilotPrompt(
      'Can we shift venue deadline?',
      'Event: Wedding, Budget: $25,000, Milestones: Book Venue, Hire Caterer',
    );

    expect(prompt).toContain('shift venue deadline');
    expect(prompt).toContain('Book Venue');
    expect(prompt).toContain('$25,000');
  });
});
