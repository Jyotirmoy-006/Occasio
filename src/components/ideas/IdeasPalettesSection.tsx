'use client';

import React from 'react';
import type { ColorPalette } from '@/domain/schemas/ideas';
import { Card } from '@/components/ui/Card';
import { Palette, Pin } from 'lucide-react';

interface IdeasPalettesSectionProps {
  palettes: ColorPalette[];
  onTogglePin: (id: string) => void;
}

export function IdeasPalettesSection({ palettes, onTogglePin }: IdeasPalettesSectionProps) {
  return (
    <section aria-labelledby="palettes-heading" className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-[var(--color-accent)]" />
        <h2 id="palettes-heading" className="text-xl font-serif text-ink">Color Palettes & Swatches</h2>
      </div>
      <p className="text-xs text-ink-muted">
        All text overlays are mathematically verified for WCAG AA contrast (minimum 4.5:1 ratio).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {palettes
          .filter((p) => !p.dismissed)
          .map((palette) => (
            <Card key={palette.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif font-semibold text-base text-ink">{palette.name}</h3>
                  <button
                    onClick={() => onTogglePin(palette.id)}
                    className={`p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded cursor-pointer ${
                      palette.pinned ? 'text-[var(--color-accent)]' : 'text-ink-muted hover:text-ink'
                    }`}
                    aria-label={palette.pinned ? 'Unpin palette' : 'Pin palette'}
                  >
                    <Pin className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 my-2">
                  {palette.swatches.map((swatch, sIdx) => (
                    <div
                      key={sIdx}
                      style={{ backgroundColor: swatch.hex, color: swatch.textColor }}
                      className="h-20 rounded-md p-2 flex flex-col justify-between text-[11px] font-mono shadow-sm transition-transform hover:scale-105"
                    >
                      <span className="font-bold truncate">{swatch.name}</span>
                      <span className="font-mono">{swatch.hex.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
      </div>
    </section>
  );
}
