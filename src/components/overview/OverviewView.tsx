'use client';

import React from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { formatCurrency } from '@/domain/budget/format';
import { daysUntilEvent, getNextMilestone } from '@/domain/timeline/generate';
import { WeddingMotif, BirthdayMotif, CommunityMotif, OrnamentalDivider } from '@/components/icons/EventMotifs';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  PieChart,
  ListTodo,
  Palette,
} from 'lucide-react';

export function OverviewView() {
  const { plan, setActiveTab } = usePlan();

  if (!plan) return null;

  const daysRemaining = daysUntilEvent(plan.eventDate);
  const nextMilestone = getNextMilestone(plan.timeline);
  const actualMinorTotal = plan.budget.categories.reduce((acc, c) => acc + c.actualMinorUnits, 0);
  const completedMilestones = plan.timeline.milestones.filter((m) => m.status === 'done').length;
  const bookedVendors = plan.checklist.items.filter((i) => i.status === 'booked').length;

  const getEventIcon = () => {
    switch (plan.eventType) {
      case 'wedding':
        return <WeddingMotif className="w-8 h-8 text-[var(--color-accent)]" />;
      case 'birthday':
        return <BirthdayMotif className="w-8 h-8 text-[var(--color-accent)]" />;
      case 'community':
        return <CommunityMotif className="w-8 h-8 text-[var(--color-accent)]" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Hero Editorial Header */}
      <div className="relative p-6 sm:p-8 rounded-xl bg-surface border border-border overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              {getEventIcon()}
              <Badge variant="accent" className="capitalize">
                {plan.eventType} Edition
              </Badge>
              {plan.isAIGenerated ? (
                <Badge variant="neutral" icon={<Sparkles className="w-3 h-3" />}>AI Synthesized</Badge>
              ) : (
                <Badge variant="neutral">Curated Template</Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-ink tracking-tight">
              {plan.eventName}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-ink-muted pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-ink-subtle" />
                {plan.eventDate} ({daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Today'})
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-ink-subtle" />
                {plan.guestCount} guests
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-ink-subtle" />
                {plan.city}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end justify-center border-t md:border-t-0 md:border-l border-border/80 pt-4 md:pt-0 md:pl-8">
            <span className="text-xs uppercase font-mono tracking-wider text-ink-muted">Total Budget</span>
            <span className="text-3xl sm:text-4xl font-serif text-ink tabular-nums font-semibold mt-1">
              {formatCurrency(plan.budgetMinorUnits, plan.currency)}
            </span>
            <span className="text-xs text-ink-muted mt-1">
              {formatCurrency(actualMinorTotal, plan.currency)} actual recorded
            </span>
          </div>
        </div>

        {plan.style && (
          <div className="mt-6 pt-4 border-t border-border/60 text-xs text-ink-muted italic">
            Aesthetic direction: &ldquo;{plan.style}&rdquo;
          </div>
        )}
      </div>

      {/* 4 Problem Statement Pillar Cards */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-4">
          Core Planning Systems
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Budgets */}
          <Card
            onClick={() => setActiveTab('budget')}
            className="group cursor-pointer hover:border-[var(--color-accent)] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-md bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
                  <PieChart className="w-5 h-5" />
                </div>
                <Badge variant="neutral">{plan.budget.categories.length} categories</Badge>
              </div>
              <h3 className="font-serif font-semibold text-lg text-ink group-hover:text-[var(--color-accent)] transition-colors">
                1. Budget & Allocation
              </h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Dynamic linked sliders rebalancing in integer units. Donut visualization with spend vs actual warnings.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent)] mt-4 pt-3 border-t border-border/50">
              <span>Manage Budget</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Card>

          {/* 2. Timelines */}
          <Card
            onClick={() => setActiveTab('timeline')}
            className="group cursor-pointer hover:border-[var(--color-accent)] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-md bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
                  <Clock className="w-5 h-5" />
                </div>
                <Badge variant="neutral">{completedMilestones}/{plan.timeline.milestones.length} done</Badge>
              </div>
              <h3 className="font-serif font-semibold text-lg text-ink group-hover:text-[var(--color-accent)] transition-colors">
                2. Backward Timeline
              </h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Chronological roadmap backward from your event date. Gantt view, accessible rescheduling, and ICS export.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent)] mt-4 pt-3 border-t border-border/50">
              <span>View Timeline</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Card>

          {/* 3. Vendor Checklists */}
          <Card
            onClick={() => setActiveTab('checklist')}
            className="group cursor-pointer hover:border-[var(--color-accent)] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-md bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
                  <ListTodo className="w-5 h-5" />
                </div>
                <Badge variant="neutral">{bookedVendors} booked</Badge>
              </div>
              <h3 className="font-serif font-semibold text-lg text-ink group-hover:text-[var(--color-accent)] transition-colors">
                3. Vendor Checklist
              </h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Procurement pipeline with negotiation questions per vendor type. Recorded quotes feed actual spend.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent)] mt-4 pt-3 border-t border-border/50">
              <span>Open Checklist</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Card>

          {/* 4. Personalized Ideas */}
          <Card
            onClick={() => setActiveTab('ideas')}
            className="group cursor-pointer hover:border-[var(--color-accent)] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-md bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
                  <Palette className="w-5 h-5" />
                </div>
                <Badge variant="neutral">{plan.ideas.colorPalettes.length} palettes</Badge>
              </div>
              <h3 className="font-serif font-semibold text-lg text-ink group-hover:text-[var(--color-accent)] transition-colors">
                4. Personalized Ideas
              </h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Contrast-tested color swatches, culinary menus with allergen care, and day-of itinerary scheduling.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent)] mt-4 pt-3 border-t border-border/50">
              <span>Explore Ideas</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Card>
        </div>
      </div>

      <OrnamentalDivider />

      {/* Next Upcoming Action Card */}
      {nextMilestone && (
        <Card className="p-6 border-l-4 border-l-[var(--color-accent)] bg-surface/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
                Next Upcoming Milestone
              </span>
              <h3 className="text-xl font-serif text-ink mt-0.5">{nextMilestone.label}</h3>
              {nextMilestone.description && (
                <p className="text-xs text-ink-muted mt-1 max-w-xl">{nextMilestone.description}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-mono font-semibold text-ink block">{nextMilestone.dueDate}</span>
                <span className="text-xs text-ink-muted font-mono">{nextMilestone.weeksBeforeEvent} weeks prior</span>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setActiveTab('timeline')}>
                Timeline
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
