'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Plan } from '@/domain/schemas/plan';
import { SAMPLE_PLANS } from '@/domain/sample-plans';
import { savePlan, loadAllPlans, loadPlan } from '@/lib/storage';
import { usePlanHistory } from './usePlanHistory';

export type PlanTab =
  | 'overview'
  | 'budget'
  | 'timeline'
  | 'checklist'
  | 'ideas'
  | 'copilot'
  | 'compare';

interface PlanContextType {
  plan: Plan | null;
  scenarioPlan: Plan | null;
  activeTab: PlanTab;
  setActiveTab: (tab: PlanTab) => void;
  setPlan: (plan: Plan) => void;
  updatePlan: (updater: (prev: Plan) => Plan) => void;
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
  createNewPlan: (plan: Plan) => void;
}

const PlanContext = createContext<PlanContextType | null>(null);

const DEFAULT_SAMPLE_PLAN: Plan = SAMPLE_PLANS.wedding;

function getInitialPlans(): { all: Plan[]; current: Plan } {
  if (typeof window === 'undefined') {
    return { all: [DEFAULT_SAMPLE_PLAN], current: DEFAULT_SAMPLE_PLAN };
  }
  const saved = loadAllPlans();
  if (saved.length > 0 && saved[0]) {
    return { all: saved, current: saved[0] };
  }
  savePlan(DEFAULT_SAMPLE_PLAN);
  return { all: [DEFAULT_SAMPLE_PLAN], current: DEFAULT_SAMPLE_PLAN };
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [initial] = useState(getInitialPlans);
  const [allSavedPlans, setAllSavedPlans] = useState<Plan[]>(initial.all);
  const [plan, setPlanState] = useState<Plan | null>(initial.current);
  const [scenarioPlan, setScenarioPlan] = useState<Plan | null>(null);
  const [activeTab, setActiveTab] = useState<PlanTab>('overview');
  const [isDemoMode, setIsDemoMode] = useState(false);

  const history = usePlanHistory(initial.current);

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

  useEffect(() => {
    if (plan?.eventType) {
      document.documentElement.setAttribute('data-event', plan.eventType);
      document.documentElement.setAttribute('data-event-theme', plan.eventType);
    }
  }, [plan?.eventType]);

  const refreshSavedPlans = useCallback(() => {
    setAllSavedPlans(loadAllPlans());
  }, []);

  const setPlan = useCallback((newPlan: Plan) => {
    setPlanState(newPlan);
    savePlan(newPlan);
    history.pushHistory(newPlan);
    refreshSavedPlans();
  }, [history, refreshSavedPlans]);

  const updatePlan = useCallback((updater: (prev: Plan) => Plan) => {
    setPlanState((current) => {
      if (!current) return current;
      const next = updater(current);
      const updatedPlan: Plan = {
        ...next,
        updatedAt: new Date().toISOString(),
      };
      savePlan(updatedPlan);
      history.pushHistory(updatedPlan);
      return updatedPlan;
    });
    refreshSavedPlans();
  }, [history, refreshSavedPlans]);

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
    history.undo(setPlanState);
  }, [history]);

  const redo = useCallback(() => {
    history.redo(setPlanState);
  }, [history]);

  const loadSavedPlan = useCallback((id: string) => {
    const loaded = loadPlan(id);
    if (loaded) {
      setPlanState(loaded);
      history.resetHistory(loaded);
    }
  }, [history]);

  const createNewPlan = useCallback((newPlan: Plan) => {
    setPlanState(newPlan);
    savePlan(newPlan);
    history.resetHistory(newPlan);
    setScenarioPlan(null);
    setActiveTab('overview');
    refreshSavedPlans();
  }, [history, refreshSavedPlans]);

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
        canUndo: history.canUndo,
        canRedo: history.canRedo,
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
