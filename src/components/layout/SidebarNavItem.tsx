'use client';

import React from 'react';
import type { PlanTab } from '@/lib/context/PlanContext';
import { ChevronRight } from 'lucide-react';

interface SidebarNavItemProps {
  id: PlanTab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  isActive: boolean;
  onSelect: (id: PlanTab) => void;
}

export function SidebarNavItem({
  id,
  label,
  icon,
  badge,
  isActive,
  onSelect,
}: SidebarNavItemProps) {
  return (
    <button
      onClick={() => onSelect(id)}
      aria-current={isActive ? 'page' : undefined}
      className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-r-md text-sm font-medium flex items-center justify-between transition-colors cursor-pointer group border-l-[3px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
        isActive
          ? 'border-l-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-semibold border-y-transparent border-r-transparent'
          : 'border-l-transparent text-ink-muted hover:bg-surface hover:text-ink'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={isActive ? 'text-[var(--color-accent)]' : 'text-ink-subtle group-hover:text-ink'}>
          {icon}
        </span>
        <span>{label}</span>
      </div>

      {badge ? (
        <span
          className={`text-[12px] tabular-nums font-medium px-2 py-0.5 rounded ${
            isActive
              ? 'bg-[var(--color-accent)] text-[#FAF7F2]'
              : 'bg-surface border border-border text-ink-muted'
          }`}
        >
          {badge}
        </span>
      ) : (
        isActive && <ChevronRight className="w-4 h-4 text-[var(--color-accent)] stroke-[1.5]" />
      )}
    </button>
  );
}
