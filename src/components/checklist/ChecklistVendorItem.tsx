'use client';

import React from 'react';
import type { ChecklistItem } from '@/domain/schemas/checklist';
import type { Currency, VendorStatus } from '@/lib/constants';
import { isVendorStatus } from '@/lib/constants';
import { minorToMajor } from '@/domain/budget/format';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  HelpCircle,
  CheckCircle,
  FileText,
  PhoneCall,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ChecklistVendorItemProps {
  item: ChecklistItem;
  currency: Currency;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onStatusChange: (id: string, newStatus: VendorStatus) => void;
  onQuoteUpdate: (id: string, value: string) => void;
  onNotesUpdate: (id: string, notes: string) => void;
}

function getStatusBadge(status: VendorStatus) {
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
}

export function ChecklistVendorItem({
  item,
  currency,
  isExpanded,
  onToggleExpand,
  onStatusChange,
  onQuoteUpdate,
  onNotesUpdate,
}: ChecklistVendorItemProps) {
  return (
    <Card className="transition-all hover:border-border-dark">
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
              onBlur={(e) => onQuoteUpdate(item.id, e.target.value)}
              placeholder="0.00"
              aria-label={`Enter quote for ${item.vendorType}`}
              className="w-24 px-2 py-1.5 min-h-[36px] bg-surface border border-border rounded text-ink font-mono text-xs text-right focus:outline-none focus:border-[var(--color-accent)]"
            />
            <span className="font-mono text-ink-muted">{currency}</span>
          </div>

          {/* Stage Switcher Dropdown */}
          <select
            value={item.status}
            onChange={(e) => {
              if (isVendorStatus(e.target.value)) {
                onStatusChange(item.id, e.target.value);
              }
            }}
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
            onClick={() => onToggleExpand(item.id)}
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
              onBlur={(e) => onNotesUpdate(item.id, e.target.value)}
              placeholder="Add contact person, consultation date, or package terms..."
              aria-label={`Notes for ${item.vendorType}`}
              className="w-full min-h-[96px] p-2.5 text-xs bg-surface border border-border rounded-md text-ink resize-y focus:outline-none focus:border-[var(--color-accent)] leading-relaxed"
            />
          </div>
        </div>
      )}
    </Card>
  );
}
