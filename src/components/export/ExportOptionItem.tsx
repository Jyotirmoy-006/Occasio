'use client';

import React from 'react';

interface ExportOptionItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
  onClick: () => void;
}

export function ExportOptionItem({
  icon,
  title,
  description,
  badge,
  onClick,
}: ExportOptionItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full p-3.5 rounded-md border border-border hover:bg-surface flex items-center justify-between text-left transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <span className="text-sm font-medium text-ink block">{title}</span>
          <span className="text-xs text-ink-muted">{description}</span>
        </div>
      </div>
      <span className="text-xs font-mono text-ink-muted group-hover:text-ink">{badge}</span>
    </button>
  );
}
