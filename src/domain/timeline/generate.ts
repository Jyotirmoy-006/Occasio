/**
 * Timeline generation — backward-planned milestones from event date.
 * Pure function; no side effects; no I/O.
 *
 * Design principle: deterministic code owns the dates and weeks;
 * the AI layer only contributes labels and descriptions.
 */

import type { Timeline, Milestone } from '@/domain/schemas/timeline';
import type { EventType } from '@/lib/constants';
import { MILESTONE_STATUSES } from '@/lib/constants';

type MilestoneDef = {
  label: string;
  description: string;
  category: string;
  weeksBeforeEvent: number;
  isCritical: boolean;
};

/** Template milestone definitions per event type. */
const MILESTONE_TEMPLATES: Record<EventType, MilestoneDef[]> = {
  wedding: [
    { label: 'Set budget and guest list', description: 'Define overall budget and draft initial guest list.', category: 'planning', weeksBeforeEvent: 52, isCritical: true },
    { label: 'Choose and book venue', description: 'Visit venues, compare quotes, and sign contract.', category: 'venue', weeksBeforeEvent: 48, isCritical: true },
    { label: 'Hire caterer', description: 'Schedule tastings and book your catering team.', category: 'catering', weeksBeforeEvent: 44, isCritical: true },
    { label: 'Book photographer and videographer', description: 'Review portfolios, confirm style, and sign agreements.', category: 'photography', weeksBeforeEvent: 40, isCritical: true },
    { label: 'Book officiant', description: 'Confirm availability and discuss ceremony format.', category: 'ceremony', weeksBeforeEvent: 36, isCritical: false },
    { label: 'Book music and entertainment', description: 'Book DJ or band; confirm playlist approach.', category: 'entertainment', weeksBeforeEvent: 32, isCritical: false },
    { label: 'Choose and order attire', description: 'Allow time for fittings and alterations.', category: 'attire', weeksBeforeEvent: 28, isCritical: true },
    { label: 'Send save-the-dates', description: 'Mail or email to all guests.', category: 'communication', weeksBeforeEvent: 26, isCritical: false },
    { label: 'Book florist and decor', description: 'Confirm floral arrangements and table decor.', category: 'decor', weeksBeforeEvent: 20, isCritical: false },
    { label: 'Send formal invitations', description: 'Include RSVP deadline and meal preferences.', category: 'communication', weeksBeforeEvent: 16, isCritical: true },
    { label: 'Plan honeymoon or travel', description: 'Book transportation and accommodation.', category: 'travel', weeksBeforeEvent: 12, isCritical: false },
    { label: 'Confirm all vendors', description: 'Call each vendor to reconfirm timing and details.', category: 'planning', weeksBeforeEvent: 8, isCritical: true },
    { label: 'Receive RSVP deadline', description: 'Finalize guest count for caterer.', category: 'communication', weeksBeforeEvent: 6, isCritical: true },
    { label: 'Final dress fitting', description: 'Last fitting before the wedding day.', category: 'attire', weeksBeforeEvent: 4, isCritical: false },
    { label: 'Confirm seating chart', description: 'Send final arrangement to venue.', category: 'planning', weeksBeforeEvent: 2, isCritical: false },
    { label: 'Final vendor walkthrough', description: 'Walk through the venue with all key vendors.', category: 'planning', weeksBeforeEvent: 1, isCritical: true },
  ],
  birthday: [
    { label: 'Define theme and guest list', description: 'Decide on theme, size, and who to invite.', category: 'planning', weeksBeforeEvent: 12, isCritical: true },
    { label: 'Book venue', description: 'Reserve venue or confirm home setup requirements.', category: 'venue', weeksBeforeEvent: 10, isCritical: true },
    { label: 'Send invitations', description: 'Digital or physical invitations with RSVP date.', category: 'communication', weeksBeforeEvent: 6, isCritical: false },
    { label: 'Book entertainment', description: 'Book performers, activities, or game equipment.', category: 'entertainment', weeksBeforeEvent: 6, isCritical: false },
    { label: 'Order cake', description: 'Place order with enough lead time for custom designs.', category: 'catering', weeksBeforeEvent: 4, isCritical: true },
    { label: 'Confirm catering and food', description: 'Finalize menu and dietary accommodations.', category: 'catering', weeksBeforeEvent: 3, isCritical: true },
    { label: 'Receive RSVP deadline', description: 'Final guest count for caterer and seating.', category: 'communication', weeksBeforeEvent: 2, isCritical: false },
    { label: 'Purchase decorations', description: 'Buy or collect all decorations and supplies.', category: 'decor', weeksBeforeEvent: 1, isCritical: false },
    { label: 'Set up venue', description: 'Arrive early to decorate and prepare.', category: 'venue', weeksBeforeEvent: 0, isCritical: true },
  ],
  community: [
    { label: 'Define goals and scope', description: 'Clarify purpose, target audience, and success metrics.', category: 'planning', weeksBeforeEvent: 24, isCritical: true },
    { label: 'Secure venue and permits', description: 'Apply for permits and reserve public or private space. Verify with local authorities.', category: 'venue', weeksBeforeEvent: 20, isCritical: true },
    { label: 'Recruit organizing committee', description: 'Identify volunteers and assign roles.', category: 'volunteers', weeksBeforeEvent: 18, isCritical: false },
    { label: 'Confirm sponsors and partners', description: 'Reach out to local businesses and organizations.', category: 'planning', weeksBeforeEvent: 16, isCritical: false },
    { label: 'Book performers and vendors', description: 'Confirm entertainment, food vendors, and equipment.', category: 'entertainment', weeksBeforeEvent: 12, isCritical: true },
    { label: 'Launch marketing and outreach', description: 'Publish on social media, local listings, and flyers.', category: 'marketing', weeksBeforeEvent: 8, isCritical: false },
    { label: 'Confirm insurance and safety plan', description: 'Obtain event insurance and define emergency procedures. Verify requirements locally.', category: 'insurance', weeksBeforeEvent: 6, isCritical: true },
    { label: 'Confirm attendee registrations', description: 'Review sign-ups and prepare check-in system.', category: 'communication', weeksBeforeEvent: 4, isCritical: false },
    { label: 'Brief volunteers', description: 'Hold orientation session for all volunteers.', category: 'volunteers', weeksBeforeEvent: 2, isCritical: false },
    { label: 'Set up and test equipment', description: 'Arrive early; test AV, signage, and logistics.', category: 'equipment', weeksBeforeEvent: 0, isCritical: true },
  ],
};

/**
 * Generates a backward-planned timeline from an event date.
 *
 * @param eventType - Type of event
 * @param eventDate - ISO date string (YYYY-MM-DD) of the event
 * @returns Timeline with milestones sorted by due date ascending
 */
export function generateTimeline(eventType: EventType, eventDate: string): Timeline {
  const eventMs = parseLocalDate(eventDate).getTime();
  const templates = MILESTONE_TEMPLATES[eventType];
  const today = startOfDay(new Date());

  const milestones: Milestone[] = templates
    .filter((t) => {
      // For very short lead times, filter out milestones that are already past
      const dueDateMs = eventMs - t.weeksBeforeEvent * 7 * 24 * 60 * 60 * 1000;
      return dueDateMs >= today.getTime() - 24 * 60 * 60 * 1000; // include today
    })
    .map((t, i) => {
      const dueDateMs = eventMs - t.weeksBeforeEvent * 7 * 24 * 60 * 60 * 1000;
      const dueDate = formatISODate(new Date(dueDateMs));

      return {
        id: `milestone-${eventType}-${i}`,
        label: t.label,
        description: t.description,
        dueDate,
        category: t.category,
        status: 'pending' as const,
        weeksBeforeEvent: t.weeksBeforeEvent,
        isCritical: t.isCritical,
      };
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return { milestones };
}

/**
 * Calculates the number of days remaining until the event.
 * Returns a negative number if the event has passed.
 */
export function daysUntilEvent(eventDate: string): number {
  const eventDay = parseLocalDate(eventDate);
  const today = startOfDay(new Date());
  const diffMs = startOfDay(eventDay).getTime() - today.getTime();
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

/**
 * Returns the next upcoming milestone (first pending/in-progress one by date).
 */
export function getNextMilestone(timeline: Timeline, today = new Date()): Milestone | null {
  const todayStr = formatISODate(startOfDay(today));
  return (
    timeline.milestones
      .filter(
        (m) =>
          m.dueDate >= todayStr &&
          (m.status === 'pending' || m.status === 'in-progress'),
      )
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] ?? null
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parses a YYYY-MM-DD string as a local date (not UTC).
 * Avoids the off-by-one caused by `new Date('2024-06-01')` treating it as UTC midnight.
 */
export function parseLocalDate(dateStr: string): Date {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr ?? '0', 10);
  const month = parseInt(monthStr ?? '1', 10) - 1;
  const day = parseInt(dayStr ?? '1', 10);
  return new Date(year, month, day);
}

/**
 * Strips the time component from a Date, returning midnight local time.
 */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Formats a Date as YYYY-MM-DD using local timezone.
 */
export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Exported for testing — access to milestone templates. */
export { MILESTONE_TEMPLATES };

/** Type alias for milestone statuses as a const. */
export { MILESTONE_STATUSES };

