import { describe, it, expect } from 'vitest';
import {
  generateTimeline,
  daysUntilEvent,
  getNextMilestone,
  parseLocalDate,
  formatISODate,
} from '@/domain/timeline/generate';

describe('Timeline Generation Domain Logic', () => {
  it('generates chronological milestones backward from future event date', () => {
    // 6 months in future
    const eventDate = '2027-06-15';
    const timeline = generateTimeline('wedding', eventDate);

    expect(timeline.milestones.length).toBeGreaterThan(0);

    // Milestones must be strictly sorted by dueDate ascending
    for (let i = 0; i < timeline.milestones.length - 1; i++) {
      expect(timeline.milestones[i]!.dueDate <= timeline.milestones[i + 1]!.dueDate).toBe(true);
    }

    // All milestones must have due dates on or before the event date
    for (const m of timeline.milestones) {
      expect(m.dueDate <= eventDate).toBe(true);
    }
  });

  it('handles short lead times without crashing or generating past milestones', () => {
    // 2 weeks in future
    const now = new Date();
    const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const dateStr = formatISODate(twoWeeksLater);

    const timeline = generateTimeline('birthday', dateStr);
    expect(timeline.milestones.length).toBeGreaterThan(0);

    const todayStr = formatISODate(now);
    for (const m of timeline.milestones) {
      expect(m.dueDate >= todayStr).toBe(true);
    }
  });

  it('calculates days until event accurately', () => {
    const now = new Date();
    const tenDaysLater = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    const dateStr = formatISODate(tenDaysLater);

    const days = daysUntilEvent(dateStr);
    expect(days).toBe(10);
  });

  it('correctly identifies next upcoming milestone', () => {
    const timeline = generateTimeline('community', '2027-10-01');
    const next = getNextMilestone(timeline, new Date('2026-11-01'));

    expect(next).not.toBeNull();
    expect(next?.status).toBe('pending');
  });

  it('correctly parses local dates avoiding UTC off-by-one shifts', () => {
    const parsed = parseLocalDate('2027-08-20');
    expect(parsed.getFullYear()).toBe(2027);
    expect(parsed.getMonth()).toBe(7); // 0-indexed August
    expect(parsed.getDate()).toBe(20);
  });

  it('returns null when all milestones are done or in the past', () => {
    const timeline = {
      milestones: [
        {
          id: '1',
          label: 'Done Item',
          description: '',
          dueDate: '2025-01-01',
          category: 'venue',
          status: 'done' as const,
          weeksBeforeEvent: 10,
          isCritical: false,
        },
      ],
    };
    expect(getNextMilestone(timeline, new Date('2026-01-01'))).toBeNull();
  });

  it('calculates negative days for past events', () => {
    expect(daysUntilEvent('2020-01-01')).toBeLessThan(0);
  });
});
