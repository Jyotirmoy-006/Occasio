'use client';

import { useState } from 'react';
import type { Plan } from '@/domain/schemas/plan';
import { parseInputToMinorUnits } from '@/domain/budget/format';
import { rebalanceBudget, resizeBudget } from '@/domain/budget/allocation';
import { exportBudgetCsv } from '@/domain/export/csv';

export function useBudgetActions(
  plan: Plan,
  updatePlan: (updater: (prev: Plan) => Plan) => void,
) {
  const [editingTotal, setEditingTotal] = useState(false);
  const [totalInput, setTotalInput] = useState('');

  const { budget, currency } = plan;
  const totalMinor = budget.totalMinorUnits;

  const handleSliderChange = (catId: string, newPercent: number) => {
    const newMinor = Math.round((newPercent / 100) * totalMinor);
    updatePlan((prev) => ({
      ...prev,
      budget: rebalanceBudget(prev.budget, catId, newMinor),
    }));
  };

  const handleToggleLock = (catId: string) => {
    updatePlan((prev) => ({
      ...prev,
      budget: {
        ...prev.budget,
        categories: prev.budget.categories.map((c) =>
          c.id === catId ? { ...c, locked: !c.locked } : c,
        ),
      },
    }));
  };

  const handleUpdateActual = (catId: string, valueString: string) => {
    const parsed = parseInputToMinorUnits(valueString, currency);
    if (parsed === null) return;
    updatePlan((prev) => ({
      ...prev,
      budget: {
        ...prev.budget,
        categories: prev.budget.categories.map((c) =>
          c.id === catId ? { ...c, actualMinorUnits: parsed } : c,
        ),
      },
    }));
  };

  const handleSaveTotal = () => {
    const parsed = parseInputToMinorUnits(totalInput, currency);
    if (parsed !== null && parsed >= 0) {
      updatePlan((prev) => ({
        ...prev,
        budgetMinorUnits: parsed,
        budget: resizeBudget(prev.budget, parsed),
      }));
    }
    setEditingTotal(false);
  };

  const handleDownloadCsv = () => {
    const csv = exportBudgetCsv(budget, currency);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.eventName.toLowerCase().replace(/\s+/g, '-')}-budget.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    editingTotal,
    setEditingTotal,
    setTotalInput,
    handleSliderChange,
    handleToggleLock,
    handleUpdateActual,
    handleSaveTotal,
    handleDownloadCsv,
  };
}
