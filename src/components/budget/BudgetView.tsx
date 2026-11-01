'use client';

import React, { useState, useId } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import type { Plan } from '@/domain/schemas/plan';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Download, PieChart, Table } from 'lucide-react';
import { BudgetSummaryCards } from './BudgetSummaryCards';
import { BudgetDonutChart } from './BudgetDonutChart';
import { BudgetCategoryRow } from './BudgetCategoryRow';
import { useBudgetActions } from './useBudgetActions';

export function BudgetView() {
  const { plan, updatePlan } = usePlan();
  if (!plan) return null;
  return <BudgetContent plan={plan} updatePlan={updatePlan} />;
}

interface BudgetContentProps {
  plan: Plan;
  updatePlan: (updater: (prev: Plan) => Plan) => void;
}

function BudgetContent({ plan, updatePlan }: BudgetContentProps) {
  const [showTableAlternative, setShowTableAlternative] = useState(false);
  const [activeCategoryHover, setActiveCategoryHover] = useState<string | null>(null);
  const tableId = useId();

  const actions = useBudgetActions(plan, updatePlan);

  const { budget, currency } = plan;
  const totalMinor = budget.totalMinorUnits;
  const actualMinorTotal = budget.categories.reduce((acc, c) => acc + c.actualMinorUnits, 0);
  const isOverBudget = actualMinorTotal > totalMinor;
  const varianceMinor = totalMinor - actualMinorTotal;

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-ink-muted">Event Financials</span>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink mt-1">Budget & Allocation</h1>
          <p className="text-sm text-ink-muted mt-1">
            Linked category sliders rebalance dynamically so the sum strictly matches your total.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowTableAlternative(!showTableAlternative)}
            aria-expanded={showTableAlternative}
            aria-controls={tableId}
            className="gap-2"
          >
            {showTableAlternative ? <PieChart className="w-4 h-4" /> : <Table className="w-4 h-4" />}
            <span>{showTableAlternative ? 'Show Chart' : 'Show Data Table'}</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={actions.handleDownloadCsv} className="gap-2">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      <BudgetSummaryCards
        totalMinor={totalMinor}
        actualMinorTotal={actualMinorTotal}
        varianceMinor={varianceMinor}
        isOverBudget={isOverBudget}
        currency={currency}
        categories={budget.categories}
        editingTotal={actions.editingTotal}
        setEditingTotal={actions.setEditingTotal}
        setTotalInput={actions.setTotalInput}
        onSaveTotal={actions.handleSaveTotal}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-paper border border-border rounded-lg p-6 flex flex-col items-center">
          <BudgetDonutChart
            categories={budget.categories}
            totalMinor={totalMinor}
            currency={currency}
            showTableAlternative={showTableAlternative}
            tableId={tableId}
            activeCategoryHover={activeCategoryHover}
            setActiveCategoryHover={setActiveCategoryHover}
          />
        </div>

        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Category Rebalancing Sliders</CardTitle>
              <span className="text-xs text-ink-muted">Lock amounts you want to keep static</span>
            </CardHeader>

            <div className="space-y-6">
              {budget.categories.map((cat) => (
                <BudgetCategoryRow
                  key={cat.id}
                  category={cat}
                  currency={currency}
                  totalMinor={totalMinor}
                  isHovered={activeCategoryHover === cat.id}
                  onHover={setActiveCategoryHover}
                  onToggleLock={actions.handleToggleLock}
                  onSliderChange={actions.handleSliderChange}
                  onUpdateActual={actions.handleUpdateActual}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
