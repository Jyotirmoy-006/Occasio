'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { StatusPillPopover } from '@/components/layout/StatusPillPopover';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { ExportModal } from '@/components/export/ExportModal';
import { ShortcutsModal } from '@/components/ui/ShortcutsModal';
import { Plus, Download, Keyboard } from 'lucide-react';
import type { HealthResponse } from '@/app/api/health/route';

export function Header() {
  const { undo, redo, canUndo, canRedo, activeTab, plan } = usePlan();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [health, setHealth] = useState<HealthResponse>({
    status: 'ok',
    demoMode: true,
    aiStatus: 'demo_no_key',
    label: 'Checking AI...',
    tooltip: 'Checking server AI connectivity...',
    model: null,
    timestamp: '',
  });

  // Fetch real AI health state from server
  const fetchHealth = useCallback(async (force = false) => {
    setIsCheckingHealth(true);
    try {
      const url = force ? '/api/health?force=1' : '/api/health';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch {
      setHealth({
        status: 'ok',
        demoMode: true,
        aiStatus: 'unavailable_network_error',
        label: 'AI unavailable: network error',
        tooltip: 'Could not contact health check endpoint. Running on demo engine.',
        model: null,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const check = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok && !ignore) {
          const data = await res.json();
          setHealth(data);
        }
      } catch {
        if (!ignore) {
          setHealth({
            status: 'ok',
            demoMode: true,
            aiStatus: 'unavailable_network_error',
            label: 'AI unavailable: network error',
            tooltip: 'Could not contact health check endpoint. Running on demo engine.',
            model: null,
            timestamp: new Date().toISOString(),
          });
        }
      }
    };

    check();
    const interval = setInterval(check, 60000);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  // Global Keyboard shortcuts listener: Cmd/Ctrl+K, Cmd/Ctrl+Z, ?
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        if (!['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName) && canUndo) {
          e.preventDefault();
          undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        if (!['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName) && canRedo) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  const tabTitles: Record<string, string> = {
    overview: 'Event Overview',
    budget: 'Budget & Sliders',
    timeline: 'Timeline & Milestones',
    checklist: 'Vendor Pipeline',
    ideas: 'Creative Ideas',
    copilot: 'Planning Copilot',
    compare: 'Scenario Comparison',
  };

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
            {/* Mobile-only logo mark */}
            <div className="md:hidden flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-md bg-[var(--color-accent)] text-paper flex items-center justify-center font-serif text-lg font-bold select-none shrink-0 shadow-sm">
                O
              </div>
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-ink hidden sm:inline truncate">
                Occasio
              </span>
            </div>

            {/* Desktop Breadcrumb/Title */}
            <div className="hidden md:flex items-center gap-2 min-w-0">
              <h1 className="font-serif text-xl font-semibold tracking-tight text-ink truncate">
                {tabTitles[activeTab] || 'Planner'}
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
            {/* Real State Status Pill with Popover (1C) */}
            <StatusPillPopover
              health={health}
              onRefresh={() => fetchHealth(true)}
              isChecking={isCheckingHealth}
            />

            {/* Shortcuts Button - desktop/tablet (1A) */}
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

            {/* Export Action: Icon-only below 1024px, labeled text at 1024px+ (1B) */}
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

            {/* New Plan Action */}
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
