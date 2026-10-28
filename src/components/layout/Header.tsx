'use client';

import React, { useState, useEffect } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { Button } from '@/components/ui/Button';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { ExportModal } from '@/components/export/ExportModal';
import { ShortcutsModal } from '@/components/ui/ShortcutsModal';
import { Plus, Download, Keyboard } from 'lucide-react';

interface AiHealthData {
  status: string;
  demoMode: boolean;
  aiStatus: 'ai_live' | 'demo_no_key' | 'ai_unavailable_fallback';
  label: string;
  tooltip: string;
  model: string | null;
}

export function Header() {
  const { undo, redo, canUndo, canRedo, activeTab, plan } = usePlan();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [health, setHealth] = useState<AiHealthData>({
    status: 'ok',
    demoMode: true,
    aiStatus: 'demo_no_key',
    label: 'Checking AI...',
    tooltip: 'Checking server AI connectivity...',
    model: null,
  });

  // Fetch real AI health state from server
  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setHealth(data);
          }
        }
      } catch {
        if (isMounted) {
          setHealth({
            status: 'ok',
            demoMode: true,
            aiStatus: 'demo_no_key',
            label: 'Demo mode (no key)',
            tooltip: 'Running deterministic templates. Set GEMINI_API_KEY for live AI.',
            model: null,
          });
        }
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => {
      isMounted = false;
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
        className="hairline-b bg-paper sticky top-0 z-30 h-[72px] flex items-center justify-between px-3 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden"
        role="banner"
      >
        {/* Left: Mobile Brand & Active View Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          {/* Mobile-only logo mark */}
          <div className="md:hidden flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-md bg-[var(--color-accent)] text-paper flex items-center justify-center font-serif text-lg font-bold select-none shrink-0">
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
              <span className="text-[11px] font-sans capitalize px-2 py-0.5 rounded-full bg-surface border border-border text-ink-muted shrink-0">
                {plan.eventType}
              </span>
            )}
          </div>
        </div>

        {/* Right Tools: Status Pill, Shortcuts, Export, New Plan */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Real State Status Pill (A5) */}
          <div
            className="group relative flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full bg-surface border border-border text-[11px] sm:text-[12px] font-medium text-ink cursor-help select-none shrink-0"
            title={health.tooltip}
            aria-label={`AI Status: ${health.label}`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                health.aiStatus === 'ai_live'
                  ? 'bg-[#186333] shadow-[0_0_6px_rgba(24,99,51,0.6)]'
                  : health.aiStatus === 'ai_unavailable_fallback'
                  ? 'bg-[#8A4500]'
                  : 'bg-[#6E665E]'
              }`}
            />
            <span className="hidden sm:inline">{health.label}</span>
            <span className="sm:hidden text-[11px]">
              {health.aiStatus === 'ai_live' ? 'Live' : 'Demo'}
            </span>

            {/* Accessible Hover/Focus Tooltip */}
            <div
              role="tooltip"
              className="absolute right-0 top-full mt-2 hidden group-hover:block group-focus:block w-64 p-2 bg-ink text-paper text-[12px] rounded shadow-md z-50 pointer-events-none"
            >
              {health.tooltip}
            </div>
          </div>

          {/* Shortcuts Button - desktop/tablet (A7) */}
          <div className="relative group hidden sm:block">
            <button
              onClick={() => setIsShortcutsOpen(true)}
              aria-label="Keyboard shortcuts, press ?"
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-surface text-ink-muted hover:text-ink transition-colors cursor-pointer border border-transparent hover:border-border"
            >
              <Keyboard className="w-4 h-4 stroke-[1.5]" />
            </button>
            <div
              role="tooltip"
              className="absolute right-0 top-full mt-1 hidden group-hover:block whitespace-nowrap p-1.5 bg-ink text-[#FAF7F2] text-[11px] rounded shadow z-50 pointer-events-none"
            >
              Keyboard shortcuts, press ?
            </div>
          </div>

          {/* Export Action - desktop/tablet */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsExportOpen(true)}
            className="hidden sm:inline-flex gap-2 min-h-[44px] text-sm"
          >
            <Download className="w-4 h-4 stroke-[1.5]" />
            <span>Export</span>
          </Button>

          {/* New Plan Action */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsOnboardingOpen(true)}
            aria-label="New Plan"
            className="gap-1 min-h-[36px] sm:min-h-[44px] px-2.5 sm:px-3 text-xs sm:text-sm shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[1.5]" />
            <span className="hidden sm:inline">New Plan</span>
            <span className="sm:hidden">New</span>
          </Button>
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
