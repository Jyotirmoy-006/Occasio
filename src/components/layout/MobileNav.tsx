'use client';

import React from 'react';
import { usePlan, type PlanTab } from '@/lib/context/PlanContext';
import { LayoutDashboard, PieChart, Clock, ListTodo, Palette, MessageSquare } from 'lucide-react';

export function MobileNav() {
  const { activeTab, setActiveTab } = usePlan();

  const navItems: Array<{ id: PlanTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'budget', label: 'Budget', icon: <PieChart className="w-5 h-5" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="w-5 h-5" /> },
    { id: 'checklist', label: 'Vendors', icon: <ListTodo className="w-5 h-5" /> },
    { id: 'ideas', label: 'Ideas', icon: <Palette className="w-5 h-5" /> },
    { id: 'copilot', label: 'Copilot', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper hairline-t flex items-center justify-around px-2 py-1 h-16 shadow-xs"
      aria-label="Mobile Navigation"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 cursor-pointer transition-colors ${
              isActive ? 'text-[var(--color-accent)] font-semibold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

