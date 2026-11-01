'use client';

import React from 'react';
import type { ColorPalette } from '@/domain/schemas/ideas';

interface OverviewPaletteStripProps {
  palette: ColorPalette;
}

export function OverviewPaletteStrip({ palette }: OverviewPaletteStripProps) {
  return (
    <div className="space-y-2">
      <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
        Color Palette: {palette.name}
      </span>
      <div className="flex h-12 rounded-lg overflow-hidden border border-border shadow-xs">
        {palette.swatches.map((swatch, idx) => (
          <div
            key={idx}
            style={{ backgroundColor: swatch.hex, color: swatch.textColor }}
            className="flex-1 flex flex-col items-center justify-center text-[12px] font-semibold px-1 select-none text-center"
            title={`${swatch.name} (${swatch.hex})`}
          >
            <span className="truncate max-w-full">{swatch.name}</span>
            <span className="text-[12px] opacity-80 uppercase tabular-nums">{swatch.hex}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
