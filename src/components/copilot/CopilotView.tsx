'use client';

import React, { useState } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { resizeBudget } from '@/domain/budget/allocation';
import type { CopilotResponse } from '@/lib/ai/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  Send,
  Check,
  X,
  Undo2,
  Redo2,
  ArrowRight,
} from 'lucide-react';

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

  const quickPrompts = [
    'Cut total budget by 10%',
    'Increase total budget by 10%',
    'Keep photography locked while cutting venue',
    'Review timeline milestones for catering',
  ];

  const handleSubmit = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userText = text.trim();
    setInputMessage('');
    setIsLoading(true);

    // Append user message
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

  // Apply proposed diff after user confirmation
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

  const handleDismissChanges = () => {
    setActiveProposal(null);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-ink-muted">Conversational Assistant</span>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink mt-1">Planning Copilot</h1>
          <p className="text-sm text-ink-muted mt-1">
            Natural-language adjustments with typed diff confirmation and full undo/redo safeguards.
          </p>
        </div>

        {/* Undo/Redo Steppers */}
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

      {/* Active Proposal Diff Confirmation Banner */}
      {activeProposal && (
        <Card className="border-2 border-[var(--color-accent)] bg-surface-raised p-5 shadow-md animate-slide-up" role="region" aria-label="Proposed Plan Diff">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
                <h2 className="font-serif font-semibold text-ink text-base">Proposed Plan Adjustment</h2>
                <Badge variant="warning">Confirmation Required</Badge>
              </div>
              <p className="text-sm text-ink/90 leading-relaxed mt-1">{activeProposal.explanation}</p>

              {/* Proposed Changes Diff Table */}
              <div className="my-3 p-3 bg-paper border border-border rounded-md text-xs font-mono space-y-1.5">
                <div className="text-ink-muted uppercase tracking-wider text-[10px]">Changes to apply:</div>
                {activeProposal.proposedChanges.map((change, cIdx) => (
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
              onClick={() => handleConfirmChanges(activeProposal)}
              className="gap-2 min-h-[44px]"
            >
              <Check className="w-4 h-4" />
              <span>Apply Changes to Plan</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDismissChanges}
              className="gap-2 min-h-[44px]"
            >
              <X className="w-4 h-4" />
              <span>Dismiss</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Chat Messages Log */}
      <Card className="min-h-[380px] p-5 flex flex-col justify-between">
        <div className="space-y-4 overflow-y-auto max-h-[450px] pr-2" aria-live="polite">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <span className="text-[10px] font-mono uppercase text-ink-muted mb-1 px-1">
                {msg.sender === 'user' ? 'You' : 'Occasio Copilot'}
              </span>
              <div
                className={`max-w-[85%] p-3.5 rounded-lg text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-ink text-paper rounded-br-none'
                    : 'bg-surface border border-border text-ink rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex flex-col items-start animate-pulse">
              <span className="text-[10px] font-mono text-ink-muted mb-1 px-1">Occasio Copilot</span>
              <div className="bg-surface border border-border p-3.5 rounded-lg text-xs text-ink-muted">
                Analyzing plan parameters and calculating proportional diffs...
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="mt-4 pt-4 border-t border-border/60">
          <div className="text-[11px] font-mono uppercase text-ink-muted mb-2">Suggested adjustments:</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {quickPrompts.map((prompt, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSubmit(prompt)}
                disabled={isLoading}
                className="text-xs px-2.5 py-1.5 rounded-full border border-border bg-paper hover:bg-surface text-ink-muted hover:text-ink cursor-pointer transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="e.g. 'Cut the total budget by 10%' or 'Shift catering tasting 2 weeks earlier'"
              aria-label="Ask Copilot to adjust your plan"
              className="flex-1 min-h-[44px] px-3.5 py-2 bg-paper border border-border rounded-md text-sm text-ink focus:outline-none focus:border-[var(--color-accent)]"
            />
            <Button type="submit" disabled={!inputMessage.trim() || isLoading} className="gap-2 min-h-[44px]">
              <Send className="w-4 h-4" />
              <span>Send</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
