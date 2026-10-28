import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PlanProvider, usePlan } from '@/lib/context/PlanContext';
import { createDefaultBudget } from '@/domain/budget/allocation';
import { generateTimeline } from '@/domain/timeline/generate';
import { generateChecklist } from '@/domain/checklist/generate';
import { getDemoIdeas } from '@/lib/ai/demo-engine';
import type { Plan } from '@/domain/schemas/plan';

describe('PlanContext Unit Tests (Undo/Redo & Scenario)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PlanProvider>{children}</PlanProvider>
  );

  it('initializes with sample plan and allows tab navigation', () => {
    const { result } = renderHook(() => usePlan(), { wrapper });

    expect(result.current.plan).not.toBeNull();
    expect(result.current.activeTab).toBe('overview');

    act(() => {
      result.current.setActiveTab('budget');
    });
    expect(result.current.activeTab).toBe('budget');
  });

  it('updates plan and supports Undo and Redo', () => {
    const { result } = renderHook(() => usePlan(), { wrapper });

    expect(result.current.canUndo).toBe(false);

    // Make an update
    act(() => {
      result.current.updatePlan((prev) => ({
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
  });

  it('duplicates plan for scenario and updates scenario independently', () => {
    const { result } = renderHook(() => usePlan(), { wrapper });

    expect(result.current.scenarioPlan).toBeNull();

    act(() => {
      result.current.duplicatePlanForScenario();
    });

    expect(result.current.scenarioPlan).not.toBeNull();
    expect(result.current.activeTab).toBe('compare');

    act(() => {
      result.current.updateScenarioPlan((prev) => ({
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
});

