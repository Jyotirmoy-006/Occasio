import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PlanProvider, usePlan } from '@/lib/context/PlanContext';
import { createDefaultBudget } from '@/domain/budget/allocation';
import { generateTimeline } from '@/domain/timeline/generate';
import { generateChecklist } from '@/domain/checklist/generate';
import { getDemoIdeas } from '@/lib/ai/demo-engine';
import { savePlan } from '@/lib/storage';
import type { Plan } from '@/domain/schemas/plan';

describe('PlanContext Unit Tests (Undo/Redo & Scenario)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PlanProvider>{children}</PlanProvider>
  );

  const testPlan: Plan = {
    id: '123e4567-e89b-42d3-a456-426614174000',
    schemaVersion: 1,
    eventType: 'birthday',
    eventName: 'Custom Birthday Gala',
    eventDate: '2027-09-20',
    guestCount: 60,
    budgetMinorUnits: 800000,
    currency: 'USD',
    city: 'San Francisco',
    style: 'Art Deco',
    culturalNeeds: '',
    priorities: ['Music', 'Decor'],
    budget: createDefaultBudget('birthday', 800000),
    timeline: generateTimeline('birthday', '2027-09-20'),
    checklist: generateChecklist('birthday'),
    ideas: getDemoIdeas('birthday'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isAIGenerated: false,
  };

  it('throws descriptive error when usePlan is called outside PlanProvider', () => {
    expect(() => renderHook(() => usePlan())).toThrow(
      'usePlan must be used within a PlanProvider',
    );
  });

  it('initializes with sample plan and allows tab navigation', () => {
    let result: any;
    act(() => {
      const rendered = renderHook(() => usePlan(), { wrapper });
      result = rendered.result;
    });

    expect(result.current.plan).not.toBeNull();
    expect(result.current.activeTab).toBe('overview');

    act(() => {
      result.current.setActiveTab('budget');
    });
    expect(result.current.activeTab).toBe('budget');
  });

  it('updates plan and supports Undo and Redo', () => {
    let result: any;
    act(() => {
      const rendered = renderHook(() => usePlan(), { wrapper });
      result = rendered.result;
    });

    expect(result.current.canUndo).toBe(false);

    // Boundary check: calling undo when canUndo is false does nothing
    act(() => {
      result.current.undo();
    });
    expect(result.current.canUndo).toBe(false);

    // Make an update
    act(() => {
      result.current.updatePlan((prev: Plan) => ({
        ...prev,
        eventName: 'Updated Name 1',
      }));
    });

    expect(result.current.plan?.eventName).toBe('Updated Name 1');
    expect(result.current.canUndo).toBe(true);

    // Undo
    act(() => {
      result.current.undo();
    });

    expect(result.current.plan?.eventName).not.toBe('Updated Name 1');
    expect(result.current.canRedo).toBe(true);

    // Redo
    act(() => {
      result.current.redo();
    });

    expect(result.current.plan?.eventName).toBe('Updated Name 1');

    // Boundary check: calling redo when at end of history does nothing
    act(() => {
      result.current.redo();
    });
    expect(result.current.plan?.eventName).toBe('Updated Name 1');
  });

  it('duplicates plan for scenario and updates scenario independently', () => {
    let result: any;
    act(() => {
      const rendered = renderHook(() => usePlan(), { wrapper });
      result = rendered.result;
    });

    expect(result.current.scenarioPlan).toBeNull();

    // Calling updateScenarioPlan when scenarioPlan is null is a safe no-op
    act(() => {
      result.current.updateScenarioPlan((prev: Plan) => ({
        ...prev,
        guestCount: 999,
      }));
    });
    expect(result.current.scenarioPlan).toBeNull();

    act(() => {
      result.current.duplicatePlanForScenario();
    });

    expect(result.current.scenarioPlan).not.toBeNull();
    expect(result.current.activeTab).toBe('compare');

    act(() => {
      result.current.updateScenarioPlan((prev: Plan) => ({
        ...prev,
        guestCount: 200,
      }));
    });

    expect(result.current.scenarioPlan?.guestCount).toBe(200);
    expect(result.current.plan?.guestCount).not.toBe(200);

    act(() => {
      result.current.clearScenarioPlan();
    });

    expect(result.current.scenarioPlan).toBeNull();
  });

  it('creates a new plan, sets state, clears scenario, and navigates to overview', () => {
    let result: any;
    act(() => {
      const rendered = renderHook(() => usePlan(), { wrapper });
      result = rendered.result;
    });

    act(() => {
      result.current.duplicatePlanForScenario();
      result.current.createNewPlan(testPlan);
    });

    expect(result.current.plan?.id).toBe(testPlan.id);
    expect(result.current.plan?.eventName).toBe(testPlan.eventName);
    expect(result.current.scenarioPlan).toBeNull();
    expect(result.current.activeTab).toBe('overview');
    expect(result.current.allSavedPlans.some((p: Plan) => p.id === testPlan.id)).toBe(true);
  });

  it('loads a saved plan by id and ignores non-existent id gracefully', () => {
    savePlan(testPlan);

    let result: any;
    act(() => {
      const rendered = renderHook(() => usePlan(), { wrapper });
      result = rendered.result;
    });

    const initialPlanId = result.current.plan?.id;

    // Load non-existent plan is a safe no-op
    act(() => {
      result.current.loadSavedPlan('non-existent-id-999');
    });
    expect(result.current.plan?.id).toBe(initialPlanId);

    // Load existing saved plan
    act(() => {
      result.current.loadSavedPlan(testPlan.id);
    });
    expect(result.current.plan?.id).toBe(testPlan.id);
  });

  it('allows replacing plan via setPlan and refreshing saved plans', () => {
    let result: any;
    act(() => {
      const rendered = renderHook(() => usePlan(), { wrapper });
      result = rendered.result;
    });

    act(() => {
      result.current.setPlan(testPlan);
    });
    expect(result.current.plan?.id).toBe(testPlan.id);

    act(() => {
      result.current.refreshSavedPlans();
    });
    expect(result.current.allSavedPlans.length).toBeGreaterThanOrEqual(1);
  });
});
