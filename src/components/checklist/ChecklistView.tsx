'use client';

import React, { useState } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import type { Plan } from '@/domain/schemas/plan';
import type { VendorStatus } from '@/lib/constants';
import { VENDOR_STATUSES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Download, ShieldCheck } from 'lucide-react';
import { ChecklistVendorItem } from './ChecklistVendorItem';
import { useChecklistActions } from './useChecklistActions';

export function ChecklistView() {
  const { plan, updatePlan } = usePlan();
  if (!plan) return null;
  return <ChecklistContent plan={plan} updatePlan={updatePlan} />;
}

interface ChecklistContentProps {
  plan: Plan;
  updatePlan: (updater: (prev: Plan) => Plan) => void;
}

function ChecklistContent({ plan, updatePlan }: ChecklistContentProps) {
  const [activePipelineTab, setActivePipelineTab] = useState<VendorStatus | 'all'>('all');
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null);

  const actions = useChecklistActions(plan, updatePlan);
  const { checklist, currency } = plan;

  const filteredItems =
    activePipelineTab === 'all'
      ? checklist.items
      : checklist.items.filter((item) => item.status === activePipelineTab);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-ink-muted">Procurement & Inquiry</span>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink mt-1">Vendor Pipeline & Checklist</h1>
          <p className="text-sm text-ink-muted mt-1">
            Track vendor types through 4 inquiry stages. Recorded quotes feed automatically into your budget actuals.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={actions.handleDownloadCsv} className="gap-2">
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </Button>
      </div>

      <div className="p-4 rounded-md bg-surface border border-border flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
        <div className="text-xs text-ink-muted leading-relaxed">
          <strong className="text-ink font-semibold">Responsible AI Policy:</strong> Occasio advises on vendor
          <span className="italic"> types, contractual questions, and negotiation checklists</span>. We never invent fake
          business names, telephone numbers, ratings, or guaranteed prices. Quotes entered here are your real user data.
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter vendor pipeline stages">
        <button
          role="tab"
          aria-selected={activePipelineTab === 'all'}
          onClick={() => setActivePipelineTab('all')}
          className={`px-3.5 py-2 min-h-[44px] text-xs font-medium rounded-md border transition-colors cursor-pointer ${
            activePipelineTab === 'all'
              ? 'bg-ink text-paper border-ink'
              : 'bg-paper text-ink-muted border-border hover:bg-surface'
          }`}
        >
          All Stages ({checklist.items.length})
        </button>
        {VENDOR_STATUSES.map((status) => {
          const count = checklist.items.filter((i) => i.status === status).length;
          return (
            <button
              key={status}
              role="tab"
              aria-selected={activePipelineTab === status}
              onClick={() => setActivePipelineTab(status)}
              className={`px-3.5 py-2 min-h-[44px] text-xs font-medium rounded-md border transition-colors cursor-pointer capitalize ${
                activePipelineTab === status
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-paper text-ink-muted border-border hover:bg-surface'
              }`}
            >
              {status.replace('-', ' ')} ({count})
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {filteredItems.map((item) => (
          <ChecklistVendorItem
            key={item.id}
            item={item}
            currency={currency}
            isExpanded={expandedVendorId === item.id}
            onToggleExpand={(id) => setExpandedVendorId(expandedVendorId === id ? null : id)}
            onStatusChange={actions.handleStatusChange}
            onQuoteUpdate={actions.handleQuoteUpdate}
            onNotesUpdate={actions.handleNotesUpdate}
          />
        ))}
      </div>
    </div>
  );
}
