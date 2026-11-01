'use client';

import React from 'react';
import { usePlan } from '@/lib/context/PlanContext';
import { daysUntilEvent } from '@/domain/timeline/generate';
import { getMoodImages } from '@/content/images';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { OrnamentalDivider } from '@/components/icons/EventMotifs';
import {
  computePlanHealthAlerts,
  groupMilestonesByPhase,
  computeDonutSegments,
  getProvenanceLabel,
  type DonutSegment,
} from '@/domain/plan/health';
import { useOverviewMilestoneToggle } from './useOverviewMilestoneToggle';

import { OverviewHero } from './OverviewHero';
import { OverviewDeadlinesSection } from './OverviewDeadlinesSection';
import { OverviewHealthSection } from './OverviewHealthSection';
import { OverviewBudgetSnapshot } from './OverviewBudgetSnapshot';
import { OverviewVendorSnapshot } from './OverviewVendorSnapshot';
import { OverviewCreativePreview } from './OverviewCreativePreview';

export function OverviewView() {
  const { plan, updatePlan, setActiveTab } = usePlan();

  if (!plan) return null;

  return <OverviewContent plan={plan} updatePlan={updatePlan} setActiveTab={setActiveTab} />;
}

interface OverviewContentProps {
  plan: NonNullable<ReturnType<typeof usePlan>['plan']>;
  updatePlan: ReturnType<typeof usePlan>['updatePlan'];
  setActiveTab: ReturnType<typeof usePlan>['setActiveTab'];
}

function OverviewContent({ plan, updatePlan, setActiveTab }: OverviewContentProps) {
  const { toastMessage, handleToggleMilestone, handleUndoMilestone } =
    useOverviewMilestoneToggle(plan, updatePlan);

  const daysRemaining = daysUntilEvent(plan.eventDate);
  const totalBudgetMinor = plan.budgetMinorUnits;
  const committedMinor = plan.budget.categories.reduce((acc, c) => acc + c.actualMinorUnits, 0);
  const remainingMinor = Math.max(0, totalBudgetMinor - committedMinor);
  const committedPercent =
    totalBudgetMinor > 0 ? Math.min(100, Math.round((committedMinor / totalBudgetMinor) * 100)) : 0;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0] ?? '';

  const activeMilestones = plan.timeline.milestones
    .filter((m) => m.status === 'pending' || m.status === 'in-progress')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const milestonesByPhase = groupMilestonesByPhase(plan.timeline.milestones);

  const pipelineCounts = {
    'to-contact': plan.checklist.items.filter((c) => c.status === 'to-contact').length,
    contacted: plan.checklist.items.filter((c) => c.status === 'contacted').length,
    quoted: plan.checklist.items.filter((c) => c.status === 'quoted').length,
    booked: plan.checklist.items.filter((c) => c.status === 'booked').length,
  };
  const totalCategories = Math.max(1, plan.checklist.items.length);

  const donutSegments = computeDonutSegments(plan);
  const healthAlerts = computePlanHealthAlerts(plan, daysRemaining, todayStr);

  const provenanceLabel = getProvenanceLabel(plan);
  const moodImages = getMoodImages(plan.eventType);
  const featuredMood = moodImages[0];
  const activePalette = plan.ideas.colorPalettes[0];
  const featuredTheme = plan.ideas.themes[0];
  const sampleMenu = plan.ideas.menuIdeas.slice(0, 2);

  const circumference = 2 * Math.PI * 40;
  const segmentsWithOffsets = donutSegments.reduce<
    Array<DonutSegment & { segLength: number; offset: number }>
  >((acc, seg) => {
    const prevOffset =
      acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].segLength : 0;
    const segLength = (seg.percent / 100) * circumference;
    return [...acc, { ...seg, segLength, offset: prevOffset }];
  }, []);

  return (
    <div className="space-y-8 animate-fade-in text-left">
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

      <OverviewHero
        plan={plan}
        daysRemaining={daysRemaining}
        totalBudgetMinor={totalBudgetMinor}
        provenanceLabel={provenanceLabel}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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

      <OrnamentalDivider eventType={plan.eventType} />

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
