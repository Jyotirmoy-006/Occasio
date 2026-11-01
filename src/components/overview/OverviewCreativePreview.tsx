'use client';

import React from 'react';
import Image from 'next/image';
import type { ColorPalette, IdeaItem } from '@/domain/schemas/ideas';
import { Button } from '@/components/ui/Button';
import { ExternalLink } from 'lucide-react';
import { OverviewPaletteStrip } from './OverviewPaletteStrip';

interface OverviewCreativePreviewProps {
  provenanceLabel: string;
  featuredMood?: {
    src: string;
    alt: string;
    label?: string;
    blurDataUrl?: string;
  };
  activePalette?: ColorPalette;
  featuredTheme?: IdeaItem;
  sampleMenu: IdeaItem[];
  onNavigateIdeas: () => void;
}

export function OverviewCreativePreview({
  provenanceLabel,
  featuredMood,
  activePalette,
  featuredTheme,
  sampleMenu,
  onNavigateIdeas,
}: OverviewCreativePreviewProps) {
  return (
    <section className="paper-sheet paper-sheet-hover p-6 sm:p-8 space-y-6" aria-label="Creative Ideas Preview">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 hairline-b">
        <div>
          <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
            V. Styling & Concepts
          </span>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-2xl font-bold text-ink letterpress-display">
              Curated Aesthetics
            </h3>
            <span className="text-[12px] font-sans px-2.5 py-0.5 rounded bg-surface border border-border text-ink-muted">
              {provenanceLabel}
            </span>
          </div>
          <p className="text-sm text-ink-muted">
            Palette harmony, atmosphere narrative, and bespoke culinary concepts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onNavigateIdeas}
            className="min-h-[44px] gap-1 px-4 text-sm"
          >
            <span>Open Ideas Studio</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {featuredMood && (
          <div className="md:col-span-5 space-y-2">
            <div className="stationery-frame bg-[var(--color-card,#FFFDF8)]">
              <div className="stationery-frame-inner overflow-hidden rounded-md relative aspect-[4/3]">
                <Image
                  src={featuredMood.src}
                  alt={featuredMood.alt}
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                  placeholder="blur"
                  blurDataURL={featuredMood.blurDataUrl}
                />
              </div>
            </div>
            <p className="text-xs text-ink-muted italic px-1">
              Aesthetic Direction: {featuredMood.label || 'Editorial Styling'}
            </p>
          </div>
        )}

        <div className="md:col-span-7 space-y-5">
          {activePalette && <OverviewPaletteStrip palette={activePalette} />}

          {featuredTheme && (
            <div className="p-4 rounded-lg bg-[var(--color-inset,#F1EADC)] border border-border space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-sans font-semibold uppercase text-ink-muted tracking-wider">
                  Atmosphere & Narrative
                </span>
                {featuredTheme.styleTags && featuredTheme.styleTags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {featuredTheme.styleTags.map((t, idx) => (
                      <span key={idx} className="text-[12px] font-sans font-semibold px-2 py-0.5 rounded-full bg-paper border border-border text-ink-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-ink leading-relaxed drop-cap">
                {featuredTheme.content}
              </p>
            </div>
          )}

          {sampleMenu.length > 0 && (
            <div className="space-y-2">
              <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
                Curated Menu Highlights
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sampleMenu.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-lg bg-[var(--color-card,#FFFDF8)] border border-border space-y-1">
                    {item.course && (
                      <span className="text-[12px] font-sans font-semibold uppercase px-2 py-0.5 rounded bg-[var(--color-inset,#F1EADC)] text-ink-muted inline-block">
                        {item.course}
                      </span>
                    )}
                    <p className="text-xs sm:text-sm text-ink leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
