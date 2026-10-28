'use client';

import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Tooltip } from '@/components/ui/Tooltip';
import { RefreshCw, X, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import type { HealthResponse } from '@/app/api/health/route';

interface StatusPillPopoverProps {
  health: HealthResponse;
  onRefresh: () => Promise<void>;
  isChecking?: boolean;
}

export function StatusPillPopover({ health, onRefresh, isChecking = false }: StatusPillPopoverProps) {
  const [open, setOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const isLive = health.aiStatus === 'live';
  const isNoKey = health.aiStatus === 'demo_no_key';

  const dotColor = isLive
    ? 'bg-[#186333] shadow-[0_0_6px_rgba(24,99,51,0.6)]'
    : isNoKey
    ? 'bg-[#8A4500]'
    : 'bg-[#991B1B]';

  const statusIcon = isLive ? (
    <CheckCircle2 className="w-4 h-4 text-[#186333]" />
  ) : isNoKey ? (
    <AlertTriangle className="w-4 h-4 text-[#8A4500]" />
  ) : (
    <AlertCircle className="w-4 h-4 text-[#991B1B]" />
  );

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Tooltip content="System AI connection status (click for details)">
        <Popover.Trigger asChild>
          <button
            type="button"
            className="group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-surface border border-border text-[12px] font-medium text-ink hover:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] select-none shrink-0 cursor-pointer transition-colors"
            aria-label={`AI Status: ${health.label}. Click to view details and verify connection.`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
            <span className="hidden sm:inline font-sans">{health.label}</span>
            <span className="sm:hidden font-sans text-[11px]">
              {isLive ? 'Live' : 'Demo'}
            </span>
          </button>
        </Popover.Trigger>
      </Tooltip>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={16}
          className="z-[90] w-80 p-4 bg-[#FAF7F2] text-[#1C1917] rounded-lg border border-[#DCD6CC] shadow-xl text-left font-sans data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 hairline-b">
            <div className="flex items-center gap-2">
              {statusIcon}
              <h3 className="font-serif text-sm font-semibold text-ink">
                AI Service Status
              </h3>
            </div>
            <Popover.Close asChild>
              <button
                type="button"
                className="p-1 rounded text-ink-muted hover:text-ink hover:bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                aria-label="Close status popover"
              >
                <X className="w-4 h-4" />
              </button>
            </Popover.Close>
          </div>

          {/* Body */}
          <div className="py-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Current state:</span>
              <span className="font-semibold text-ink">{health.label}</span>
            </div>

            <p className="text-ink-muted text-[12px] leading-relaxed pt-1">
              {health.tooltip}
            </p>

            <div className="p-2.5 rounded bg-surface border border-border space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-ink-muted">Active Model:</span>
                <span className="text-[11px] font-mono font-medium text-ink">
                  {health.model || 'Demo Engine (deterministic)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-ink-muted">Last Verified:</span>
                <span className="text-[11px] text-ink-muted tabular-nums">
                  {health.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'Just now'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Action: Check Again */}
          <div className="pt-2 hairline-t flex items-center justify-between">
            <span className="text-[11px] text-ink-muted">60s cached check</span>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || isChecking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-paper border border-border hover:border-[var(--color-accent)] text-ink text-xs font-medium transition-colors hover:bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing || isChecking ? 'animate-spin' : ''}`} />
              <span>{refreshing || isChecking ? 'Checking...' : 'Check again'}</span>
            </button>
          </div>

          <Popover.Arrow className="fill-[#FAF7F2]" width={12} height={6} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

