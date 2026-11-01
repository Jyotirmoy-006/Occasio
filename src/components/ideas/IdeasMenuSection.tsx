'use client';

import React from 'react';
import type { IdeaItem } from '@/domain/schemas/ideas';
import { Card } from '@/components/ui/Card';
import { Utensils, Pin, RotateCcw } from 'lucide-react';

interface IdeasMenuSectionProps {
  menuIdeas: IdeaItem[];
  onTogglePin: (id: string) => void;
  onRegenerate: (id: string) => void;
}

export function IdeasMenuSection({
  menuIdeas,
  onTogglePin,
  onRegenerate,
}: IdeasMenuSectionProps) {
  return (
    <section aria-labelledby="menu-heading" className="space-y-4 pt-4 border-t border-border/60">
      <div className="flex items-center gap-2">
        <Utensils className="w-4 h-4 text-[var(--color-accent)]" />
        <h2 id="menu-heading" className="text-xl font-serif text-ink">Menu & Culinary Inspirations</h2>
      </div>
      <p className="text-xs text-ink-muted">
        Remember: confirm all dietary restrictions, cross-contamination safeguards, and allergen labeling with caterers.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {menuIdeas
          .filter((m) => !m.dismissed)
          .map((item) => (
            <Card key={item.id} className="flex flex-col justify-between p-5">
              <p className="text-xs sm:text-sm text-ink leading-relaxed mb-4">{item.content}</p>
              <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
                <button
                  onClick={() => onTogglePin(item.id)}
                  className={`flex items-center gap-1 min-h-[36px] cursor-pointer ${
                    item.pinned ? 'text-[var(--color-accent)] font-semibold' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>{item.pinned ? 'Pinned' : 'Pin'}</span>
                </button>
                <button
                  onClick={() => onRegenerate(item.id)}
                  className="text-ink-muted hover:text-ink min-h-[36px] px-1.5 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Regen</span>
                </button>
              </div>
            </Card>
          ))}
      </div>
    </section>
  );
}
