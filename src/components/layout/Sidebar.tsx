'use client';

import React from 'react';
import { usePlan, type PlanTab } from '@/lib/context/PlanContext';
import {
  LayoutDashboard,
  PieChart,
  Clock,
  ListTodo,
  Palette,
  MessageSquare,
  Copy,
  ChevronRight,
} from 'lucide-react';

export function Sidebar() {
  const { activeTab, setActiveTab, plan, scenarioPlan } = usePlan();

  const navItems: Array<{ id: PlanTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'budget', label: 'Budget & Sliders', icon: <PieChart className="w-4 h-4" /> },
    { id: 'timeline', label: 'Timeline & Gantt', icon: <Clock className="w-4 h-4" /> },
    { id: 'checklist', label: 'Vendor Pipeline', icon: <ListTodo className="w-4 h-4" /> },
    { id: 'ideas', label: 'Creative Ideas', icon: <Palette className="w-4 h-4" /> },
    { id: 'copilot', label: 'Planning Copilot', icon: <MessageSquare className="w-4 h-4" /> },
    {
      id: 'compare',
      label: 'Scenario Compare',
      icon: <Copy className="w-4 h-4" />,
      badge: scenarioPlan ? 'Active' : undefined,
    },
  ];

  return (
    <aside
      className="hidden md:flex flex-col w-64 shrink-0 hairline-r bg-paper p-4 text-left select-none min-h-[calc(100vh-72px)] sticky top-18"
      aria-label="Primary Navigation"
    >
      <div className="space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-widest text-ink-muted px-3 mb-2 block">
          Planning Modules
        </span>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-md text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-semibold'
                  : 'text-ink-muted hover:bg-surface hover:text-ink'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-[var(--color-accent)]' : 'text-ink-subtle'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge ? (
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--color-accent)] text-white">
                  {item.badge}
                </span>
              ) : (
                isActive && <ChevronRight className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Plan Meta Footer */}
      {plan && (
        <div className="mt-auto pt-6 border-t border-border/60 text-xs text-ink-muted space-y-1 px-3">
          <span className="text-[10px] font-mono uppercase text-ink-subtle block">Active Session</span>
          <p className="font-serif text-ink font-semibold truncate">{plan.eventName}</p>
          <p className="font-mono text-[11px] text-ink-muted">{plan.city}</p>
        </div>
      )}
    </aside>
  );
}
