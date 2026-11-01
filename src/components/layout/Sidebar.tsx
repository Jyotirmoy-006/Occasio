'use client';

import React from 'react';
import { usePlan, type PlanTab } from '@/lib/context/PlanContext';
import { useReduceDecoration } from '@/lib/useReduceDecoration';
import { Tooltip } from '@/components/ui/Tooltip';
import type { Plan } from '@/domain/schemas/plan';
import {
  LayoutDashboard,
  PieChart,
  Clock,
  ListTodo,
  Palette,
  MessageSquare,
  Copy,
  EyeOff,
  Eye,
} from 'lucide-react';
import { SidebarNavItem } from './SidebarNavItem';

function computeSidebarBadges(plan: Plan | null, scenarioPlan: Plan | null) {
  if (!plan) {
    return {
      timelineBadge: undefined,
      checklistBadge: undefined,
      scenarioBadge: scenarioPlan ? 'Active' : undefined,
    };
  }

  const milestones = plan.timeline.milestones;
  const completed = milestones.filter((m) => m.status === 'completed').length;
  const totalM = milestones.length;

  const items = plan.checklist.items;
  const booked = items.filter((c) => c.status === 'booked').length;
  const totalV = items.length;

  return {
    timelineBadge: totalM > 0 ? `${completed}/${totalM}` : undefined,
    checklistBadge: totalV > 0 ? `${booked}/${totalV}` : undefined,
    scenarioBadge: scenarioPlan ? 'Active' : undefined,
  };
}

export function Sidebar() {
  const { activeTab, setActiveTab, plan, scenarioPlan } = usePlan();
  const { reduceDecoration, toggle: toggleReduceDecoration } = useReduceDecoration();

  const badges = computeSidebarBadges(plan, scenarioPlan);

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
      badge: badges.timelineBadge,
    },
    {
      id: 'checklist',
      label: 'Vendor Pipeline',
      icon: <ListTodo className="w-5 h-5 stroke-[1.5]" />,
      badge: badges.checklistBadge,
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
      badge: badges.scenarioBadge,
    },
  ];

  return (
    <aside
      className="hidden md:flex flex-col w-[264px] shrink-0 hairline-r sidebar-woven select-none h-screen sticky top-0 z-40 bg-paper"
      aria-label="Primary Navigation"
    >
      <div className="h-[72px] hairline-b flex items-center px-6 gap-3 bg-paper">
        <div className="w-9 h-9 rounded-full bg-[var(--color-accent)] text-[#FAF7F2] flex items-center justify-center font-serif text-xl font-bold select-none shadow-xs border-2 border-[var(--color-foil,#C59B27)] relative">
          <span>O</span>
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-2xl font-bold tracking-tight text-ink leading-tight">
            Occasio
          </span>
          <span className="text-[12px] font-sans font-semibold tracking-wider uppercase text-ink-muted">
            Stationery & Event Arts
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Planning Modules">
        <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted px-3.5 mb-2 block">
          Planning Modules
        </span>

        {navItems.map((item) => (
          <SidebarNavItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            badge={item.badge}
            isActive={activeTab === item.id}
            onSelect={setActiveTab}
          />
        ))}
      </nav>

      <div className="p-4 hairline-t bg-paper flex items-center justify-between">
        <Tooltip content="Toggle paper grain, stacked cards, and foil textures for a flat minimalist view">
          <button
            type="button"
            onClick={toggleReduceDecoration}
            aria-pressed={reduceDecoration}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-border hover:border-ink-muted text-xs text-ink-muted hover:text-ink transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <div className="flex items-center gap-2">
              {reduceDecoration ? (
                <EyeOff className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-ink-subtle" />
              )}
              <span className="font-sans">
                {reduceDecoration ? 'Decoration: Minimal' : 'Decoration: Rich'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-ink-subtle uppercase">
              {reduceDecoration ? 'On' : 'Off'}
            </span>
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
