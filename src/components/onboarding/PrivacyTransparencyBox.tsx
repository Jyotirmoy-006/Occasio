'use client';

import React from 'react';
import { AI_PAYLOAD_EXACT_FIELDS } from '@/domain/schemas/plan';
import { Shield, Info } from 'lucide-react';

interface PrivacyTransparencyBoxProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function PrivacyTransparencyBox({ isOpen, onToggle }: PrivacyTransparencyBoxProps) {
  return (
    <div className="p-4 rounded-lg bg-surface border border-border space-y-2">
      <div className="flex items-start gap-2.5 text-xs text-ink">
        <Shield className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Private & Local-First</p>
          <p className="text-ink-muted text-[12px]">
            Saved only on this device. When AI is on, these details are sent to Gemini to create your plan ideas.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className="text-[12px] font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1 cursor-pointer"
      >
        <Info className="w-3.5 h-3.5" />
        {isOpen ? 'Hide transmission details' : 'Exactly what is sent'}
      </button>

      {isOpen && (
        <div className="pt-2 hairline-t text-[11px] text-ink-muted space-y-1">
          <p className="font-semibold text-ink">Transmitted Fields (Single Source of Truth):</p>
          <ul className="list-disc list-inside space-y-0.5">
            {AI_PAYLOAD_EXACT_FIELDS.map((f) => (
              <li key={f.field}>
                <strong>{f.label}:</strong> {f.description}
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-ink-muted italic pt-1">
            * Notice: Event name, personal names, phone numbers, and emails are strictly excluded.
          </p>
        </div>
      )}
    </div>
  );
}
