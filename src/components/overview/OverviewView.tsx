'use client';

import React, { useState } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { formatMoney, formatEventDate, pluralize } from '@/lib/format';
import { daysUntilEvent } from '@/domain/timeline/generate';
import { WeddingMotif, BirthdayMotif, CommunityMotif, OrnamentalDivider } from '@/components/icons/EventMotifs';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

export function OverviewView() {
  const { plan, updatePlan, setActiveTab } = usePlan();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastCompletedMilestoneId, setLastCompletedMilestoneId] = useState<string | null>(null);

  if (!plan) return null;

  const daysRemaining = daysUntilEvent(plan.eventDate);
  const totalBudgetMinor = plan.budgetMinorUnits;
  const committedMinor = plan.budget.categories.reduce((acc, c) => acc + c.actualMinorUnits, 0);
  const remainingMinor = Math.max(0, totalBudgetMinor - committedMinor);
  const committedPercent = totalBudgetMinor > 0 ? Math.min(100, Math.round((committedMinor / totalBudgetMinor) * 100)) : 0;

  // Timeline completion
  const totalMilestones = plan.timeline.milestones.length;
  const completedMilestones = plan.timeline.milestones.filter((m) => m.status === 'done' || m.status === 'completed').length;
  const milestoneProgressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Next 5 pending/in-progress milestones
  const activeMilestones = plan.timeline.milestones
    .filter((m) => m.status === 'pending' || m.status === 'in-progress')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  // Vendor pipeline counts
  const pipelineCounts = {
    'to-contact': plan.checklist.items.filter((c) => c.status === 'to-contact').length,
    contacted: plan.checklist.items.filter((c) => c.status === 'contacted').length,
    quoted: plan.checklist.items.filter((c) => c.status === 'quoted').length,
    booked: plan.checklist.items.filter((c) => c.status === 'booked').length,
  };
  const totalCategories = Math.max(1, plan.checklist.items.length);

  // Deterministic rule-based Plan Health Alerts computed in pure code
  const healthAlerts: Array<{ id: string; type: 'warning' | 'info' | 'success'; message: string }> = [];

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const overdueMilestones = plan.timeline.milestones.filter(
    (m) => (m.status === 'pending' || m.status === 'in-progress') && m.dueDate < todayStr,
  );
  if (overdueMilestones.length > 0) {
    healthAlerts.push({
      id: 'overdue-milestones',
      type: 'warning',
      message: `${overdueMilestones.length} milestone${overdueMilestones.length > 1 ? 's are' : ' is'} past due date.`,
    });
  }

  const venueCategory = plan.checklist.items.find((c) => c.vendorType.toLowerCase().includes('venue'));
  if (venueCategory && venueCategory.status !== 'booked' && daysRemaining <= 60) {
    healthAlerts.push({
      id: 'venue-unbooked',
      type: 'warning',
      message: `Critical path: Venue is not booked with ${daysRemaining} days left before the celebration.`,
    });
  }

  if (committedPercent >= 90) {
    healthAlerts.push({
      id: 'budget-warning',
      type: 'warning',
      message: `Committed spend has reached ${committedPercent}% of total budget.`,
    });
  }

  const cateringCategory = plan.checklist.items.find((c) => c.vendorType.toLowerCase().includes('catering'));
  if (cateringCategory && cateringCategory.status === 'to-contact' && daysRemaining <= 45) {
    healthAlerts.push({
      id: 'catering-warning',
      type: 'warning',
      message: `Catering inquiries pending — tasting and booking contracts due within 45 days.`,
    });
  }

  if (healthAlerts.length === 0) {
    healthAlerts.push({
      id: 'all-clear',
      type: 'success',
      message: 'Plan health is optimal. Timeline milestones and budget commitments are on schedule.',
    });
  }

  // Handle milestone checkbox toggle
  const handleToggleMilestone = (milestoneId: string) => {
    updatePlan((prev) => ({
      ...prev,
      timeline: {
        milestones: prev.timeline.milestones.map((m) =>
          m.id === milestoneId ? { ...m, status: 'done' as const } : m,
        ),
      },
    }));
    setLastCompletedMilestoneId(milestoneId);
    setToastMessage('Milestone marked complete.');
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleUndoMilestone = () => {
    if (!lastCompletedMilestoneId) return;
    updatePlan((prev) => ({
      ...prev,
      timeline: {
        milestones: prev.timeline.milestones.map((m) =>
          m.id === lastCompletedMilestoneId ? { ...m, status: 'pending' as const } : m,
        ),
      },
    }));
    setLastCompletedMilestoneId(null);
    setToastMessage(null);
  };

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

  // Honest source label (A6)
  const provenanceLabel = plan.ideas.provenance?.label || (plan.isAIGenerated ? 'Generated by Gemini' : 'Demo engine');

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Undo Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 p-4 rounded-lg bg-ink text-paper shadow-xl border border-border flex items-center gap-3 animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-[#186333]" />
          <span className="text-sm">{toastMessage}</span>
          <button
            onClick={handleUndoMilestone}
            className="ml-2 text-xs font-semibold text-[var(--color-accent-highlight)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Undo
          </button>
        </div>
      )}

      {/* Hero Band */}
      <section
        className="relative p-6 sm:p-8 rounded-xl bg-surface border border-border overflow-hidden"
        aria-label="Event Summary"
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              {getEventIcon()}
              <span className="text-xs font-sans font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
                {plan.eventType}
              </span>
              <span className="text-xs font-sans text-ink-muted px-2 py-0.5 rounded bg-paper border border-border">
                {provenanceLabel}
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
              {plan.eventName}
            </h2>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-ink-muted">
              <span className="flex items-center gap-1.5 font-medium text-ink">
                <Calendar className="w-4 h-4 stroke-[1.5] text-ink-subtle" />
                {formatEventDate(plan.eventDate, { includeRelative: true })}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 stroke-[1.5] text-ink-subtle" />
                {plan.city}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 stroke-[1.5] text-ink-subtle" />
                {pluralize(plan.guestCount, 'guest')}
              </span>
            </div>
          </div>

          {/* Right Hero Metric: Countdown & Total Budget */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 shrink-0 pt-2 w-full md:w-auto">
            <div className="text-left md:text-right">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
                Total Budget
              </span>
              <span className="font-serif text-2xl sm:text-4xl font-bold text-ink tabular-nums">
                {formatMoney(totalBudgetMinor, plan.currency, { hideZeroCents: true })}
              </span>
            </div>

            <div className="text-left md:text-right space-y-1">
              <span className="text-xs text-ink-muted font-medium">
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Event Day'}
              </span>
              <div
                className="w-28 sm:w-36 h-2 rounded-full bg-border overflow-hidden"
                role="progressbar"
                aria-valuenow={milestoneProgressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Milestone Completion Progress"
              >
                <div
                  className="h-full bg-[var(--color-accent)] transition-all duration-300"
                  style={{ width: `${milestoneProgressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-ink-muted block text-left md:text-right">
                {completedMilestones} of {totalMilestones} milestones complete
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Next Up & Plan Health */}
        <section className="lg:col-span-8 space-y-6" aria-labelledby="section-next-up">
          {/* Next Up Milestones */}
          <div className="p-6 rounded-xl bg-paper border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 id="section-next-up" className="font-serif text-xl font-bold text-ink">
                  Next Up
                </h3>
                <p className="text-xs text-ink-muted">
                  Immediate deadlines scheduled backward from your event date.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('timeline')}
                className="text-xs font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeMilestones.length === 0 ? (
              <p className="text-sm text-ink-muted py-4 italic">
                All milestones are currently marked as complete!
              </p>
            ) : (
              <ul className="space-y-3" aria-label="Upcoming Milestones">
                {activeMilestones.map((milestone) => {
                  const isOverdue = milestone.dueDate < todayStr;
                  const diffDays = Math.round(
                    (new Date(milestone.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
                  );
                  const isDueSoon = !isOverdue && diffDays <= 7;

                  return (
                    <li
                      key={milestone.id}
                      className="p-3.5 rounded-lg bg-surface border border-border flex items-center justify-between gap-4 transition-colors hover:border-border-dark"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Interactive Completion Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleToggleMilestone(milestone.id)}
                          aria-label={`Mark "${milestone.label}" as complete`}
                          className="w-5 h-5 rounded border border-border hover:border-[var(--color-accent)] flex items-center justify-center cursor-pointer bg-paper text-transparent hover:text-[var(--color-accent)] transition-all shrink-0"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">
                            {milestone.label}
                          </p>
                          <p className="text-xs text-ink-muted">
                            Due {formatEventDate(milestone.dueDate)}
                          </p>
                        </div>
                      </div>

                      {/* Icon + Text Status Badge (Never Color Alone) */}
                      <div className="shrink-0">
                        {isOverdue ? (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#9E1C1C] px-2 py-0.5 rounded bg-[#FDF0F0] border border-[#9E1C1C]/20">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Overdue
                          </span>
                        ) : isDueSoon ? (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#8A4500] px-2 py-0.5 rounded bg-[#FEF3E2] border border-[#8A4500]/20">
                            <Clock className="w-3.5 h-3.5" />
                            Due Soon
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-ink-muted px-2 py-0.5 rounded bg-paper border border-border">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#186333]" />
                            On Schedule
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Plan Health (Computed in Pure Code) */}
          <div className="p-6 rounded-xl bg-paper border border-border shadow-xs space-y-3">
            <h3 className="font-serif text-lg font-bold text-ink">
              Plan Health & Advisory
            </h3>
            <p className="text-xs text-ink-muted">
              Rule-based checks verifying milestone lead times and budget capacity.
            </p>

            <ul className="space-y-2.5" aria-label="Plan Health Alerts">
              {healthAlerts.map((alert) => (
                <li
                  key={alert.id}
                  className={`p-3 rounded-md flex items-start gap-2.5 text-xs ${
                    alert.type === 'warning'
                      ? 'bg-[#FEF3E2] text-[#8A4500] border border-[#8A4500]/30'
                      : 'bg-[#E8F5EC] text-[#186333] border border-[#186333]/30'
                  }`}
                >
                  {alert.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{alert.message}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Right 4 Cols: Budget Snapshot & Vendor Pipeline */}
        <section className="lg:col-span-4 space-y-6" aria-labelledby="section-budget-snapshot">
          {/* Budget Snapshot Donut */}
          <div className="p-6 rounded-xl bg-paper border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 id="section-budget-snapshot" className="font-serif text-lg font-bold text-ink">
                Budget Snapshot
              </h3>
              <button
                onClick={() => setActiveTab('budget')}
                className="text-xs font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual Donut representation */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {/* Background track: Remaining */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#E5DDD5" strokeWidth="4" />
                  {/* Foreground stroke: Committed Spend */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="4"
                    strokeDasharray={`${committedPercent} ${100 - committedPercent}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-bold text-base text-ink tabular-nums">
                    {committedPercent}%
                  </span>
                  <span className="text-[10px] text-ink-muted uppercase">Committed</span>
                </div>
              </div>
            </div>

            {/* Accessible Table Alternative */}
            <table className="w-full text-xs" aria-label="Budget Breakdown Summary">
              <tbody>
                <tr className="border-b border-border py-1.5 flex justify-between">
                  <td className="text-ink-muted">Total Planned</td>
                  <td className="font-semibold tabular-nums text-ink">
                    {formatMoney(totalBudgetMinor, plan.currency, { hideZeroCents: true })}
                  </td>
                </tr>
                <tr className="border-b border-border py-1.5 flex justify-between">
                  <td className="text-ink-muted">Committed (Quotes)</td>
                  <td className="font-semibold tabular-nums text-ink">
                    {formatMoney(committedMinor, plan.currency, { hideZeroCents: true })}
                  </td>
                </tr>
                <tr className="py-1.5 flex justify-between">
                  <td className="text-ink-muted">Unallocated / Remaining</td>
                  <td className="font-semibold tabular-nums text-ink">
                    {formatMoney(remainingMinor, plan.currency, { hideZeroCents: true })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Vendor Pipeline Stacked Bar */}
          <div className="p-6 rounded-xl bg-paper border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-ink">
                Vendor Pipeline
              </h3>
              <button
                onClick={() => setActiveTab('checklist')}
                className="text-xs font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Clickable Stacked Bar segments */}
            <div
              className="w-full h-4 rounded-full overflow-hidden flex bg-border cursor-pointer"
              onClick={() => setActiveTab('checklist')}
              title="Click to view full vendor pipeline"
            >
              <div
                style={{ width: `${(pipelineCounts['to-contact'] / totalCategories) * 100}%` }}
                className="bg-[#6E665E] transition-all hover:opacity-80"
                title={`To Contact: ${pipelineCounts['to-contact']}`}
              />
              <div
                style={{ width: `${(pipelineCounts['contacted'] / totalCategories) * 100}%` }}
                className="bg-[#8A4500] transition-all hover:opacity-80"
                title={`Contacted: ${pipelineCounts['contacted']}`}
              />
              <div
                style={{ width: `${(pipelineCounts['quoted'] / totalCategories) * 100}%` }}
                className="bg-[var(--color-accent-highlight)] transition-all hover:opacity-80"
                title={`Quoted: ${pipelineCounts['quoted']}`}
              />
              <div
                style={{ width: `${(pipelineCounts['booked'] / totalCategories) * 100}%` }}
                className="bg-[#186333] transition-all hover:opacity-80"
                title={`Booked: ${pipelineCounts['booked']}`}
              />
            </div>

            {/* Legend with interactive buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setActiveTab('checklist')}
                className="p-1.5 rounded bg-surface hover:bg-surface-raised flex items-center justify-between text-left cursor-pointer"
              >
                <span className="flex items-center gap-1.5 text-ink-muted">
                  <span className="w-2 h-2 rounded-full bg-[#6E665E]" />
                  To Contact
                </span>
                <span className="font-bold tabular-nums text-ink">
                  {pipelineCounts['to-contact']}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('checklist')}
                className="p-1.5 rounded bg-surface hover:bg-surface-raised flex items-center justify-between text-left cursor-pointer"
              >
                <span className="flex items-center gap-1.5 text-ink-muted">
                  <span className="w-2 h-2 rounded-full bg-[#8A4500]" />
                  Contacted
                </span>
                <span className="font-bold tabular-nums text-ink">
                  {pipelineCounts['contacted']}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('checklist')}
                className="p-1.5 rounded bg-surface hover:bg-surface-raised flex items-center justify-between text-left cursor-pointer"
              >
                <span className="flex items-center gap-1.5 text-ink-muted">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent-highlight)]" />
                  Quoted
                </span>
                <span className="font-bold tabular-nums text-ink">
                  {pipelineCounts['quoted']}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('checklist')}
                className="p-1.5 rounded bg-surface hover:bg-surface-raised flex items-center justify-between text-left cursor-pointer"
              >
                <span className="flex items-center gap-1.5 text-ink-muted">
                  <span className="w-2 h-2 rounded-full bg-[#186333]" />
                  Booked
                </span>
                <span className="font-bold tabular-nums text-ink">
                  {pipelineCounts['booked']}
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Hairline Ornamental Divider (A4: Replaces stray "-o-") */}
      <OrnamentalDivider eventType={plan.eventType} />

      {/* Bottom Section: Ideas Preview */}
      <section className="p-6 sm:p-8 rounded-xl bg-surface border border-border space-y-4" aria-label="Creative Ideas Preview">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-xl font-bold text-ink">
                Personalized Creative Ideas
              </h3>
              <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-paper border border-border text-ink-muted">
                {provenanceLabel}
              </span>
            </div>
            <p className="text-xs text-ink-muted">
              Curated themes, contrast-verified color palettes, and catering concepts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveTab('ideas')}
              className="min-h-[44px] gap-1"
            >
              <span>Open Ideas Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Color Palette Swatch Strip */}
        {plan.ideas.colorPalettes && plan.ideas.colorPalettes.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
              Color Palette: {plan.ideas.colorPalettes[0].name}
            </span>
            <div className="flex h-10 rounded-lg overflow-hidden border border-border">
              {plan.ideas.colorPalettes[0].swatches.map((swatch, idx) => (
                <div
                  key={idx}
                  style={{ backgroundColor: swatch.hex, color: swatch.textColor }}
                  className="flex-1 flex items-center justify-center text-[11px] font-medium px-1 select-none"
                  title={`${swatch.name} (${swatch.hex})`}
                >
                  <span className="truncate">{swatch.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two Sample Menu / Activity Concept Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {plan.ideas.themes && plan.ideas.themes[0] && (
            <div className="p-4 rounded-lg bg-paper border border-border space-y-1.5">
              <span className="text-[10px] font-sans font-semibold uppercase text-ink-muted block">
                Atmosphere & Theme
              </span>
              <p className="text-sm font-semibold text-ink">
                {plan.ideas.themes[0].content}
              </p>
            </div>
          )}

          {plan.ideas.menuIdeas && plan.ideas.menuIdeas[0] && (
            <div className="p-4 rounded-lg bg-paper border border-border space-y-1.5">
              <span className="text-[10px] font-sans font-semibold uppercase text-ink-muted block">
                Catering Concept
              </span>
              <p className="text-sm font-semibold text-ink">
                {plan.ideas.menuIdeas[0].content}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
