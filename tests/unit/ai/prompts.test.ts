import { describe, it, expect } from 'vitest';
import {
  buildSystemPrompt,
  buildGenerationPrompt,
  buildCopilotSystemPrompt,
  buildCopilotPrompt,
} from '@/lib/ai/prompts';
import { getDemoPlanName } from '@/lib/ai/demo-engine';

describe('AI Prompt Templates & Responsible AI Constraints', () => {
  it('system prompt strictly forbids inventing specific vendor names, prices, or legal advice', () => {
    const systemPrompt = buildSystemPrompt();

    expect(systemPrompt).toContain('NEVER suggest or imply specific vendor names');
    expect(systemPrompt).toContain('NEVER give medical, legal, or immigration advice');
    expect(systemPrompt).toContain('All estimates are ranges');
    expect(systemPrompt).toContain('culturally inclusive');
    expect(systemPrompt).toContain('Output ONLY valid JSON');
  });

  it('buildGenerationPrompt sanitizes and delimits user inputs safely', () => {
    const prompt = buildGenerationPrompt({
      eventType: 'wedding',
      eventName: 'Our Celebration',
      eventDate: '2027-09-01',
      guestCount: 150,
      budgetMinorUnits: 3000000,
      currency: 'USD',
      city: 'Portland',
      style: 'Boho Chic <script>alert("hack")</script>',
      culturalNeeds: 'Vegetarian and GF options',
      dietaryRequirements: ['Vegetarian', 'Gluten-free'],
      priorities: ['Music', 'Food'],
    });

    expect(prompt).toContain('<user_city>Portland</user_city>');
    expect(prompt).toContain('<user_style>Boho Chic');
    expect(prompt).not.toContain('<script>');
    expect(prompt).toContain('150');
  });

  it('copilot prompts format changes and plan summaries', () => {
    const copilotSystem = buildCopilotSystemPrompt();
    expect(copilotSystem).toContain('Budget math is always done by the system code');

    const copilotUser = buildCopilotPrompt('Cut photography by $500', 'Current plan with $10k budget');
    expect(copilotUser).toContain('<user_userRequest>Cut photography by $500</user_userRequest>');
    expect(copilotUser).toContain('Current plan with $10k budget');
  });

  it('demo engine provides appropriate plan names per event type', () => {
    expect(getDemoPlanName('wedding')).toBe('Our Celebration');
    expect(getDemoPlanName('birthday')).toBe('Birthday Celebration');
    expect(getDemoPlanName('community')).toBe('Community Gathering');
  });
});
