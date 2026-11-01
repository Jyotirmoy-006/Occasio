'use client';

import type { Plan } from '@/domain/schemas/plan';
import type { MilestoneStatus } from '@/domain/schemas/timeline';
import { parseLocalDate, formatISODate } from '@/domain/timeline/generate';
import { generateICS } from '@/domain/timeline/ics';

export function useTimelineActions(
  plan: Plan,
  updatePlan: (updater: (prev: Plan) => Plan) => void,
) {
  const { timeline, eventName } = plan;

  const handleStatusChange = (milestoneId: string, nextStatus: MilestoneStatus) => {
    updatePlan((prev) => ({
      ...prev,
      timeline: {
        milestones: prev.timeline.milestones.map((m) =>
          m.id === milestoneId ? { ...m, status: nextStatus } : m,
        ),
      },
    }));
  };

  const handleShiftMilestone = (milestoneId: string, daysShift: number) => {
    updatePlan((prev) => ({
      ...prev,
      timeline: {
        milestones: prev.timeline.milestones
          .map((m) => {
            if (m.id !== milestoneId) return m;
            const current = parseLocalDate(m.dueDate);
            const shifted = new Date(current.getTime() + daysShift * 24 * 60 * 60 * 1000);
            return {
              ...m,
              dueDate: formatISODate(shifted),
            };
          })
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
      },
    }));
  };

  const handleExportIcs = () => {
    const ics = generateICS(timeline, eventName);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventName.toLowerCase().replace(/\s+/g, '-')}-timeline.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    handleStatusChange,
    handleShiftMilestone,
    handleExportIcs,
  };
}
