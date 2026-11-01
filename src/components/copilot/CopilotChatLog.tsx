'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Send } from 'lucide-react';
import type { CopilotResponse } from '@/lib/ai/client';

const QUICK_PROMPTS = [
  'Cut total budget by 10%',
  'Increase total budget by 10%',
  'Keep photography locked while cutting venue',
  'Review timeline milestones for catering',
];

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  proposal?: CopilotResponse;
}

interface CopilotChatLogProps {
  chatHistory: ChatMessage[];
  isLoading: boolean;
  inputMessage: string;
  setInputMessage: (val: string) => void;
  onSubmit: (textToSend?: string) => void;
}

export function CopilotChatLog({
  chatHistory,
  isLoading,
  inputMessage,
  setInputMessage,
  onSubmit,
}: CopilotChatLogProps) {
  return (
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
          <div className="flex items-center gap-2 text-ink-muted text-xs p-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
            <span>Analyzing plan diff...</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] font-mono uppercase text-ink-muted self-center mr-1">Suggested adjustments:</span>
          {QUICK_PROMPTS.map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => onSubmit(prompt)}
              disabled={isLoading}
              className="text-xs px-2.5 py-1 rounded bg-surface hover:bg-surface-elevated text-ink-muted hover:text-ink border border-border transition-colors cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="e.g. 'Cut the total budget by 10%' or 'Shift catering tasting 2 weeks earlier'"
            disabled={isLoading}
            aria-label="Ask Copilot to adjust your plan"
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-surface border border-border rounded-md text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-[var(--color-accent)] disabled:opacity-50"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!inputMessage.trim() || isLoading}
            className="gap-2 min-h-[42px] px-4"
            aria-label="Send copilot message"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </div>
    </Card>
  );
}
