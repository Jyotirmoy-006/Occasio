'use client';

import React, { useState } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { Plus, Download, Keyboard } from 'lucide-react';
import dynamic from 'next/dynamic';
import { StatusPillPopover } from './StatusPillPopover';
import { useAiHealth } from './useAiHealth';
import { useGlobalShortcuts } from './useGlobalShortcuts';

const OnboardingModal = dynamic(
  () => import('@/components/onboarding/OnboardingModal').then((m) => m.OnboardingModal),
  { ssr: false },
);
const ExportModal = dynamic(
  () => import('@/components/export/ExportModal').then((m) => m.ExportModal),
  { ssr: false },
);
const ShortcutsModal = dynamic(
  () => import('@/components/ui/ShortcutsModal').then((m) => m.ShortcutsModal),
  { ssr: false },
);

const TAB_TITLES: Record<string, string> = {
  overview: 'Event Overview',
  budget: 'Budget & Sliders',
  timeline: 'Timeline & Milestones',
  checklist: 'Vendor Pipeline',
  ideas: 'Creative Ideas',
  copilot: 'Planning Copilot',
  compare: 'Scenario Comparison',
};

export function Header() {
  const { plan, undo, redo, canUndo, canRedo, activeTab } = usePlan();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const { health, isCheckingHealth, recheckHealth } = useAiHealth();

  useGlobalShortcuts({
    onToggleShortcuts: () => setIsShortcutsOpen((prev) => !prev),
    undo,
    redo,
    canUndo,
    canRedo,
  });

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <header
        className="hairline-b bg-paper sticky top-0 z-30 h-[72px] w-full px-4 sm:px-6 lg:px-8"
        role="banner"
      >
        <div className="max-w-[1360px] w-full mx-auto h-full flex items-center justify-between">
          {/* Left: Mobile Brand & Active View Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
            <div className="md:hidden flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-md bg-[var(--color-accent)] text-paper flex items-center justify-center font-serif text-lg font-bold select-none shrink-0 shadow-sm">
                O
              </div>
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-ink hidden sm:inline truncate">
                Occasio
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 min-w-0">
              <h1 className="font-serif text-xl font-semibold tracking-tight text-ink truncate">
                {TAB_TITLES[activeTab] || 'Planner'}
              </h1>
              {plan?.eventType && (
                <span className="text-[12px] font-sans font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-surface border border-border text-ink-muted shrink-0 hidden lg:inline">
                  {plan.eventType}
                </span>
              )}
            </div>
          </div>

          {/* Right Tools: Status Pill, Shortcuts, Export, New Plan */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-nowrap">
            <StatusPillPopover
              health={health}
              onRefresh={recheckHealth}
              isChecking={isCheckingHealth}
            />

            <div className="hidden sm:block">
              <Tooltip content="Keyboard shortcuts (?)">
                <button
                  type="button"
                  onClick={() => setIsShortcutsOpen(true)}
                  aria-label="Keyboard shortcuts, press ?"
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-surface text-ink-muted hover:text-ink transition-colors cursor-pointer border border-transparent hover:border-border focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                >
                  <Keyboard className="w-4 h-4 stroke-[1.5]" />
                </button>
              </Tooltip>
            </div>

            <Tooltip content="Export plan (CSV, ICS, JSON, PDF)">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsExportOpen(true)}
                aria-label="Export plan"
                className="gap-2 min-h-[44px] text-sm shrink-0 px-3"
              >
                <Download className="w-4 h-4 stroke-[1.5]" />
                <span className="hidden lg:inline font-sans">Export</span>
              </Button>
            </Tooltip>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsOnboardingOpen(true)}
              aria-label="New Plan Wizard"
              className="gap-1 min-h-[36px] sm:min-h-[44px] px-2.5 sm:px-3 text-xs sm:text-sm shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[1.5]" />
              <span className="hidden sm:inline">New Plan</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Modals */}
      {isOnboardingOpen && (
        <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
      )}
      {isExportOpen && (
        <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      )}
      {isShortcutsOpen && (
        <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      )}
    </>
  );
}
