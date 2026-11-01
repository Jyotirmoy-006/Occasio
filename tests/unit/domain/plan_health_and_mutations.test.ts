import { describe, it, expect } from 'vitest';
import { SAMPLE_PLANS } from '@/domain/sample-plans';
import {
  computePlanHealthAlerts,
  groupMilestonesByPhase,
  computeDonutSegments,
  getProvenanceLabel,
} from '@/domain/plan/health';
import { buildPlanFromInput } from '@/domain/plan/factory';
import { validateOnboardingField } from '@/domain/plan/validate';
import {
  toggleIdeaPin,
  toggleIdeaDismiss,
  replaceIdeaContent,
  getRandomAlternative,
  ALTERNATIVE_PROMPTS,
} from '@/domain/ideas/mutate';

describe('Domain Plan Health & Advisory', () => {
  it('computes all-clear health alerts when plan is healthy', () => {
    const plan = JSON.parse(JSON.stringify(SAMPLE_PLANS.wedding));
    // Set all milestones to future dates
    plan.timeline.milestones = plan.timeline.milestones.map((m: any) => ({
      ...m,
      dueDate: '2028-01-01',
      status: 'pending',
    }));
    // Book venue
    const venue = plan.checklist.items.find((c: any) => c.vendorType.toLowerCase().includes('venue'));
    if (venue) venue.status = 'booked';

    const alerts = computePlanHealthAlerts(plan, 120, '2027-01-01');
    expect(alerts.length).toBe(1);
    expect(alerts[0]!.type).toBe('success');
    expect(alerts[0]!.id).toBe('all-clear');
  });

  it('detects overdue milestones, unbooked venue <=60 days, and budget warnings', () => {
    const plan = JSON.parse(JSON.stringify(SAMPLE_PLANS.wedding));
    // Set overdue milestone
    plan.timeline.milestones[0].dueDate = '2026-01-01';
    plan.timeline.milestones[0].status = 'pending';

    // Unbooked venue
    const venue = plan.checklist.items.find((c: any) => c.vendorType.toLowerCase().includes('venue'));
    if (venue) venue.status = 'to-contact';

    // Committed spend >= 90%
    plan.budget.categories[0].actualMinorUnits = plan.budgetMinorUnits;

    // Catering pending <=45 days
    const catering = plan.checklist.items.find((c: any) => c.vendorType.toLowerCase().includes('catering'));
    if (catering) catering.status = 'to-contact';

    const alerts = computePlanHealthAlerts(plan, 40, '2026-06-01');
    const ids = alerts.map((a) => a.id);
    expect(ids).toContain('overdue-milestones');
    expect(ids).toContain('venue-unbooked');
    expect(ids).toContain('budget-warning');
    expect(ids).toContain('catering-warning');
  });

  it('handles 0 budget gracefully in health calculation', () => {
    const plan = JSON.parse(JSON.stringify(SAMPLE_PLANS.wedding));
    plan.budgetMinorUnits = 0;
    const alerts = computePlanHealthAlerts(plan, 100, '2026-01-01');
    expect(alerts.length).toBeGreaterThan(0);
  });

  it('groups milestones by phase correctly', () => {
    const plan = SAMPLE_PLANS.wedding;
    const grouped = groupMilestonesByPhase(plan.timeline.milestones);
    expect(Object.keys(grouped).length).toBeGreaterThan(0);
  });

  it('computes donut segments with and without overflow', () => {
    const plan = JSON.parse(JSON.stringify(SAMPLE_PLANS.wedding));
    const segments = computeDonutSegments(plan);
    expect(segments.length).toBeGreaterThan(0);
    expect(segments[0]!.percent).toBeGreaterThan(0);

    // Test with 0 total budget
    plan.budgetMinorUnits = 0;
    const zeroSegments = computeDonutSegments(plan);
    expect(zeroSegments[0]!.percent).toBe(0);
  });

  it('returns appropriate provenance labels', () => {
    const plan = JSON.parse(JSON.stringify(SAMPLE_PLANS.wedding));
    plan.ideas.provenance = { source: 'demo_engine', label: 'Demo engine', timestamp: '' };
    expect(getProvenanceLabel(plan)).toBe('Demo engine');

    plan.isAIGenerated = true;
    plan.ideas.provenance = { source: 'gemini', modelId: 'gemini-3.5-flash-lite', label: 'AI', timestamp: '' };
    expect(getProvenanceLabel(plan)).toContain('gemini-3.5-flash-lite');

    plan.isAIGenerated = false;
    plan.ideas.provenance = { source: 'user_edited', label: 'User', timestamp: '' };
    expect(getProvenanceLabel(plan)).toBe('Edited by you');

    plan.ideas.provenance = undefined;
    expect(getProvenanceLabel(plan)).toBe('Sample plan');
  });
});

describe('Domain Plan Factory & Validation', () => {
  it('builds plan from onboarding input', () => {
    const input = {
      eventType: 'wedding' as const,
      eventName: 'Summer Solstice Wedding',
      eventDate: '2028-06-21',
      guestCount: 100,
      budgetMinorUnits: 2500000,
      currency: 'USD' as const,
      city: 'San Francisco, CA',
      style: 'Minimalist',
      dietaryRequirements: ['Vegetarian'],
      culturalNeeds: 'None',
      priorities: ['Venue', 'Catering'],
    };

    const plan = buildPlanFromInput(input);
    expect(plan.eventName).toBe('Summer Solstice Wedding');
    expect(plan.budget.categories.length).toBeGreaterThan(0);
    expect(plan.timeline.milestones.length).toBeGreaterThan(0);
    expect(plan.checklist.items.length).toBeGreaterThan(0);
    expect(plan.ideas.themes).toEqual([]);
  });

  it('validates onboarding fields progressively', () => {
    const values = {
      eventName: '',
      eventDate: '',
      city: '',
      budgetMinorUnits: 0,
      todayStr: '2026-11-01',
    };

    let errors = validateOnboardingField('eventName', values, {});
    expect(errors.eventName).toBe('Event name is required');

    errors = validateOnboardingField('eventName', { ...values, eventName: 'Valid Name' }, errors);
    expect(errors.eventName).toBeUndefined();

    errors = validateOnboardingField('eventDate', values, errors);
    expect(errors.eventDate).toBe('Event date is required');

    errors = validateOnboardingField('eventDate', { ...values, eventDate: '2025-01-01' }, errors);
    expect(errors.eventDate).toBe('Date must be in the future');

    errors = validateOnboardingField('eventDate', { ...values, eventDate: '2028-01-01' }, errors);
    expect(errors.eventDate).toBeUndefined();

    errors = validateOnboardingField('city', values, errors);
    expect(errors.city).toBe('City or region is required');

    errors = validateOnboardingField('city', { ...values, city: 'London' }, errors);
    expect(errors.city).toBeUndefined();

    errors = validateOnboardingField('budget', values, errors);
    expect(errors.budget).toBe('Please enter a valid budget amount');

    errors = validateOnboardingField('budget', { ...values, budgetMinorUnits: 500000 }, errors);
    expect(errors.budget).toBeUndefined();
  });
});

describe('Domain Ideas Mutations', () => {
  it('pins and unpins ideas and palettes', () => {
    let ideas = JSON.parse(JSON.stringify(SAMPLE_PLANS.wedding.ideas));
    const firstThemeId = ideas.themes[0].id;
    ideas = toggleIdeaPin(ideas, 'themes', firstThemeId);
    expect(ideas.themes[0].pinned).toBe(true);
    ideas = toggleIdeaPin(ideas, 'themes', firstThemeId);
    expect(ideas.themes[0].pinned).toBe(false);

    const firstPaletteId = ideas.colorPalettes[0].id;
    ideas = toggleIdeaPin(ideas, 'colorPalettes', firstPaletteId);
    expect(ideas.colorPalettes[0].pinned).toBe(true);
    ideas = toggleIdeaPin(ideas, 'colorPalettes', firstPaletteId);
    expect(ideas.colorPalettes[0].pinned).toBe(false);
  });

  it('dismisses and undismisses ideas and palettes', () => {
    let ideas = JSON.parse(JSON.stringify(SAMPLE_PLANS.wedding.ideas));
    const firstThemeId = ideas.themes[0].id;
    ideas = toggleIdeaDismiss(ideas, 'themes', firstThemeId);
    expect(ideas.themes[0].dismissed).toBe(true);

    const firstPaletteId = ideas.colorPalettes[0].id;
    ideas = toggleIdeaDismiss(ideas, 'colorPalettes', firstPaletteId);
    expect(ideas.colorPalettes[0].dismissed).toBe(true);
  });

  it('replaces idea content on regenerate', () => {
    let ideas = JSON.parse(JSON.stringify(SAMPLE_PLANS.wedding.ideas));
    const firstThemeId = ideas.themes[0].id;
    ideas = replaceIdeaContent(ideas, 'themes', firstThemeId, 'Brand new theme content');
    expect(ideas.themes[0].content).toBe('Brand new theme content');
  });

  it('gets random alternative prompt', () => {
    const alt = getRandomAlternative('themes');
    expect(ALTERNATIVE_PROMPTS.themes).toContain(alt);
  });
});
