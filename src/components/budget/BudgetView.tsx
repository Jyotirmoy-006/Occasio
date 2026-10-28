'use client';

import React, { useState, useId } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { formatCurrency, formatPercent, minorToMajor, parseInputToMinorUnits } from '@/domain/budget/format';
import { rebalanceBudget, resizeBudget } from '@/domain/budget/allocation';
import { exportBudgetCsv } from '@/domain/export/csv';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Lock, Unlock, Download, AlertTriangle, CheckCircle, PieChart, Table } from 'lucide-react';

export function BudgetView() {
  const { plan, updatePlan } = usePlan();
  const [showTableAlternative, setShowTableAlternative] = useState(false);
  const [activeCategoryHover, setActiveCategoryHover] = useState<string | null>(null);
  const [editingTotal, setEditingTotal] = useState(false);
  const [totalInput, setTotalInput] = useState('');
  const tableId = useId();

  if (!plan) return null;

  const { budget, currency } = plan;
  const totalMinor = budget.totalMinorUnits;
  const actualMinorTotal = budget.categories.reduce((acc, c) => acc + c.actualMinorUnits, 0);
  const isOverBudget = actualMinorTotal > totalMinor;
  const varianceMinor = totalMinor - actualMinorTotal;

  // Slider rebalance handler
  const handleSliderChange = (catId: string, newPercent: number) => {
    const newMinor = Math.round((newPercent / 100) * totalMinor);
    updatePlan((prev) => ({
      ...prev,
      budget: rebalanceBudget(prev.budget, catId, newMinor),
    }));
  };

  // Toggle category lock
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

  // Update actual spend for a category
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

  // Save resized total budget
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

  // CSV download
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

  // Accessible Donut Math
  const radius = 80;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;

  const donutSlices = budget.categories.reduce<
    Array<{
      id: string;
      label: string;
      color: string;
      allocatedMinorUnits: number;
      allocatedPercent: number;
      actualMinorUnits: number;
      locked: boolean;
      fraction: number;
      strokeDasharray: string;
      strokeDashoffset: number;
    }>
  >((acc, cat) => {
    const prevOffset = acc.reduce((sum, item) => sum + item.fraction, 0);
    const fraction = totalMinor > 0 ? cat.allocatedMinorUnits / totalMinor : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -prevOffset * circumference;
    acc.push({
      ...cat,
      fraction,
      strokeDasharray,
      strokeDashoffset,
    });
    return acc;
  }, []);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Editorial Header */}
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
          <Button variant="secondary" size="sm" onClick={handleDownloadCsv} className="gap-2">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-[var(--color-accent)]">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Total Budget</span>
          {editingTotal ? (
            <div className="mt-2 flex items-center gap-2">
              <Input
                label="New Total"
                defaultValue={minorToMajor(totalMinor, currency).toString()}
                onChange={(e) => setTotalInput(e.target.value)}
                autoFocus
              />
              <Button size="sm" onClick={handleSaveTotal}>Save</Button>
            </div>
          ) : (
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-2xl sm:text-3xl font-serif text-ink tabular-nums">
                {formatCurrency(totalMinor, currency)}
              </p>
              <button
                onClick={() => {
                  setTotalInput(minorToMajor(totalMinor, currency).toString());
                  setEditingTotal(true);
                }}
                className="text-xs text-[var(--color-accent)] hover:underline cursor-pointer"
              >
                Edit
              </button>
            </div>
          )}
          <span className="text-xs text-ink-muted mt-1 block">Allocated strictly 100% in integer units</span>
        </Card>

        <Card>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Actual Spent / Quoted</span>
          <p className="text-2xl sm:text-3xl font-serif text-ink tabular-nums mt-1">
            {formatCurrency(actualMinorTotal, currency)}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            {isOverBudget ? (
              <Badge variant="error" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
                Over by {formatCurrency(Math.abs(varianceMinor), currency)}
              </Badge>
            ) : (
              <Badge variant="success" icon={<CheckCircle className="w-3.5 h-3.5" />}>
                {formatCurrency(varianceMinor, currency)} remaining
              </Badge>
            )}
          </div>
        </Card>

        <Card>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Categories & Locks</span>
          <p className="text-2xl sm:text-3xl font-serif text-ink mt-1">
            {budget.categories.length} <span className="text-base font-sans text-ink-muted">categories</span>
          </p>
          <span className="text-xs text-ink-muted mt-2 block">
            {budget.categories.filter((c) => c.locked).length} locked to fixed amounts
          </span>
        </Card>
      </div>

      {/* Main Budget Grid: Donut on left, Linked Sliders on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Donut or Table Alternative */}
        <div className="lg:col-span-5 bg-paper border border-border rounded-lg p-6 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4">
            <h2 className="text-base font-serif text-ink">Allocation Distribution</h2>
            <span className="text-xs font-mono text-ink-muted">{budget.categories.length} segments</span>
          </div>

          {!showTableAlternative ? (
            <div className="relative w-64 h-64 flex items-center justify-center my-4" role="img" aria-label="Budget allocation donut chart">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke="var(--color-border)"
                  strokeWidth={strokeWidth}
                />
                {donutSlices.map((slice) => (
                  <circle
                    key={slice.id}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={activeCategoryHover === slice.id ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setActiveCategoryHover(slice.id)}
                    onMouseLeave={() => setActiveCategoryHover(null)}
                  />
                ))}
              </svg>
              {/* Donut Center Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                <span className="text-xs uppercase font-mono text-ink-muted">
                  {activeCategoryHover
                    ? budget.categories.find((c) => c.id === activeCategoryHover)?.label
                    : 'Total Budget'}
                </span>
                <span className="text-xl font-serif text-ink tabular-nums font-semibold mt-0.5">
                  {activeCategoryHover
                    ? formatCurrency(
                        budget.categories.find((c) => c.id === activeCategoryHover)?.allocatedMinorUnits || 0,
                        currency,
                      )
                    : formatCurrency(totalMinor, currency)}
                </span>
                <span className="text-xs text-ink-muted mt-0.5">
                  {activeCategoryHover
                    ? formatPercent(
                        budget.categories.find((c) => c.id === activeCategoryHover)?.allocatedPercent || 0,
                      )
                    : '100% Allocated'}
                </span>
              </div>
            </div>
          ) : (
            /* Accessible Table Alternative */
            <div id={tableId} className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-ink-muted font-mono">
                    <th className="py-2">Category</th>
                    <th className="py-2 text-right">Allocated</th>
                    <th className="py-2 text-right">%</th>
                    <th className="py-2 text-right">Actual</th>
                  </tr>
                </thead>
                <tbody>
                  {budget.categories.map((cat) => (
                    <tr key={cat.id} className="border-b border-border/50">
                      <td className="py-2 font-medium flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.label}
                      </td>
                      <td className="py-2 text-right tabular-nums font-mono">{formatCurrency(cat.allocatedMinorUnits, currency)}</td>
                      <td className="py-2 text-right tabular-nums">{formatPercent(cat.allocatedPercent)}</td>
                      <td className="py-2 text-right tabular-nums font-mono">{formatCurrency(cat.actualMinorUnits, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Color Legend */}
          <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border/60 text-xs">
            {budget.categories.slice(0, 8).map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                onMouseEnter={() => setActiveCategoryHover(cat.id)}
                onMouseLeave={() => setActiveCategoryHover(null)}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="truncate text-ink-muted">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Linked Sliders & Actual Trackers */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Category Rebalancing Sliders</CardTitle>
              <span className="text-xs text-ink-muted">Lock amounts you want to keep static</span>
            </CardHeader>

            <div className="space-y-6">
              {budget.categories.map((cat) => {
                const isOverCategory = cat.actualMinorUnits > cat.allocatedMinorUnits;
                const percentOfTotal = totalMinor > 0 ? (cat.allocatedMinorUnits / totalMinor) * 100 : 0;

                return (
                  <div
                    key={cat.id}
                    className={`p-3 rounded-md transition-colors ${
                      activeCategoryHover === cat.id ? 'bg-surface' : 'bg-transparent'
                    }`}
                    onMouseEnter={() => setActiveCategoryHover(cat.id)}
                    onMouseLeave={() => setActiveCategoryHover(null)}
                  >
                    {/* Header Row: Label, Allocated Amount, Lock Toggle */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="font-medium text-sm text-ink">{cat.label}</span>
                        {cat.locked && (
                          <Badge variant="neutral" icon={<Lock className="w-3 h-3" />}>
                            Locked
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-semibold text-ink tabular-nums font-mono">
                            {formatCurrency(cat.allocatedMinorUnits, currency)}
                          </span>
                          <span className="text-xs text-ink-muted block font-mono">
                            {formatPercent(percentOfTotal)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleLock(cat.id)}
                          aria-label={cat.locked ? `Unlock ${cat.label}` : `Lock ${cat.label}`}
                          className="p-1.5 rounded hover:bg-surface text-ink-muted hover:text-ink cursor-pointer focus-visible:outline-2"
                        >
                          {cat.locked ? <Lock className="w-4 h-4 text-warning" /> : <Unlock className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Accessible Interactive Range Slider */}
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        disabled={cat.locked}
                        value={Math.round(percentOfTotal)}
                        onChange={(e) => handleSliderChange(cat.id, Number(e.target.value))}
                        aria-label={`Allocate percentage for ${cat.label}`}
                        className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)] disabled:opacity-40"
                      />
                    </div>

                    {/* Actual Spend Input & Warning */}
                    <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-ink-muted">Actual spent:</span>
                        <input
                          type="text"
                          defaultValue={minorToMajor(cat.actualMinorUnits, currency).toString()}
                          onBlur={(e) => handleUpdateActual(cat.id, e.target.value)}
                          placeholder="0.00"
                          aria-label={`Actual amount spent for ${cat.label}`}
                          className="w-24 px-2 py-1 bg-surface border border-border rounded text-ink font-mono text-xs text-right focus:outline-none focus:border-[var(--color-accent)]"
                        />
                      </div>

                      {isOverCategory && (
                        <div className="flex items-center gap-1 text-error font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Over by {formatCurrency(cat.actualMinorUnits - cat.allocatedMinorUnits, currency)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
