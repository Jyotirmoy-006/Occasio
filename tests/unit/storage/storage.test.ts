import { describe, it, expect, beforeEach } from 'vitest';
import { savePlan, loadPlan, loadAllPlans, deletePlan, exportPlanJSON, importPlanJSON } from '@/lib/storage/index';
import { createDefaultBudget } from '@/domain/budget/allocation';
import { generateTimeline } from '@/domain/timeline/generate';
import { generateChecklist } from '@/domain/checklist/generate';
import { getDemoIdeas } from '@/lib/ai/demo-engine';
import type { Plan } from '@/domain/schemas/plan';

describe('Storage and Serialization (localStorage)', () => {
  const samplePlan: Plan = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    schemaVersion: 1,
    eventType: 'wedding',
    eventName: 'Sample Wedding',
    eventDate: '2027-08-15',
    guestCount: 120,
    budgetMinorUnits: 2500000,
    currency: 'USD',
    city: 'Seattle',
    style: 'Modern Minimalist',
    culturalNeeds: 'Vegetarian and Halal friendly',
    priorities: ['Photography', 'Great food'],
    budget: createDefaultBudget('wedding', 2500000),
    timeline: generateTimeline('wedding', '2027-08-15'),
    checklist: generateChecklist('wedding'),
    ideas: getDemoIdeas('wedding'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isAIGenerated: false,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads a valid plan', () => {
    const saved = savePlan(samplePlan);
    expect(saved).toBe(true);

    const loaded = loadPlan(samplePlan.id);
    expect(loaded).not.toBeNull();
    expect(loaded?.id).toBe(samplePlan.id);
    expect(loaded?.eventName).toBe(samplePlan.eventName);
    expect(loaded?.budget.totalMinorUnits).toBe(samplePlan.budget.totalMinorUnits);
  });

  it('lists all saved plans in index', () => {
    savePlan(samplePlan);
    const all = loadAllPlans();
    expect(all.length).toBe(1);
    expect(all[0]?.id).toBe(samplePlan.id);
  });

  it('deletes plan by ID', () => {
    savePlan(samplePlan);
    deletePlan(samplePlan.id);
    expect(loadPlan(samplePlan.id)).toBeNull();
    expect(loadAllPlans().length).toBe(0);
  });

  it('exports and imports valid JSON round-trip', () => {
    const json = exportPlanJSON(samplePlan);
    const imported = importPlanJSON(json);
    expect(imported.id).toBe(samplePlan.id);
    expect(imported.budget.totalMinorUnits).toBe(samplePlan.budget.totalMinorUnits);
  });

  it('rejects oversized JSON import to prevent memory DOS', () => {
    const hugeString = 'a'.repeat(600 * 1024); // > 512 KB
    expect(() => importPlanJSON(hugeString)).toThrow('too large');
  });

  it('rejects malformed or invalid schema JSON', () => {
    expect(() => importPlanJSON('{ "invalid": true }')).toThrow();
  });
});
