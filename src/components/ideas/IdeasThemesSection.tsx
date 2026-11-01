'use client';

import React from 'react';
import type { IdeaItem } from '@/domain/schemas/ideas';
import { Card } from '@/components/ui/Card';
import { Compass, Pin, RotateCcw, EyeOff } from 'lucide-react';

interface IdeasThemesSectionProps {
  themes: IdeaItem[];
  onTogglePin: (id: string) => void;
  onRegenerate: (id: string) => void;
  onToggleDismiss: (id: string) => void;
}

export function IdeasThemesSection({
  themes,
  onTogglePin,
  onRegenerate,
  onToggleDismiss,
}: IdeasThemesSectionProps) {
  return (
    <section aria-labelledby="themes-heading" className="space-y-4 pt-4 border-t border-border/60">
      <div className="flex items-center gap-2">
        <Compass className="w-4 h-4 text-[var(--color-accent)]" />
        <h2 id="themes-heading" className="text-xl font-serif text-ink">Themes & Styling Concepts</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themes
          .filter((t) => !t.dismissed)
          .map((theme) => (
            <Card key={theme.id} className="flex flex-col justify-between p-5">
              <p className="text-xs sm:text-sm text-ink leading-relaxed mb-4">{theme.content}</p>
              <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
                <button
                  onClick={() => onTogglePin(theme.id)}
                  className={`flex items-center gap-1 min-h-[36px] cursor-pointer ${
                    theme.pinned ? 'text-[var(--color-accent)] font-semibold' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>{theme.pinned ? 'Pinned' : 'Pin'}</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRegenerate(theme.id)}
                    className="text-ink-muted hover:text-ink min-h-[36px] px-1.5 flex items-center gap-1 cursor-pointer"
                    title="Regenerate this theme idea"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Regen</span>
                  </button>
                  <button
                    onClick={() => onToggleDismiss(theme.id)}
                    className="text-ink-muted hover:text-error min-h-[36px] px-1.5 flex items-center cursor-pointer"
                    title="Dismiss idea"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
      </div>
    </section>
  );
}
