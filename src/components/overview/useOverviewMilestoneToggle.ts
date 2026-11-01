'use client';

import { useState } from 'react';
import type { Plan } from '@/domain/schemas/plan';
import type { MilestoneStatus } from '@/domain/schemas/timeline';

export function useOverviewMilestoneToggle(
  plan: Plan,
  updatePlan: (updater: (prev: Plan) => Plan) => void,
) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastCompletedMilestoneId, setLastCompletedMilestoneId] = useState<string | null>(null);

  const handleToggleMilestone = (milestoneId: string) => {
    const target = plan.timeline.milestones.find((m) => m.id === milestoneId);
    if (!target) return;

    const nextStatus: MilestoneStatus =
      target.status === 'completed' || target.status === 'done' ? 'pending' : 'completed';

    const updated = plan.timeline.milestones.map((m) =>
      m.id === milestoneId ? { ...m, status: nextStatus } : m,
    );

    updatePlan((prev) => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        milestones: updated,
      },
    }));

    if (target.status !== 'completed' && target.status !== 'done') {
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

  return {
    toastMessage,
    handleToggleMilestone,
    handleUndoMilestone,
  };
}
