'use client';

import React from 'react';
import { formatCurrency, minorToMajor } from '@/domain/budget/format';
import type { Currency } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { BudgetCategory } from '@/domain/schemas/budget';

interface BudgetSummaryCardsProps {
  totalMinor: number;
  actualMinorTotal: number;
  varianceMinor: number;
  isOverBudget: boolean;
  currency: Currency;
  categories: BudgetCategory[];
  editingTotal: boolean;
  setEditingTotal: (editing: boolean) => void;
  setTotalInput: (val: string) => void;
  onSaveTotal: () => void;
}

export function BudgetSummaryCards({
  totalMinor,
  actualMinorTotal,
  varianceMinor,
  isOverBudget,
  currency,
  categories,
  editingTotal,
  setEditingTotal,
  setTotalInput,
  onSaveTotal,
}: BudgetSummaryCardsProps) {
  return (
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
            <Button size="sm" onClick={onSaveTotal}>Save</Button>
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
          {categories.length} <span className="text-base font-sans text-ink-muted">categories</span>
        </p>
        <span className="text-xs text-ink-muted mt-2 block">
          {categories.filter((c) => c.locked).length} locked to fixed amounts
        </span>
      </Card>
    </div>
  );
}
