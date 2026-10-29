'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { usePlan } from '@/lib/context/PlanContext';
import { formatMoney, formatEventDate, pluralize } from '@/lib/format';
import { daysUntilEvent } from '@/domain/timeline/generate';
import { getHeroImage, getMoodImages } from '@/content/images';
import {
  WeddingMotif,
  BirthdayMotif,
  CommunityMotif,
  OrnamentalDivider,
  CornerFlourish,
} from '@/components/icons/EventMotifs';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
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

  // Next 5 pending/in-progress milestones
  const activeMilestones = plan.timeline.milestones
    .filter((m) => m.status === 'pending' || m.status === 'in-progress')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  // Group next 5 milestones under 4 canonical phases
  const phaseOrder = ['Foundation', 'Sourcing & Design', 'Detailing & Logistics', 'Final Week & Day-Of'] as const;
  function getPhaseLabel(phase?: string): typeof phaseOrder[number] {
    const p = (phase || '').toLowerCase();
    if (p.includes('1') || p.includes('foundation') || p.includes('concept') || p.includes('charter')) return 'Foundation';
    if (p.includes('2') || p.includes('design') || p.includes('sourcing') || p.includes('invitations') || p.includes('programming')) return 'Sourcing & Design';
    if (p.includes('3') || p.includes('logistics') || p.includes('coordination') || p.includes('operations')) return 'Detailing & Logistics';
    return 'Final Week & Day-Of';
  }

  const milestonesByPhase = phaseOrder.reduce<Record<string, typeof activeMilestones>>((acc, phaseName) => {
    const items = activeMilestones.filter((m) => getPhaseLabel(m.phase) === phaseName);
    if (items.length > 0) acc[phaseName] = items;
    return acc;
  }, {});

  // Vendor pipeline counts
  const pipelineCounts = {
    'to-contact': plan.checklist.items.filter((c) => c.status === 'to-contact').length,
    contacted: plan.checklist.items.filter((c) => c.status === 'contacted').length,
    quoted: plan.checklist.items.filter((c) => c.status === 'quoted').length,
    booked: plan.checklist.items.filter((c) => c.status === 'booked').length,
  };
  const totalCategories = Math.max(1, plan.checklist.items.length);

  // 7 Planned segments for Budget snapshot donut
  const sortedCategories = [...plan.budget.categories].sort((a, b) => b.allocatedMinorUnits - a.allocatedMinorUnits);
  const top6 = sortedCategories.slice(0, 6);
  const remainingCats = sortedCategories.slice(6);
  const otherMinor = remainingCats.reduce((sum, c) => sum + c.allocatedMinorUnits, 0);

  const segmentColors = [
    '#2D5016', // Forest / primary accent
    '#8A6A12', // Antique gold / brass
    '#7A3112', // Terracotta
    '#1F5F7A', // Deep teal
    '#57524C', // Ink muted
    '#8A5A00', // Caution amber
    '#A8A29E', // Warm stone / other
  ];

  const donutSegments: Array<{ id: string; label: string; amountMinor: number; percent: number; color: string }> = top6.map((c, i) => ({
    id: c.id,
    label: c.label,
    amountMinor: c.allocatedMinorUnits,
    percent: totalBudgetMinor > 0 ? (c.allocatedMinorUnits / totalBudgetMinor) * 100 : 0,
    color: segmentColors[i] || '#8FAF8F',
  }));

  if (remainingCats.length > 0 && otherMinor > 0) {
    donutSegments.push({
      id: 'other',
      label: 'Other Categories',
      amountMinor: otherMinor,
      percent: totalBudgetMinor > 0 ? (otherMinor / totalBudgetMinor) * 100 : 0,
      color: segmentColors[6] || '#A8A29E',
    });
  }

  // Pure rule-based Plan Health Alerts
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
      message: `Committed spend has reached ${committedPercent}% of total planned budget.`,
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
      message: 'Plan timeline and budget health are on track with no critical alerts.',
    });
  }

  const handleToggleMilestone = (milestoneId: string) => {
    const updated = plan.timeline.milestones.map((m) => {
      if (m.id === milestoneId) {
        const nextStatus = m.status === 'completed' || m.status === 'done' ? 'pending' : 'completed';
        return { ...m, status: nextStatus as 'completed' | 'pending' };
      }
      return m;
    });

    const target = plan.timeline.milestones.find((m) => m.id === milestoneId);
    updatePlan((prev) => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        milestones: updated,
      },
    }));

    if (target && target.status !== 'completed' && target.status !== 'done') {
      setLastCompletedMilestoneId(milestoneId);
      setToastMessage(`Marked "${target.label}" as complete.`);
      setTimeout(() => {
        setToastMessage((cur) => (cur?.includes(target.label) ? null : cur));
      }, 5000);
    }
  };

  const handleUndoMilestone = () => {
    if (!lastCompletedMilestoneId) return;
    const restored = plan.timeline.milestones.map((m) =>
      m.id === lastCompletedMilestoneId ? { ...m, status: 'pending' as const } : m,
    );
    updatePlan((prev) => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        milestones: restored,
      },
    }));
    setLastCompletedMilestoneId(null);
    setToastMessage(null);
  };

  const getEventIcon = () => {
    switch (plan.eventType) {
      case 'wedding':
        return <WeddingMotif className="w-8 h-8 text-[#FAF7F2]" />;
      case 'birthday':
        return <BirthdayMotif className="w-8 h-8 text-[#FAF7F2]" />;
      case 'community':
        return <CommunityMotif className="w-8 h-8 text-[#FAF7F2]" />;
    }
  };

  const provenanceLabel =
    plan.ideas.provenance?.source === 'demo_engine'
      ? 'Demo engine'
      : plan.isAIGenerated
      ? `Generated by Gemini${plan.ideas.provenance?.modelId ? ` (${plan.ideas.provenance.modelId})` : ''}`
      : plan.ideas.provenance?.source === 'user_edited'
      ? 'Edited by you'
      : 'Sample plan';

  const heroImg = getHeroImage(plan.eventType);
  const moodImages = getMoodImages(plan.eventType);
  const featuredMood = moodImages[0];
  const activePalette = plan.ideas.colorPalettes[0];
  const featuredTheme = plan.ideas.themes[0];
  const sampleMenu = plan.ideas.menuIdeas.slice(0, 2);

  // Calculate cumulative circumferences for 7 planned segments donut
  const circumference = 2 * Math.PI * 40; // r=40
  const segmentsWithOffsets = donutSegments.reduce<
    Array<(typeof donutSegments)[number] & { segLength: number; offset: number }>
  >((acc, seg) => {
    const prevOffset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].segLength : 0;
    const segLength = (seg.percent / 100) * circumference;
    return [...acc, { ...seg, segLength, offset: prevOffset }];
  }, []);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Undo Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 p-4 rounded-lg bg-ink text-[#FAF7F2] shadow-2xl border border-border flex items-center gap-3 animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-[#2F6B4F]" />
          <span className="text-sm">{toastMessage}</span>
          <button
            onClick={handleUndoMilestone}
            className="ml-2 text-xs font-semibold text-[var(--color-foil-dark,#D9B65B)] hover:underline flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Undo
          </button>
        </div>
      )}

      {/* Hero Band: Solid Deep Base Color + Arch Image + Countdown Seal (P0-1 & P1) */}
      <section
        className="hero-surface rounded-2xl p-6 sm:p-10 relative overflow-hidden"
        aria-label="Event Summary"
      >
        {/* Corner Flourishes */}
        <CornerFlourish position="top-left" eventType={plan.eventType} className="w-7 h-7 absolute top-3 left-3 text-white/30" />
        <CornerFlourish position="top-right" eventType={plan.eventType} className="w-7 h-7 absolute top-3 right-3 text-white/30" />
        <CornerFlourish position="bottom-left" eventType={plan.eventType} className="w-7 h-7 absolute bottom-3 left-3 text-white/30" />
        <CornerFlourish position="bottom-right" eventType={plan.eventType} className="w-7 h-7 absolute bottom-3 right-3 text-white/30" />

        {/* Mobile 16:9 Banner Crop (0 CLS) */}
        <div className="md:hidden w-full aspect-[16/9] rounded-xl overflow-hidden relative mb-5 border border-white/20 shadow-inner">
          <Image
            src={heroImg.src}
            alt={heroImg.alt}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
            priority
            placeholder="blur"
            blurDataURL={heroImg.blurDataUrl}
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          {/* Left Column: Title, Metadata, Ledger Line */}
          <div className="space-y-4 max-w-2xl flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              {getEventIcon()}
              <span className="text-[12px] font-sans font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-white/15 text-[#FAF7F2] border border-white/20">
                {plan.eventType}
              </span>
              <span className="text-[12px] font-sans text-[#FAF7F2]/90 px-2.5 py-0.5 rounded bg-black/30 border border-white/20">
                {provenanceLabel}
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF7F2] letterpress-dark leading-tight">
              {plan.eventName}
            </h2>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-[#FAF7F2]/90 pt-1">
              <span className="flex items-center gap-2 font-medium text-[#FAF7F2]">
                <Calendar className="w-4 h-4 stroke-[1.5] text-[#FAF7F2]/75 shrink-0" />
                {formatEventDate(plan.eventDate, { includeRelative: true })}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 stroke-[1.5] text-[#FAF7F2]/75 shrink-0" />
                {plan.city}
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 stroke-[1.5] text-[#FAF7F2]/75 shrink-0" />
                {pluralize(plan.guestCount, 'guest')}
              </span>
            </div>

            {/* Total Budget Ledger Line in On-Dark Gold Foil */}
            <div className="pt-4 border-t border-white/15 flex flex-wrap items-baseline gap-3">
              <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-[#FAF7F2]/80">
                Total Planned Budget
              </span>
              <span className="font-serif text-2xl sm:text-4xl font-bold text-[#FAF7F2] tabular-nums foil-accent foil-accent-dark">
                {formatMoney(totalBudgetMinor, plan.currency, { hideZeroCents: true })}
              </span>
            </div>
          </div>

          {/* Right Column: Tall Arch Photo (4:5) + Countdown Medallion Seal (Desktop) */}
          <div className="hidden md:block relative shrink-0 w-64 lg:w-72">
            <div className="p-1.5 border border-white/25 rounded-t-[140px] rounded-b-xl bg-black/10">
              <div className="rounded-t-[136px] rounded-b-lg overflow-hidden relative aspect-[4/5] shadow-inner bg-black/20">
                <Image
                  src={heroImg.src}
                  alt={heroImg.alt}
                  width={800}
                  height={1000}
                  className="w-full h-full object-cover"
                  priority
                  placeholder="blur"
                  blurDataURL={heroImg.blurDataUrl}
                />
              </div>
            </div>

            {/* Circular Countdown Medallion Seal Overlapping Lower-Left Edge */}
            <div className="absolute -bottom-3 -left-3 w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-[var(--color-card,#FFFDF8)] text-ink border-2 border-[var(--color-foil-dark,#D9B65B)] shadow-xl flex flex-col items-center justify-center p-1.5 text-center select-none z-20">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[var(--color-accent)] leading-none tabular-nums">
                {daysRemaining > 0 ? daysRemaining : '★'}
              </span>
              <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted mt-0.5">
                {daysRemaining > 0 ? 'Days' : 'Today'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Next Up Milestones & Plan Health */}
        <section className="lg:col-span-8 space-y-6" aria-labelledby="section-next-up">
          {/* I. Next Up Milestones (Grouped by 4 Phases, Next 5 Only) */}
          <div className="paper-sheet paper-sheet-hover p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 hairline-b">
              <div>
                <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
                  I. Milestones & Agenda
                </span>
                <h3 id="section-next-up" className="font-serif text-xl sm:text-2xl font-bold text-ink letterpress-display">
                  Immediate Deadlines
                </h3>
                <p className="text-sm text-ink-muted">
                  Backward-scheduled from celebration day (snapped to weekdays).
                </p>
              </div>

              <Tooltip content="Open full milestone Gantt timeline">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className="text-sm font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                >
                  <span>View Timeline</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>

            {activeMilestones.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-24 h-24 mx-auto opacity-70">
                  <Image src="/images/empty/milestones.svg" alt="" width={96} height={96} />
                </div>
                <p className="text-sm text-ink-muted italic">All scheduled milestones are complete!</p>
              </div>
            ) : (
              <div className="space-y-4" aria-label="Upcoming Milestones by Phase">
                {Object.entries(milestonesByPhase).map(([phaseName, items]) => (
                  <div key={phaseName} className="space-y-2">
                    <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted px-1 block">
                      {phaseName}
                    </span>
                    <ul className="space-y-2.5">
                      {items.map((milestone) => {
                        const isOverdue = milestone.dueDate < todayStr;
                        const diffDays = Math.round(
                          (new Date(milestone.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
                        );
                        const isDueSoon = !isOverdue && diffDays <= 14;

                        return (
                          <li
                            key={milestone.id}
                            className="p-3.5 rounded-lg bg-[var(--color-inset,#F1EADC)] border border-border flex items-center justify-between gap-4 transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-card,#FFFDF8)]"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                type="button"
                                onClick={() => handleToggleMilestone(milestone.id)}
                                aria-label={`Mark "${milestone.label}" as complete`}
                                className="w-5 h-5 rounded border border-border hover:border-[var(--color-accent)] flex items-center justify-center cursor-pointer bg-[var(--color-card,#FFFDF8)] text-transparent hover:text-[var(--color-accent)] transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>

                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-ink truncate">
                                  {milestone.label}
                                </p>
                                <p className="text-xs text-ink-muted">
                                  Due {formatEventDate(milestone.dueDate, { includeRelative: true })}
                                </p>
                              </div>
                            </div>

                            {/* Status Tag ONLY when due within 14 days or overdue */}
                            <div className="shrink-0">
                              {isOverdue ? (
                                <span className="flex items-center gap-1 text-[12px] font-semibold text-[var(--color-danger,#9B2C2C)] px-2.5 py-1 rounded bg-[var(--color-danger-bg,#FDEEED)] border border-[var(--color-danger,#9B2C2C)]/20">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  Overdue
                                </span>
                              ) : isDueSoon ? (
                                <span className="flex items-center gap-1 text-[12px] font-semibold text-[var(--color-caution,#8A5A00)] px-2.5 py-1 rounded bg-[var(--color-caution-bg,#FCF6E8)] border border-[var(--color-caution,#8A5A00)]/20">
                                  <Clock className="w-3.5 h-3.5" />
                                  Due Soon
                                </span>
                              ) : null}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* II. Plan Health Advisory */}
          <div className="paper-sheet paper-sheet-hover p-6 sm:p-7 space-y-3">
            <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
              II. Health & Advisory
            </span>
            <h3 className="font-serif text-xl font-bold text-ink letterpress-display">
              Plan Health Audit
            </h3>
            <p className="text-sm text-ink-muted">
              Rule-based evaluation of contract milestones, vendor statuses, and budget buffer.
            </p>

            <ul className="space-y-2.5 pt-1" aria-label="Plan Health Alerts">
              {healthAlerts.map((alert) => (
                <li
                  key={alert.id}
                  className={`p-3.5 rounded-lg flex items-start gap-3 text-xs sm:text-sm leading-relaxed ${
                    alert.type === 'warning'
                      ? 'bg-[var(--color-caution-bg,#FCF6E8)] text-[var(--color-caution,#8A5A00)] border border-[var(--color-caution,#8A5A00)]/30'
                      : 'bg-[var(--color-success-bg,#EAF3EE)] text-[var(--color-success,#2F6B4F)] border border-[var(--color-success,#2F6B4F)]/30'
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

        {/* Right 4 Cols: Budget Snapshot Donut & Vendor Pipeline */}
        <section className="lg:col-span-4 space-y-6" aria-labelledby="section-budget-snapshot">
          {/* III. Budget Snapshot Donut (7 Planned Segments + Committed Inner Ring) */}
          <div className="paper-sheet paper-sheet-hover p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 hairline-b">
              <div>
                <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
                  III. Financial Ledger
                </span>
                <h3 id="section-budget-snapshot" className="font-serif text-xl font-bold text-ink letterpress-display">
                  Budget Snapshot
                </h3>
              </div>
              <Tooltip content="Open full budget with linked sliders">
                <button
                  onClick={() => setActiveTab('budget')}
                  className="text-sm font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>

            {/* Visual SVG Donut: 7 Planned Segments Outer Ring + Committed Inner Ring */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Outer Planned Ring Segments */}
                  {segmentsWithOffsets.map((seg) => (
                    <circle
                      key={seg.id}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="8"
                      strokeDasharray={`${seg.segLength} ${circumference - seg.segLength}`}
                      strokeDashoffset={-seg.offset}
                    />
                  ))}

                  {/* Thin Inner Ring for Committed Spend */}
                  <circle
                    cx="50"
                    cy="50"
                    r="28"
                    fill="none"
                    stroke="#E6DFD5"
                    strokeWidth="3"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="28"
                    fill="none"
                    stroke="var(--color-foil-dark, #D9B65B)"
                    strokeWidth="3"
                    strokeDasharray={`${(committedPercent / 100) * (2 * Math.PI * 28)} ${2 * Math.PI * 28}`}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Center Total Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                  <span className="font-serif text-base font-bold text-ink tabular-nums leading-tight">
                    {formatMoney(totalBudgetMinor, plan.currency, { hideZeroCents: true })}
                  </span>
                  <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted">
                    {committedPercent}% Quoted
                  </span>
                </div>
              </div>
            </div>

            {/* Accessible Summary Table: Total, Committed, Remaining */}
            <table className="w-full text-xs sm:text-sm" aria-label="Budget Breakdown Summary">
              <tbody>
                <tr className="border-b border-border py-2 flex justify-between">
                  <td className="text-ink-muted">Total Planned Budget</td>
                  <td className="font-semibold tabular-nums text-ink">
                    {formatMoney(totalBudgetMinor, plan.currency, { hideZeroCents: true })}
                  </td>
                </tr>
                <tr className="border-b border-border py-2 flex justify-between">
                  <td className="text-ink-muted">Committed (Quotes)</td>
                  <td className="font-semibold tabular-nums text-ink">
                    {formatMoney(committedMinor, plan.currency, { hideZeroCents: true })}
                  </td>
                </tr>
                <tr className="py-2 flex justify-between">
                  <td className="text-ink-muted">Remaining (Uncommitted)</td>
                  <td className="font-semibold tabular-nums text-ink">
                    {formatMoney(remainingMinor, plan.currency, { hideZeroCents: true })}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 7 Segments Interactive Legend */}
            <div className="pt-2 border-t border-border grid grid-cols-1 gap-1.5 text-xs">
              {donutSegments.map((seg) => (
                <div key={seg.id} className="flex items-center justify-between text-ink-muted">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="truncate">{seg.label}</span>
                  </div>
                  <span className="font-semibold tabular-nums text-ink shrink-0 ml-2">
                    {Math.round(seg.percent)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* IV. Vendor Pipeline Stacked Bar */}
          <div className="paper-sheet paper-sheet-hover p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 hairline-b">
              <div>
                <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
                  IV. Vendor Procurement
                </span>
                <h3 className="font-serif text-xl font-bold text-ink letterpress-display">
                  Sourcing Pipeline
                </h3>
              </div>
              <Tooltip content="Open vendor checklist & quotes manager">
                <button
                  onClick={() => setActiveTab('checklist')}
                  className="text-sm font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                >
                  <span>Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>

            {/* Clickable Stacked Bar segments */}
            <div
              className="w-full h-4 rounded-full overflow-hidden flex bg-border cursor-pointer shadow-inner"
              onClick={() => setActiveTab('checklist')}
              title="Click to view full vendor pipeline"
            >
              <div
                style={{ width: `${(pipelineCounts['to-contact'] / totalCategories) * 100}%` }}
                className="bg-[#57524C] transition-all hover:opacity-85"
                title={`To Contact: ${pipelineCounts['to-contact']}`}
              />
              <div
                style={{ width: `${(pipelineCounts['contacted'] / totalCategories) * 100}%` }}
                className="bg-[#8A5A00] transition-all hover:opacity-85"
                title={`Contacted: ${pipelineCounts['contacted']}`}
              />
              <div
                style={{ width: `${(pipelineCounts['quoted'] / totalCategories) * 100}%` }}
                className="bg-[var(--color-foil-dark,#D9B65B)] transition-all hover:opacity-85"
                title={`Quoted: ${pipelineCounts['quoted']}`}
              />
              <div
                style={{ width: `${(pipelineCounts['booked'] / totalCategories) * 100}%` }}
                className="bg-[#2F6B4F] transition-all hover:opacity-85"
                title={`Booked: ${pipelineCounts['booked']}`}
              />
            </div>

            {/* Legend buttons linking to filtered pipeline */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setActiveTab('checklist')}
                className="p-2 rounded bg-surface hover:bg-surface-raised flex items-center justify-between text-left cursor-pointer border border-transparent hover:border-border transition-colors"
              >
                <span className="flex items-center gap-1.5 text-ink-muted">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#57524C]" />
                  To Contact
                </span>
                <span className="font-bold tabular-nums text-ink">
                  {pipelineCounts['to-contact']}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('checklist')}
                className="p-2 rounded bg-surface hover:bg-surface-raised flex items-center justify-between text-left cursor-pointer border border-transparent hover:border-border transition-colors"
              >
                <span className="flex items-center gap-1.5 text-ink-muted">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8A5A00]" />
                  Contacted
                </span>
                <span className="font-bold tabular-nums text-ink">
                  {pipelineCounts['contacted']}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('checklist')}
                className="p-2 rounded bg-surface hover:bg-surface-raised flex items-center justify-between text-left cursor-pointer border border-transparent hover:border-border transition-colors"
              >
                <span className="flex items-center gap-1.5 text-ink-muted">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-foil-dark,#D9B65B)]" />
                  Quoted
                </span>
                <span className="font-bold tabular-nums text-ink">
                  {pipelineCounts['quoted']}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('checklist')}
                className="p-2 rounded bg-surface hover:bg-surface-raised flex items-center justify-between text-left cursor-pointer border border-transparent hover:border-border transition-colors"
              >
                <span className="flex items-center gap-1.5 text-ink-muted">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2F6B4F]" />
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

      {/* Hairline Ornamental Divider */}
      <OrnamentalDivider eventType={plan.eventType} />

      {/* Section V: Creative Ideas Preview with Mood Photo & Palette */}
      <section className="paper-sheet paper-sheet-hover p-6 sm:p-8 space-y-6" aria-label="Creative Ideas Preview">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 hairline-b">
          <div>
            <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
              V. Styling & Concepts
            </span>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-2xl font-bold text-ink letterpress-display">
                Curated Aesthetics
              </h3>
              <span className="text-[12px] font-sans px-2.5 py-0.5 rounded bg-surface border border-border text-ink-muted">
                {provenanceLabel}
              </span>
            </div>
            <p className="text-sm text-ink-muted">
              Palette harmony, atmosphere narrative, and bespoke culinary concepts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveTab('ideas')}
              className="min-h-[44px] gap-1 px-4 text-sm"
            >
              <span>Open Ideas Studio</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 2-Column Showcase: Left Featured Mood Photo, Right Palette & Concepts */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Mood Image */}
          {featuredMood && (
            <div className="md:col-span-5 space-y-2">
              <div className="stationery-frame bg-[var(--color-card,#FFFDF8)]">
                <div className="stationery-frame-inner overflow-hidden rounded-md relative aspect-[4/3]">
                  <Image
                    src={featuredMood.src}
                    alt={featuredMood.alt}
                    width={800}
                    height={600}
                    className="w-full h-full object-cover"
                    placeholder="blur"
                    blurDataURL={featuredMood.blurDataUrl}
                  />
                </div>
              </div>
              <p className="text-xs text-ink-muted italic px-1">
                Aesthetic Direction: {featuredMood.label || 'Editorial Styling'}
              </p>
            </div>
          )}

          {/* Right Column: Palette & Concepts */}
          <div className="md:col-span-7 space-y-5">
            {/* 5-Color Palette Swatch Strip */}
            {activePalette && (
              <div className="space-y-2">
                <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
                  Color Palette: {activePalette.name}
                </span>
                <div className="flex h-12 rounded-lg overflow-hidden border border-border shadow-xs">
                  {activePalette.swatches.map((swatch, idx) => (
                    <div
                      key={idx}
                      style={{ backgroundColor: swatch.hex, color: swatch.textColor }}
                      className="flex-1 flex flex-col items-center justify-center text-[12px] font-semibold px-1 select-none text-center"
                      title={`${swatch.name} (${swatch.hex})`}
                    >
                      <span className="truncate max-w-full">{swatch.name}</span>
                      <span className="text-[12px] opacity-80 uppercase tabular-nums">{swatch.hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Theme Narrative Card */}
            {featuredTheme && (
              <div className="p-4 rounded-lg bg-[var(--color-inset,#F1EADC)] border border-border space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-sans font-semibold uppercase text-ink-muted tracking-wider">
                    Atmosphere & Narrative
                  </span>
                  {featuredTheme.styleTags && featuredTheme.styleTags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {featuredTheme.styleTags.map((t, idx) => (
                        <span key={idx} className="text-[12px] font-sans font-semibold px-2 py-0.5 rounded-full bg-paper border border-border text-ink-muted">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-ink leading-relaxed drop-cap">
                  {featuredTheme.content}
                </p>
              </div>
            )}

            {/* Culinary Concepts */}
            {sampleMenu.length > 0 && (
              <div className="space-y-2">
                <span className="text-[12px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
                  Curated Menu Highlights
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sampleMenu.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-lg bg-[var(--color-card,#FFFDF8)] border border-border space-y-1">
                      {item.course && (
                        <span className="text-[12px] font-sans font-semibold uppercase px-2 py-0.5 rounded bg-[var(--color-inset,#F1EADC)] text-ink-muted inline-block">
                          {item.course}
                        </span>
                      )}
                      <p className="text-xs sm:text-sm text-ink leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
