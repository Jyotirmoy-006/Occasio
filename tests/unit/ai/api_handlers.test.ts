import { describe, it, expect } from 'vitest';
import { POST as generateHandler } from '@/app/api/generate/route';
import { POST as copilotHandler } from '@/app/api/copilot/route';
import { GET as healthHandler } from '@/app/api/health/route';
import { NextRequest } from 'next/server';

describe('API Route Handlers (Generate, Copilot, Health)', () => {
  it('health endpoint returns status ok and demoMode flag', async () => {
    const res = await healthHandler();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(typeof data.demoMode).toBe('boolean');
    expect(data.timestamp).toBeDefined();
  });

  it('rejects invalid plan input with 400 Bad Request', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({ eventType: 'invalid', guestCount: -1 }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await generateHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid plan input');
  });

  it('generates a full schema-valid plan for wedding onboarding input', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        eventType: 'wedding',
        eventName: 'Sarah & Alex Wedding',
        eventDate: '2027-09-20',
        guestCount: 150,
        budgetMinorUnits: 3500000,
        currency: 'USD',
        city: 'Austin, TX',
        style: 'Warm rustic with wildflowers',
        culturalNeeds: 'Vegetarian and gluten-free catering',
        priorities: ['Photography', 'Great food', 'Live acoustic music'],
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await generateHandler(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.plan).toBeDefined();
    expect(data.plan.eventName).toBe('Sarah & Alex Wedding');
    expect(data.plan.budget.totalMinorUnits).toBe(3500000);
    expect(data.plan.budget.categories.length).toBeGreaterThan(0);
    expect(data.plan.timeline.milestones.length).toBeGreaterThan(0);
    expect(data.plan.checklist.items.length).toBeGreaterThan(0);
    expect(data.plan.ideas.themes.length).toBeGreaterThan(0);
  });

  it('handles copilot chat requests with rule-based fallback and explanation', async () => {
    const req = new NextRequest('http://localhost:3000/api/copilot', {
      method: 'POST',
      body: JSON.stringify({
        userMessage: 'Cut the total budget by 10%',
        planSummary: 'Wedding with $35,000 budget and 150 guests',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await copilotHandler(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.explanation).toBeDefined();
    expect(data.requiresConfirmation).toBe(true);
    expect(data.proposedChanges.length).toBeGreaterThan(0);
  });
});
