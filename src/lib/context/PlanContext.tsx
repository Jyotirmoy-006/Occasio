'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Plan } from '@/domain/schemas/plan';
import { savePlan, loadPlan, loadAllPlans } from '@/lib/storage';
import { createDefaultBudget } from '@/domain/budget/allocation';
import { generateTimeline } from '@/domain/timeline/generate';
import { generateChecklist } from '@/domain/checklist/generate';
import { getDemoIdeas } from '@/lib/ai/demo-engine';

export type PlanTab = 'overview' | 'budget' | 'timeline' | 'checklist' | 'ideas' | 'copilot' | 'compare';

interface PlanContextType {
  plan: Plan | null;
  scenarioPlan: Plan | null;
  activeTab: PlanTab;
  setActiveTab: (tab: PlanTab) => void;
  setPlan: (plan: Plan) => void;
  updatePlan: (updater: (prev: Plan) => Plan, description?: string) => void;
  duplicatePlanForScenario: () => void;
  updateScenarioPlan: (updater: (prev: Plan) => Plan) => void;
  clearScenarioPlan: () => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  isDemoMode: boolean;
  allSavedPlans: Plan[];
  refreshSavedPlans: () => void;
  loadSavedPlan: (id: string) => void;
  createNewPlan: (newPlan: Plan) => void;
}

const PlanContext = createContext<PlanContextType | null>(null);

// Default initial sample plan so real data is visible on first load!
const DEFAULT_SAMPLE_PLAN: Plan = {
  id: '7b8f9e01-1234-4567-89ab-cdef01234567',
  schemaVersion: 1,
  eventType: 'wedding',
  eventName: 'Elena & Julian’s Autumn Wedding',
  eventDate: '2027-10-16',
  guestCount: 120,
  budgetMinorUnits: 3200000, // $32,000.00
  currency: 'USD',
  city: 'Hudson Valley, NY',
  style: 'Warm editorial romance with seasonal botanicals',
  culturalNeeds: 'Vegetarian tasting menu with allergen-aware labeling',
  priorities: ['Photography & Video', 'Catering & Bar', 'Live Music'],
  budget: createDefaultBudget('wedding', 3200000),
  timeline: generateTimeline('wedding', '2027-10-16'),
  checklist: generateChecklist('wedding'),
  ideas: getDemoIdeas('wedding'),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isAIGenerated: false,
};

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [allSavedPlans, setAllSavedPlans] = useState<Plan[]>(() => {
    if (typeof window === 'undefined') return [DEFAULT_SAMPLE_PLAN];
    const saved = loadAllPlans();
    if (saved.length > 0) return saved;
    savePlan(DEFAULT_SAMPLE_PLAN);
    return [DEFAULT_SAMPLE_PLAN];
  });

  const [plan, setPlanState] = useState<Plan | null>(() => {
    if (typeof window === 'undefined') return DEFAULT_SAMPLE_PLAN;
    const saved = loadAllPlans();
    if (saved.length > 0 && saved[0]) return saved[0];
    savePlan(DEFAULT_SAMPLE_PLAN);
    return DEFAULT_SAMPLE_PLAN;
  });

  const [scenarioPlan, setScenarioPlan] = useState<Plan | null>(null);
  const [activeTab, setActiveTab] = useState<PlanTab>('overview');
  const [isDemoMode, setIsDemoMode] = useState(false);

  // History stack for Undo/Redo
  const [history, setHistory] = useState<Plan[]>(() => {
    if (typeof window === 'undefined') return [DEFAULT_SAMPLE_PLAN];
    const saved = loadAllPlans();
    if (saved.length > 0 && saved[0]) return [saved[0]];
    return [DEFAULT_SAMPLE_PLAN];
  });
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Query health endpoint for demo mode
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.demoMode === 'boolean') {
          setIsDemoMode(data.demoMode);
        }
      })
      .catch(() => setIsDemoMode(true));
  }, []);

  // Update HTML data-event attribute to reflect theme
  useEffect(() => {
    if (plan?.eventType) {
      document.documentElement.setAttribute('data-event', plan.eventType);
    }
  }, [plan?.eventType]);

  const refreshSavedPlans = useCallback(() => {
    setAllSavedPlans(loadAllPlans());
  }, []);

  const setPlan = useCallback((newPlan: Plan) => {
    setPlanState(newPlan);
    savePlan(newPlan);
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), newPlan]);
    setHistoryIndex((prev) => prev + 1);
    refreshSavedPlans();
  }, [historyIndex, refreshSavedPlans]);

  const updatePlan = useCallback(
    (updater: (prev: Plan) => Plan) => {
      setPlanState((current) => {
        if (!current) return current;
        const next = updater(current);
        const updatedPlan: Plan = {
          ...next,
          updatedAt: new Date().toISOString(),
        };
        savePlan(updatedPlan);
        setHistory((prev) => [...prev.slice(0, historyIndex + 1), updatedPlan]);
        setHistoryIndex((prev) => prev + 1);
        return updatedPlan;
      });
      refreshSavedPlans();
    },
    [historyIndex, refreshSavedPlans],
  );

  const duplicatePlanForScenario = useCallback(() => {
    if (!plan) return;
    const clone: Plan = {
      ...JSON.parse(JSON.stringify(plan)),
      id: crypto.randomUUID(),
      eventName: `${plan.eventName} (Alternative Scenario)`,
      updatedAt: new Date().toISOString(),
    };
    setScenarioPlan(clone);
    setActiveTab('compare');
  }, [plan]);

  const updateScenarioPlan = useCallback((updater: (prev: Plan) => Plan) => {
    setScenarioPlan((current) => (current ? updater(current) : null));
  }, []);

  const clearScenarioPlan = useCallback(() => {
    setScenarioPlan(null);
  }, []);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      if (prev) {
        setPlanState(prev);
        savePlan(prev);
        setHistoryIndex((i) => i - 1);
      }
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      if (next) {
        setPlanState(next);
        savePlan(next);
        setHistoryIndex((i) => i + 1);
      }
    }
  }, [history, historyIndex]);

  const loadSavedPlan = useCallback((id: string) => {
    const loaded = loadPlan(id);
    if (loaded) {
      setPlanState(loaded);
      setHistory([loaded]);
      setHistoryIndex(0);
    }
  }, []);

  const createNewPlan = useCallback((newPlan: Plan) => {
    setPlanState(newPlan);
    savePlan(newPlan);
    setHistory([newPlan]);
    setHistoryIndex(0);
    setScenarioPlan(null);
    setActiveTab('overview');
    refreshSavedPlans();
  }, [refreshSavedPlans]);

  return (
    <PlanContext.Provider
      value={{
        plan,
        scenarioPlan,
        activeTab,
        setActiveTab,
        setPlan,
        updatePlan,
        duplicatePlanForScenario,
        updateScenarioPlan,
        clearScenarioPlan,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        undo,
        redo,
        isDemoMode,
        allSavedPlans,
        refreshSavedPlans,
        loadSavedPlan,
        createNewPlan,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
}
