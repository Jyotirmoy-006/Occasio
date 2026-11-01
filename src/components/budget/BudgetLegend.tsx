'use client';

import React from 'react';
import type { BudgetCategory } from '@/domain/schemas/budget';

interface BudgetLegendProps {
  categories: BudgetCategory[];
  onHover: (id: string | null) => void;
}

export function BudgetLegend({ categories, onHover }: BudgetLegendProps) {
  return (
    <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border/60 text-xs">
      {categories.slice(0, 8).map((cat) => (
        <div
          key={cat.id}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80"
          onMouseEnter={() => onHover(cat.id)}
          onMouseLeave={() => onHover(null)}
        >
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
          <span className="truncate text-ink-muted">{cat.label}</span>
        </div>
      ))}
    </div>
  );
}
