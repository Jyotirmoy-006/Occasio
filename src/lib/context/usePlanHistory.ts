'use client';

import { useState, useCallback } from 'react';
import type { Plan } from '@/domain/schemas/plan';
import { savePlan } from '@/lib/storage';

export function usePlanHistory(initialPlan: Plan) {
  const [history, setHistory] = useState<Plan[]>([initialPlan]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const pushHistory = useCallback((newPlan: Plan) => {
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), newPlan]);
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const resetHistory = useCallback((newPlan: Plan) => {
    setHistory([newPlan]);
    setHistoryIndex(0);
  }, []);

  const undo = useCallback((onApply: (plan: Plan) => void) => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      if (prev) {
        onApply(prev);
        savePlan(prev);
        setHistoryIndex((i) => i - 1);
      }
    }
  }, [history, historyIndex]);

  const redo = useCallback((onApply: (plan: Plan) => void) => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      if (next) {
        onApply(next);
        savePlan(next);
        setHistoryIndex((i) => i + 1);
      }
    }
  }, [history, historyIndex]);

  return {
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    pushHistory,
    resetHistory,
    undo,
    redo,
  };
}
