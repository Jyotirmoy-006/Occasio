'use client';

import React, { useState } from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { daysUntilEvent } from '@/domain/timeline/generate';
import { getMoodImages } from '@/content/images';
import { OrnamentalDivider } from '@/components/icons/EventMotifs';
import { CheckCircle2, RotateCcw } from 'lucide-react';

import { OverviewHero } from './OverviewHero';
import { OverviewDeadlinesSection } from './OverviewDeadlinesSection';
import { OverviewHealthSection, type HealthAlert } from './OverviewHealthSection';
import { OverviewBudgetSnapshot, type DonutSegment } from './OverviewBudgetSnapshot';
import { OverviewVendorSnapshot } from './OverviewVendorSnapshot';
import { OverviewCreativePreview } from './OverviewCreativePreview';

const PHASE_ORDER = ['Foundation', 'Sourcing & Design', 'Detailing & Logistics', 'Final Week & Day-Of'] as const;

function getPhaseLabel(phase?: string): typeof PHASE_ORDER[number] {
  const p = (phase || '').toLowerCase();
  if (p.includes('1') || p.includes('foundation') || p.includes('concept') || p.includes('charter')) return 'Foundation';
  if (p.includes('2') || p.includes('design') || p.includes('sourcing') || p.includes('invitations') || p.includes('programming')) return 'Sourcing & Design';
  if (p.includes('3') || p.includes('logistics') || p.includes('coordination') || p.includes('operations')) return 'Detailing & Logistics';
  return 'Final Week & Day-Of';
}

const SEGMENT_COLORS = [
  '#2D5016', // Forest / primary accent
  '#8A6A12', // Antique gold / brass
  '#7A3112', // Terracotta
  '#1F5F7A', // Deep teal
  '#57524C', // Ink muted
  '#8A5A00', // Caution amber
  '#A8A29E', // Warm stone / other
];

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

  const milestonesByPhase = PHASE_ORDER.reduce<Record<string, typeof activeMilestones>>((acc, phaseName) => {
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

  const donutSegments: DonutSegment[] = top6.map((c, i) => ({
    id: c.id,
    label: c.label,
    amountMinor: c.allocatedMinorUnits,
    percent: totalBudgetMinor > 0 ? (c.allocatedMinorUnits / totalBudgetMinor) * 100 : 0,
    color: SEGMENT_COLORS[i] || '#8FAF8F',
  }));

  if (remainingCats.length > 0 && otherMinor > 0) {
    donutSegments.push({
      id: 'other',
      label: 'Other Categories',
      amountMinor: otherMinor,
      percent: totalBudgetMinor > 0 ? (otherMinor / totalBudgetMinor) * 100 : 0,
      color: SEGMENT_COLORS[6] || '#A8A29E',
    });
  }

  // Pure rule-based Plan Health Alerts
  const healthAlerts: HealthAlert[] = [];
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

  const provenanceLabel =
    plan.ideas.provenance?.source === 'demo_engine'
      ? 'Demo engine'
      : plan.isAIGenerated
      ? `Generated by Gemini${plan.ideas.provenance?.modelId ? ` (${plan.ideas.provenance.modelId})` : ''}`
      : plan.ideas.provenance?.source === 'user_edited'
      ? 'Edited by you'
      : 'Sample plan';

  const moodImages = getMoodImages(plan.eventType);
  const featuredMood = moodImages[0];
  const activePalette = plan.ideas.colorPalettes[0];
  const featuredTheme = plan.ideas.themes[0];
  const sampleMenu = plan.ideas.menuIdeas.slice(0, 2);

  // Calculate cumulative circumferences for 7 planned segments donut
  const circumference = 2 * Math.PI * 40; // r=40
  const segmentsWithOffsets = donutSegments.reduce<
    Array<DonutSegment & { segLength: number; offset: number }>
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

      {/* Hero Band */}
      <OverviewHero
        plan={plan}
        daysRemaining={daysRemaining}
        totalBudgetMinor={totalBudgetMinor}
        provenanceLabel={provenanceLabel}
      />

      {/* Editorial 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Next Up Milestones & Plan Health */}
        <section className="lg:col-span-8 space-y-6" aria-labelledby="section-next-up">
          <OverviewDeadlinesSection
            activeMilestones={activeMilestones}
            milestonesByPhase={milestonesByPhase}
            todayStr={todayStr}
            now={now}
            onToggleMilestone={handleToggleMilestone}
            onNavigateTimeline={() => setActiveTab('timeline')}
          />

          <OverviewHealthSection healthAlerts={healthAlerts} />
        </section>

        {/* Right 4 Cols: Budget Snapshot Donut & Vendor Pipeline */}
        <section className="lg:col-span-4 space-y-6" aria-labelledby="section-budget-snapshot">
          <OverviewBudgetSnapshot
            totalBudgetMinor={totalBudgetMinor}
            committedMinor={committedMinor}
            remainingMinor={remainingMinor}
            committedPercent={committedPercent}
            currency={plan.currency}
            donutSegments={donutSegments}
            segmentsWithOffsets={segmentsWithOffsets}
            circumference={circumference}
            onNavigateBudget={() => setActiveTab('budget')}
          />

          <OverviewVendorSnapshot
            pipelineCounts={pipelineCounts}
            totalCategories={totalCategories}
            onNavigateChecklist={() => setActiveTab('checklist')}
          />
        </section>
      </div>

      {/* Hairline Ornamental Divider */}
      <OrnamentalDivider eventType={plan.eventType} />

      {/* Section V: Creative Ideas Preview with Mood Photo & Palette */}
      <OverviewCreativePreview
        provenanceLabel={provenanceLabel}
        featuredMood={featuredMood}
        activePalette={activePalette}
        featuredTheme={featuredTheme}
        sampleMenu={sampleMenu}
        onNavigateIdeas={() => setActiveTab('ideas')}
      />
    </div>
  );
}
