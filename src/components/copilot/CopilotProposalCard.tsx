'use client';

import React from 'react';
import type { CopilotResponse } from '@/lib/ai/client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight, Check, X } from 'lucide-react';

interface CopilotProposalCardProps {
  proposal: CopilotResponse;
  onConfirm: (proposal: CopilotResponse) => void;
  onDismiss: () => void;
}

export function CopilotProposalCard({
  proposal,
  onConfirm,
  onDismiss,
}: CopilotProposalCardProps) {
  return (
    <Card
      className="border-2 border-[var(--color-accent)] bg-surface-raised p-5 shadow-md animate-slide-up"
      role="region"
      aria-label="Proposed Plan Diff"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
            <h2 className="font-serif font-semibold text-ink text-base">Proposed Plan Adjustment</h2>
            <Badge variant="warning">Confirmation Required</Badge>
          </div>
          <p className="text-sm text-ink/90 leading-relaxed mt-1">{proposal.explanation}</p>

          <div className="my-3 p-3 bg-paper border border-border rounded-md text-xs font-mono space-y-1.5">
            <div className="text-ink-muted uppercase tracking-wider text-[10px]">Changes to apply:</div>
            {proposal.proposedChanges.map((change, cIdx) => (
              <div key={cIdx} className="flex items-center gap-2 text-ink">
                <ArrowRight className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
                <span className="font-semibold">{change.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border">
        <Button
          size="sm"
          variant="primary"
          onClick={() => onConfirm(proposal)}
          className="gap-2 min-h-[44px]"
        >
          <Check className="w-4 h-4" />
          <span>Apply Changes to Plan</span>
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onDismiss}
          className="gap-2 min-h-[44px]"
        >
          <X className="w-4 h-4" />
          <span>Dismiss</span>
        </Button>
      </div>
    </Card>
  );
}
