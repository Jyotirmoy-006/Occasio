'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Keyboard } from 'lucide-react';

export function ShortcutsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Cmd/Ctrl + K', desc: 'Open Command Palette & Search' },
    { key: 'Cmd/Ctrl + Z', desc: 'Undo last budget or plan adjustment' },
    { key: 'Cmd/Ctrl + Shift + Z', desc: 'Redo previously undone change' },
    { key: 'Esc', desc: 'Close any modal or dialog' },
    { key: 'Tab / Shift + Tab', desc: 'Navigate between interactive elements' },
    { key: 'Space / Enter', desc: 'Activate selected button or toggle' },
    { key: 'Left / Right Arrows', desc: 'Adjust budget sliders and reschedule timeline' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <Card className="w-full max-w-md bg-paper border border-border shadow-2xl p-6 text-left animate-slide-up">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-[var(--color-accent)]" />
            <h2 id="shortcuts-title" className="text-lg font-serif text-ink">Keyboard Navigation Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink rounded min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close keyboard shortcuts dialog"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-border/40">
              <span className="text-ink-muted">{s.desc}</span>
              <kbd className="px-2 py-1 font-mono text-[11px] bg-surface border border-border rounded text-ink shadow-xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-border text-[11px] text-ink-muted text-center">
          Occasio is fully navigable via keyboard in accordance with WCAG 2.2 Level AA.
        </div>
      </Card>
    </div>
  );
}
