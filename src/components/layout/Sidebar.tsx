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

  // Compute live counts
  const completedMilestones = plan?.timeline?.milestones?.filter((m) => m.status === 'completed').length ?? 0;
  const totalMilestones = plan?.timeline?.milestones?.length ?? 0;

  const bookedVendors = plan?.checklist?.items?.filter((c) => c.status === 'booked').length ?? 0;
  const totalVendors = plan?.checklist?.items?.length ?? 0;

  const navItems: Array<{
    id: PlanTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-5 h-5 stroke-[1.5]" />,
    },
    {
      id: 'budget',
      label: 'Budget & Sliders',
      icon: <PieChart className="w-5 h-5 stroke-[1.5]" />,
    },
    {
      id: 'timeline',
      label: 'Timeline & Gantt',
      icon: <Clock className="w-5 h-5 stroke-[1.5]" />,
      badge: totalMilestones > 0 ? `${completedMilestones}/${totalMilestones}` : undefined,
    },
    {
      id: 'checklist',
      label: 'Vendor Pipeline',
      icon: <ListTodo className="w-5 h-5 stroke-[1.5]" />,
      badge: totalVendors > 0 ? `${bookedVendors}/${totalVendors}` : undefined,
    },
    {
      id: 'ideas',
      label: 'Creative Ideas',
      icon: <Palette className="w-5 h-5 stroke-[1.5]" />,
    },
    {
      id: 'copilot',
      label: 'Planning Copilot',
      icon: <MessageSquare className="w-5 h-5 stroke-[1.5]" />,
    },
    {
      id: 'compare',
      label: 'Scenario Compare',
      icon: <Copy className="w-5 h-5 stroke-[1.5]" />,
      badge: scenarioPlan ? 'Active' : undefined,
    },
  ];

  return (
    <aside
      className="hidden md:flex flex-col w-[264px] shrink-0 hairline-r bg-paper select-none h-screen sticky top-0 z-40"
      aria-label="Primary Navigation"
    >
      {/* Top Logo Lockup (Aligned with Header: h-[72px], baseline aligned) */}
      <div className="h-[72px] hairline-b flex items-center px-6 gap-3">
        <div className="w-9 h-9 rounded-md bg-[var(--color-accent)] text-paper flex items-center justify-center font-serif text-xl font-bold select-none shadow-xs">
          O
        </div>
        <span className="font-serif text-2xl font-bold tracking-tight text-ink">Occasio</span>
      </div>

      {/* Navigation Modules */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Planning Modules">
        <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-ink-muted px-3.5 mb-2 block">
          Planning Modules
        </span>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-md text-sm font-medium flex items-center justify-between transition-colors cursor-pointer group ${
                isActive
                  ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-semibold'
                  : 'text-ink-muted hover:bg-surface hover:text-ink'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-[var(--color-accent)]' : 'text-ink-subtle group-hover:text-ink'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge ? (
                <span
                  className={`text-[11px] tabular-nums font-medium px-2 py-0.5 rounded ${
                    isActive
                      ? 'bg-[var(--color-accent)] text-paper'
                      : 'bg-surface border border-border text-ink-muted'
                  }`}
                >
                  {item.badge}
                </span>
              ) : (
                isActive && <ChevronRight className="w-4 h-4 text-[var(--color-accent)] stroke-[1.5]" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
