'use client';

import React from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import { ArrowRight } from 'lucide-react';

interface OverviewVendorSnapshotProps {
  pipelineCounts: {
    'to-contact': number;
    contacted: number;
    quoted: number;
    booked: number;
  };
  totalCategories: number;
  onNavigateChecklist: () => void;
}

export function OverviewVendorSnapshot({
  pipelineCounts,
  totalCategories,
  onNavigateChecklist,
}: OverviewVendorSnapshotProps) {
  return (
    <div className="paper-sheet paper-sheet-hover p-6 space-y-4">
      <div className="flex items-center justify-between pb-2 hairline-b">
        <div>
          <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
            IV. Vendor Procurement
          </span>
          <h3 className="font-serif text-xl font-bold text-ink letterpress-display">
            Sourcing Pipeline
          </h3>
        </div>
        <Tooltip content="Open vendor checklist & quotes manager">
          <button
            onClick={onNavigateChecklist}
            className="text-sm font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          >
            <span>Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </div>

      {/* Clickable Stacked Bar segments */}
      <div
        className="w-full h-4 rounded-full overflow-hidden flex bg-border cursor-pointer shadow-inner"
        onClick={onNavigateChecklist}
        title="Click to view full vendor pipeline"
      >
        <div
          style={{ width: `${(pipelineCounts['to-contact'] / totalCategories) * 100}%` }}
          className="bg-[#57524C] transition-all hover:opacity-85"
          title={`To Contact: ${pipelineCounts['to-contact']}`}
        />
        <div
          style={{ width: `${(pipelineCounts['contacted'] / totalCategories) * 100}%` }}
          className="bg-[#8A5A00] transition-all hover:opacity-85"
          title={`Contacted: ${pipelineCounts['contacted']}`}
        />
        <div
          style={{ width: `${(pipelineCounts['quoted'] / totalCategories) * 100}%` }}
          className="bg-[var(--color-foil-dark,#D9B65B)] transition-all hover:opacity-85"
          title={`Quoted: ${pipelineCounts['quoted']}`}
        />
        <div
          style={{ width: `${(pipelineCounts['booked'] / totalCategories) * 100}%` }}
          className="bg-[#2F6B4F] transition-all hover:opacity-85"
          title={`Booked: ${pipelineCounts['booked']}`}
        />
      </div>

      {/* Legend buttons linking to filtered pipeline */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          onClick={onNavigateChecklist}
          className="p-2 rounded bg-surface hover:bg-surface-raised flex items-center justify-between text-left cursor-pointer border border-transparent hover:border-border transition-colors"
        >
          <span className="flex items-center gap-1.5 text-ink-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-[#57524C]" />
            To Contact
          </span>
          <span className="font-bold tabular-nums text-ink">
            {pipelineCounts['to-contact']}
          </span>
        </button>

        <button
          onClick={onNavigateChecklist}
          className="p-2 rounded bg-surface hover:bg-surface-raised flex items-center justify-between text-left cursor-pointer border border-transparent hover:border-border transition-colors"
        >
          <span className="flex items-center gap-1.5 text-ink-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8A5A00]" />
            Contacted
          </span>
          <span className="font-bold tabular-nums text-ink">
            {pipelineCounts['contacted']}
          </span>
        </button>

        <button
          onClick={onNavigateChecklist}
          className="p-2 rounded bg-surface hover:bg-surface-raised flex items-center justify-between text-left cursor-pointer border border-transparent hover:border-border transition-colors"
        >
          <span className="flex items-center gap-1.5 text-ink-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-foil-dark,#D9B65B)]" />
            Quoted
          </span>
          <span className="font-bold tabular-nums text-ink">
            {pipelineCounts['quoted']}
          </span>
        </button>

        <button
          onClick={onNavigateChecklist}
          className="p-2 rounded bg-surface hover:bg-surface-raised flex items-center justify-between text-left cursor-pointer border border-transparent hover:border-border transition-colors"
        >
          <span className="flex items-center gap-1.5 text-ink-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2F6B4F]" />
            Booked
          </span>
          <span className="font-bold tabular-nums text-ink">
            {pipelineCounts['booked']}
          </span>
        </button>
      </div>
    </div>
  );
}

