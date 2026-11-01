'use client';

import React, { useState } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { resizeBudget } from '@/domain/budget/allocation';
import type { CopilotResponse } from '@/lib/ai/client';
import { Button } from '@/components/ui/Button';
import { Undo2, Redo2 } from 'lucide-react';
import { CopilotProposalCard } from './CopilotProposalCard';
import { CopilotChatLog } from './CopilotChatLog';

export function CopilotView() {
  const { plan, updatePlan, canUndo, canRedo, undo, redo } = usePlan();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeProposal, setActiveProposal] = useState<CopilotResponse | null>(null);
  const [chatHistory, setChatHistory] = useState<
    Array<{ sender: 'user' | 'assistant'; text: string; proposal?: CopilotResponse }>
  >([
    {
      sender: 'assistant',
      text: 'Hello! I am your Occasio Planning Copilot. You can ask me to adjust your budget, shift milestones, or refine your checklist. Every change shows a full diff and requires your confirmation before applying.',
    },
  ]);

  if (!plan) return null;

  const handleSubmit = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userText = text.trim();
    setInputMessage('');
    setIsLoading(true);

    setChatHistory((prev) => [...prev, { sender: 'user', text: userText }]);

    try {
      const planSummary = `${plan.eventName}: ${plan.eventType} in ${plan.city} on ${plan.eventDate}. Total budget: ${plan.budgetMinorUnits / 100} ${plan.currency}, ${plan.guestCount} guests.`;

      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: userText, planSummary }),
      });

      if (!res.ok) throw new Error('Copilot response failed');
      const data: CopilotResponse = await res.json();

      setActiveProposal(data);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: data.explanation,
          proposal: data,
        },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'I could not process that request right now. You can try a quick action below.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmChanges = (proposal: CopilotResponse) => {
    updatePlan((prev) => {
      let updated = { ...prev };

      for (const change of proposal.proposedChanges) {
        if (change.action === 'scale_budget' && typeof change.value === 'number') {
          const newTotal = Math.round(prev.budget.totalMinorUnits * change.value);
          updated = {
            ...updated,
            budgetMinorUnits: newTotal,
            budget: resizeBudget(prev.budget, newTotal),
          };
        }
      }

      return updated;
    });

    setActiveProposal(null);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-ink-muted">Conversational Assistant</span>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink mt-1">Planning Copilot</h1>
          <p className="text-sm text-ink-muted mt-1">
            Natural-language adjustments with typed diff confirmation and full undo/redo safeguards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo last change"
            className="gap-1.5 min-h-[44px]"
          >
            <Undo2 className="w-4 h-4" />
            <span>Undo</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            aria-label="Redo change"
            className="gap-1.5 min-h-[44px]"
          >
            <Redo2 className="w-4 h-4" />
            <span>Redo</span>
          </Button>
        </div>
      </div>

      {activeProposal && (
        <CopilotProposalCard
          proposal={activeProposal}
          onConfirm={handleConfirmChanges}
          onDismiss={() => setActiveProposal(null)}
        />
      )}

      <CopilotChatLog
        chatHistory={chatHistory}
        isLoading={isLoading}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
