'use client';

import React, { useState, useEffect } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { ExportModal } from '@/components/export/ExportModal';
import { ShortcutsModal } from '@/components/ui/ShortcutsModal';
import { Plus, Download, Keyboard, Sparkles, AlertCircle } from 'lucide-react';

export function Header() {
  const { isDemoMode, undo, redo, canUndo, canRedo } = usePlan();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Global Keyboard shortcuts listener: Cmd/Ctrl+K, Cmd/Ctrl+Z, ?
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Open Onboarding or Shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
      // ?: Open Shortcuts
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
      // Cmd/Ctrl + Z: Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        if (!['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName) && canUndo) {
          e.preventDefault();
          undo();
        }
      }
      // Cmd/Ctrl + Shift + Z: Redo
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

  return (
    <>
      {/* Skip to Main Content Link for Screen Readers & Keyboard users */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <header
        className="hairline-b bg-paper sticky top-0 z-40 transition-colors"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[var(--color-accent)] text-paper flex items-center justify-center font-serif text-xl font-bold select-none shadow-xs">
              O
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-ink">Occasio</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-surface border border-border text-ink-muted hidden sm:inline-block">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-ink-muted -mt-0.5 hidden sm:block">
                GenAI Planning Assistant for Weddings, Birthdays & Community Events
              </p>
            </div>
          </div>

          {/* Center: Demo Mode or AI Live Badge */}
          <div className="hidden md:flex items-center gap-2">
            {isDemoMode ? (
              <Badge variant="warning" icon={<AlertCircle className="w-3.5 h-3.5" />}>
                Demo Mode (Deterministic Engine)
              </Badge>
            ) : (
              <Badge variant="accent" icon={<Sparkles className="w-3.5 h-3.5" />}>
                Gemini AI Connected
              </Badge>
            )}
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsShortcutsOpen(true)}
              aria-label="Keyboard Shortcuts (Press ? or Cmd+K)"
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-surface text-ink-muted hover:text-ink transition-colors cursor-pointer"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsExportOpen(true)}
              className="gap-2 min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsOnboardingOpen(true)}
              className="gap-2 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>New Plan</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Modals */}
      <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
      {isExportOpen && <ExportModal onClose={() => setIsExportOpen(false)} />}
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </>
  );
}
