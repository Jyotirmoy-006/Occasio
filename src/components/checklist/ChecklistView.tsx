'use client';

import React, { useState } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { exportChecklistCsv } from '@/domain/export/csv';
import { minorToMajor, parseInputToMinorUnits } from '@/domain/budget/format';
import type { VendorStatus } from '@/lib/constants';
import { VENDOR_STATUSES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Download,
  HelpCircle,
  CheckCircle,
  FileText,
  PhoneCall,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';

export function ChecklistView() {
  const { plan, updatePlan } = usePlan();
  const [activePipelineTab, setActivePipelineTab] = useState<VendorStatus | 'all'>('all');
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null);

  if (!plan) return null;

  const { checklist, currency } = plan;

  // Pipeline status change handler
  const handleStatusChange = (itemId: string, newStatus: VendorStatus) => {
    updatePlan((prev) => ({
      ...prev,
      checklist: {
        items: prev.checklist.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: newStatus,
                contactedAt: newStatus === 'contacted' ? new Date().toISOString() : item.contactedAt,
                bookedAt: newStatus === 'booked' ? new Date().toISOString() : item.bookedAt,
              }
            : item,
        ),
      },
    }));
  };

  // Quote amount update: feeds directly into actual budget tracker!
  const handleQuoteUpdate = (itemId: string, valueString: string) => {
    const parsed = parseInputToMinorUnits(valueString, currency);
    updatePlan((prev) => {
      const updatedItems = prev.checklist.items.map((i) =>
        i.id === itemId ? { ...i, quoteMinorUnits: parsed } : i,
      );

      // Re-sum quoted vendor items to update corresponding budget category actual spend
      const targetVendor = prev.checklist.items.find((i) => i.id === itemId);
      let updatedBudget = prev.budget;
      if (targetVendor && parsed !== null) {
        updatedBudget = {
          ...prev.budget,
          categories: prev.budget.categories.map((c) =>
            c.id === targetVendor.category || c.label.toLowerCase().includes(targetVendor.category.toLowerCase())
              ? { ...c, actualMinorUnits: parsed }
              : c,
          ),
        };
      }

      return {
        ...prev,
        checklist: { items: updatedItems },
        budget: updatedBudget,
      };
    });
  };

  // Notes update
  const handleNotesUpdate = (itemId: string, notes: string) => {
    updatePlan((prev) => ({
      ...prev,
      checklist: {
        items: prev.checklist.items.map((item) =>
          item.id === itemId ? { ...item, notes } : item,
        ),
      },
    }));
  };

  // CSV download
  const handleDownloadCsv = () => {
    const csv = exportChecklistCsv(checklist, currency);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.eventName.toLowerCase().replace(/\s+/g, '-')}-vendor-checklist.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredItems =
    activePipelineTab === 'all'
      ? checklist.items
      : checklist.items.filter((item) => item.status === activePipelineTab);

  const getStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'to-contact':
        return <Badge variant="neutral" icon={<HelpCircle className="w-3.5 h-3.5" />}>To Contact</Badge>;
      case 'contacted':
        return <Badge variant="accent" icon={<PhoneCall className="w-3.5 h-3.5" />}>Contacted</Badge>;
      case 'quoted':
        return <Badge variant="warning" icon={<DollarSign className="w-3.5 h-3.5" />}>Quoted</Badge>;
      case 'booked':
        return <Badge variant="success" icon={<CheckCircle className="w-3.5 h-3.5" />}>Booked</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-ink-muted">Procurement & Inquiry</span>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink mt-1">Vendor Pipeline & Checklist</h1>
          <p className="text-sm text-ink-muted mt-1">
            Track vendor types through 4 inquiry stages. Recorded quotes feed automatically into your budget actuals.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleDownloadCsv} className="gap-2">
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </Button>
      </div>

      {/* Responsible AI Compliance Notice Banner */}
      <div className="p-4 rounded-md bg-surface border border-border flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
        <div className="text-xs text-ink-muted leading-relaxed">
          <strong className="text-ink font-semibold">Responsible AI Policy:</strong> Occasio advises on vendor
          <span className="italic"> types, contractual questions, and negotiation checklists</span>. We never invent fake
          business names, telephone numbers, ratings, or guaranteed prices. Quotes entered here are your real user data.
        </div>
      </div>

      {/* Pipeline Stage Tabs */}
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

      {/* Vendor Cards List */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const isExpanded = expandedVendorId === item.id;

          return (
            <Card key={item.id} className="transition-all hover:border-border-dark">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-ink font-serif">{item.vendorType}</h2>
                      {getStatusBadge(item.status)}
                    </div>
                    <span className="text-xs text-ink-muted font-mono uppercase">Category: {item.category}</span>
                  </div>
                </div>

                {/* Pipeline Stage Select + Quote Input */}
                <div className="flex flex-wrap items-center gap-3 self-end sm:self-center">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-ink-muted">Quote:</span>
                    <input
                      type="text"
                      defaultValue={item.quoteMinorUnits !== null ? minorToMajor(item.quoteMinorUnits, currency).toString() : ''}
                      onBlur={(e) => handleQuoteUpdate(item.id, e.target.value)}
                      placeholder="0.00"
                      aria-label={`Enter quote for ${item.vendorType}`}
                      className="w-24 px-2 py-1.5 min-h-[36px] bg-surface border border-border rounded text-ink font-mono text-xs text-right focus:outline-none focus:border-[var(--color-accent)]"
                    />
                    <span className="font-mono text-ink-muted">{currency}</span>
                  </div>

                  {/* Stage Switcher Dropdown */}
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as VendorStatus)}
                    aria-label={`Change stage for ${item.vendorType}`}
                    className="min-h-[44px] px-3 py-1.5 text-xs bg-paper border border-border rounded-md text-ink cursor-pointer focus:outline-none focus:border-[var(--color-accent)]"
                  >
                    <option value="to-contact">Stage: To Contact</option>
                    <option value="contacted">Stage: Contacted</option>
                    <option value="quoted">Stage: Quoted</option>
                    <option value="booked">Stage: Booked</option>
                  </select>

                  {/* Questions toggle */}
                  <button
                    onClick={() => setExpandedVendorId(isExpanded ? null : item.id)}
                    aria-expanded={isExpanded}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-md hover:bg-surface text-ink-muted hover:text-ink cursor-pointer"
                    aria-label={isExpanded ? 'Hide questions' : 'Show questions'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expandable Section: Questions to Ask & Notes */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border/60 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  {/* Questions to Ask */}
                  <div>
                    <h3 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold flex items-center gap-1.5 mb-2.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                      Essential Questions To Ask
                    </h3>
                    <ul className="space-y-2 text-xs text-ink/90 leading-relaxed list-disc list-inside">
                      {item.questionsToAsk.map((question, qIdx) => (
                        <li key={qIdx} className="pl-1 text-ink-muted">
                          <span className="text-ink">{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Private Notes */}
                  <div>
                    <h3 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold flex items-center gap-1.5 mb-2.5">
                      <FileText className="w-3.5 h-3.5 text-ink-muted" />
                      Vendor Notes & Agreements
                    </h3>
                    <textarea
                      defaultValue={item.notes}
                      onBlur={(e) => handleNotesUpdate(item.id, e.target.value)}
                      placeholder="Add contact person, consultation date, or package terms..."
                      aria-label={`Notes for ${item.vendorType}`}
                      className="w-full min-h-[96px] p-2.5 text-xs bg-surface border border-border rounded-md text-ink resize-y focus:outline-none focus:border-[var(--color-accent)] leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
