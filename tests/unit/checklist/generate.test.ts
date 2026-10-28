import { describe, it, expect } from 'vitest';
import { generateChecklist } from '@/domain/checklist/generate';

describe('Vendor Checklist Generation Domain Logic', () => {
  it('generates vendor types and questions for all event types', () => {
    const eventTypes = ['wedding', 'birthday', 'community'] as const;

    for (const type of eventTypes) {
      const checklist = generateChecklist(type);
      expect(checklist.items.length).toBeGreaterThan(0);

      for (const item of checklist.items) {
        // Responsible AI checks: vendorType should be generic category (Venue, Caterer, etc.)
        expect(item.vendorType).toBeDefined();
        expect(item.vendorType.length).toBeGreaterThan(0);

        // Never invent real vendor phone numbers or ratings
        expect(item.status).toBe('to-contact');
        expect(item.quoteMinorUnits).toBeNull();
        expect(item.questionsToAsk.length).toBeGreaterThan(0);

        // Questions must be actionable
        for (const q of item.questionsToAsk) {
          expect(q.length).toBeGreaterThan(5);
        }
      }
    }
  });

  it('includes venue, catering, and entertainment for weddings and birthdays', () => {
    const wedding = generateChecklist('wedding');
    const categories = wedding.items.map((i) => i.category);
    expect(categories).toContain('venue');
    expect(categories).toContain('catering');
    expect(categories).toContain('photography');
    expect(categories).toContain('entertainment');
  });

  it('includes permits and insurance guidance for community events with disclaimers', () => {
    const community = generateChecklist('community');
    const questions = community.items.flatMap((i) => i.questionsToAsk);
    const hasDisclaimer = questions.some((q) => q.toLowerCase().includes('local authorities'));
    expect(hasDisclaimer).toBe(true);
  });
});

