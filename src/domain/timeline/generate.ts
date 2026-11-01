/**
 * Timeline generation — backward-planned phased milestones from event date.
 * Pure function; no side effects; no I/O.
 *
 * Design principle: deterministic code owns the dates and weeks;
 * the AI layer only contributes labels and descriptions.
 * Compresses milestone lead times proportionally for short-notice events.
 */

import type { Timeline, Milestone } from '@/domain/schemas/timeline';
import type { EventType } from '@/lib/constants';

type MilestoneDef = {
  label: string;
  description: string;
  category: string;
  phase: string;
  weeksBeforeEvent: number;
  isCritical: boolean;
};

export const PHASE_ORDER = [
  'Foundation',
  'Sourcing & Design',
  'Detailing & Logistics',
  'Final Week & Day-Of',
] as const;

export type PhaseLabel = (typeof PHASE_ORDER)[number];

const PHASE_PATTERNS: Array<{ pattern: RegExp; label: PhaseLabel }> = [
  { pattern: /1|foundation|concept|charter/i, label: 'Foundation' },
  { pattern: /2|design|sourcing|invitations|programming/i, label: 'Sourcing & Design' },
  { pattern: /3|logistics|coordination|operations/i, label: 'Detailing & Logistics' },
];

export function getPhaseLabel(phase?: string): PhaseLabel {
  if (!phase) return 'Final Week & Day-Of';
  const match = PHASE_PATTERNS.find(({ pattern }) => pattern.test(phase));
  return match?.label ?? 'Final Week & Day-Of';
}

/** Phased milestone templates per event type (14-20 milestones). */
const MILESTONE_TEMPLATES: Record<EventType, MilestoneDef[]> = {
  wedding: [
    // Phase 1: Foundation & Vision
    { label: 'Set budget & guest list ceiling', description: 'Define overall budget minor units and draft initial guest list.', category: 'planning', phase: 'Phase 1: Foundation', weeksBeforeEvent: 52, isCritical: true },
    { label: 'Secure ceremony & reception venue', description: 'Tour venues, compare contracts, and secure the event date.', category: 'venue', phase: 'Phase 1: Foundation', weeksBeforeEvent: 48, isCritical: true },
    { label: 'Hire full-service caterer & bar', description: 'Schedule menu tastings, bar packages, and staff ratio confirmation.', category: 'catering', phase: 'Phase 1: Foundation', weeksBeforeEvent: 44, isCritical: true },
    { label: 'Book photographer & videographer', description: 'Review portfolios, confirm lighting style, and sign agreement.', category: 'photography', phase: 'Phase 1: Foundation', weeksBeforeEvent: 40, isCritical: true },
    { label: 'Select wedding party & officiant', description: 'Confirm party commitments and ceremony structure.', category: 'ceremony', phase: 'Phase 1: Foundation', weeksBeforeEvent: 36, isCritical: false },

    // Phase 2: Creative & Design
    { label: 'Book live band or DJ', description: 'Confirm audio staging, microphones, and playlist priorities.', category: 'entertainment', phase: 'Phase 2: Design & Creative', weeksBeforeEvent: 32, isCritical: false },
    { label: 'Order bridal gown / custom attire', description: 'Allow 6-8 months for construction, fittings, and alterations.', category: 'attire', phase: 'Phase 2: Design & Creative', weeksBeforeEvent: 28, isCritical: true },
    { label: 'Send save-the-date cards', description: 'Mail or dispatch digital notices to all guests.', category: 'communication', phase: 'Phase 2: Design & Creative', weeksBeforeEvent: 26, isCritical: false },
    { label: 'Contract floral & event designer', description: 'Establish color palette, arch florals, and table centerpieces.', category: 'decor', phase: 'Phase 2: Design & Creative', weeksBeforeEvent: 22, isCritical: false },
    { label: 'Reserve hotel blocks & transport', description: 'Set up guest accommodations and shuttle transit.', category: 'travel', phase: 'Phase 2: Design & Creative', weeksBeforeEvent: 18, isCritical: false },

    // Phase 3: Logistics & Coordination
    { label: 'Send formal invitations & dietary survey', description: 'Include clear RSVP deadline and meal options.', category: 'communication', phase: 'Phase 3: Logistics', weeksBeforeEvent: 14, isCritical: true },
    { label: 'Cake tasting & dessert table order', description: 'Finalize tiers, dietary slices, and delivery window.', category: 'catering', phase: 'Phase 3: Logistics', weeksBeforeEvent: 10, isCritical: false },
    { label: 'Schedule hair & makeup trials', description: 'Test morning run sheet timing with stylist.', category: 'attire', phase: 'Phase 3: Logistics', weeksBeforeEvent: 8, isCritical: false },
    { label: 'RSVP deadline & caterer guest count lock', description: 'Collate final headcounts and special dietary requirements.', category: 'communication', phase: 'Phase 3: Logistics', weeksBeforeEvent: 5, isCritical: true },
    { label: 'Finalize seating chart & escort cards', description: 'Generate layout diagram and print table stationery.', category: 'planning', phase: 'Phase 3: Logistics', weeksBeforeEvent: 3, isCritical: false },

    // Phase 4: Final Sprint & Day-of
    { label: 'Apply for marriage license', description: 'Obtain legal license within local validity window.', category: 'planning', phase: 'Phase 4: Final Sprint', weeksBeforeEvent: 2, isCritical: true },
    { label: 'Final vendor walkthrough & day-of timeline', description: 'Walk through venue with coordinator, caterer, and photographer.', category: 'planning', phase: 'Phase 4: Final Sprint', weeksBeforeEvent: 1, isCritical: true },
    { label: 'Rehearsal dinner & sound check', description: 'Walk through ceremony choreography and cue audio.', category: 'ceremony', phase: 'Phase 4: Final Sprint', weeksBeforeEvent: 0, isCritical: false },
  ],

  birthday: [
    // Phase 1: Foundation
    { label: 'Select party theme & initial budget', description: 'Establish budget minor units, milestone concept, and guest list size.', category: 'planning', phase: 'Phase 1: Foundation', weeksBeforeEvent: 12, isCritical: true },
    { label: 'Book venue or party space', description: 'Secure private room, garden space, or home setup.', category: 'venue', phase: 'Phase 1: Foundation', weeksBeforeEvent: 10, isCritical: true },
    { label: 'Book DJ / live entertainment', description: 'Confirm performance requirements and favorite music eras.', category: 'entertainment', phase: 'Phase 1: Foundation', weeksBeforeEvent: 9, isCritical: false },

    // Phase 2: Design & Details
    { label: 'Send paper or digital invitations', description: 'Include RSVP deadline, dress code theme, and surprise party notice if applicable.', category: 'communication', phase: 'Phase 2: Details', weeksBeforeEvent: 8, isCritical: true },
    { label: 'Contract caterer or food truck', description: 'Finalize finger food menus, grazing tables, or food truck parking.', category: 'catering', phase: 'Phase 2: Details', weeksBeforeEvent: 7, isCritical: true },
    { label: 'Order custom cake & sweet treats', description: 'Confirm flavor profiles, personalized toppers, and pickup timing.', category: 'catering', phase: 'Phase 2: Details', weeksBeforeEvent: 6, isCritical: false },
    { label: 'Source themed decor & photo backdrop', description: 'Gather balloon installations, signage, and vintage photo wall props.', category: 'decor', phase: 'Phase 2: Details', weeksBeforeEvent: 4, isCritical: false },

    // Phase 3: Final Preparations
    { label: 'Confirm RSVPs & dietary headcounts', description: 'Lock final numbers with venue and food providers.', category: 'communication', phase: 'Phase 3: Final Prep', weeksBeforeEvent: 2, isCritical: true },
    { label: 'Purchase party favors & guest gifts', description: 'Assemble curated souvenir bags or personalized gifts.', category: 'decor', phase: 'Phase 3: Final Prep', weeksBeforeEvent: 1, isCritical: false },
    { label: 'Day-of schedule & music playlist lock', description: 'Finalize schedule: arrival toast, cake cutting, speeches, and dance floor.', category: 'planning', phase: 'Phase 3: Final Prep', weeksBeforeEvent: 0, isCritical: true },
  ],

  community: [
    // Phase 1: Charter & Approvals
    { label: 'Draft event charter & safety plan', description: 'Define purpose, attendee capacity ceiling, and risk assessment.', category: 'planning', phase: 'Phase 1: Charter', weeksBeforeEvent: 16, isCritical: true },
    { label: 'Apply for municipal permits & insurance', description: 'Submit park, street-closure, sound amplification, or health permits.', category: 'permits', phase: 'Phase 1: Charter', weeksBeforeEvent: 14, isCritical: true },
    { label: 'Form volunteer committee & roles', description: 'Appoint leads for logistics, registration, first aid, and cleanup.', category: 'staffing', phase: 'Phase 1: Charter', weeksBeforeEvent: 12, isCritical: true },

    // Phase 2: Operations & Outposts
    { label: 'Book staging, AV, and shade canopies', description: 'Confirm generator permits, accessible ramps, and crowd barriers.', category: 'rentals', phase: 'Phase 2: Operations', weeksBeforeEvent: 10, isCritical: true },
    { label: 'Launch community outreach & signups', description: 'Publish flyers, community board notices, and online RSVPs.', category: 'communication', phase: 'Phase 2: Operations', weeksBeforeEvent: 8, isCritical: false },
    { label: 'Contract food vendors & water stations', description: 'Verify food hygiene licenses, graywater disposal, and hydration points.', category: 'catering', phase: 'Phase 2: Operations', weeksBeforeEvent: 6, isCritical: true },
    { label: 'Order signage & directional banners', description: 'Produce accessible high-contrast signs for entrances, medical, and toilets.', category: 'signage', phase: 'Phase 2: Operations', weeksBeforeEvent: 4, isCritical: false },

    // Phase 3: Run-of-Show Lock
    { label: 'Volunteer briefing & safety dry run', description: 'Distribute radios, high-visibility vests, and emergency protocol cards.', category: 'staffing', phase: 'Phase 3: Run-of-Show', weeksBeforeEvent: 2, isCritical: true },
    { label: 'Re-confirm municipal services & waste plan', description: 'Finalize extra bins, portable sanitation delivery, and parking marshals.', category: 'permits', phase: 'Phase 3: Run-of-Show', weeksBeforeEvent: 1, isCritical: true },
    { label: 'Site load-in & master briefing', description: 'Mark vendor plots, connect electrical lines, and test sound limits.', category: 'planning', phase: 'Phase 3: Run-of-Show', weeksBeforeEvent: 0, isCritical: true },
  ],
};

/**
 * Calculates days between today and the target event date.
 */
export function daysUntilEvent(eventDate: string): number {
  const target = parseLocalDate(eventDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Parses YYYY-MM-DD into a Date in local time without UTC offset bugs.
 */
export function parseLocalDate(isoString: string): Date {
  const parts = isoString.split('-');
  if (parts.length !== 3) return new Date(NaN);
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

/** Formats a local Date as YYYY-MM-DD. */
export function formatISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Snaps a date to the nearest preceding weekday (Mon-Fri) so vendor and
 * planning deadlines never land on weekend days when businesses are closed.
 */
export function snapToWeekday(date: Date): Date {
  const result = new Date(date.getTime());
  const day = result.getDay();
  if (day === 0) {
    result.setDate(result.getDate() - 2);
  } else if (day === 6) {
    result.setDate(result.getDate() - 1);
  }
  return result;
}

function getEarliestUpcomingWeekday(d: Date): Date {
  const res = new Date(d.getTime());
  const day = res.getDay();
  if (day === 0) {
    res.setDate(res.getDate() + 1);
  } else if (day === 6) {
    res.setDate(res.getDate() + 2);
  }
  return res;
}

/**
 * Generates backward-planned phased milestones from the event date.
 * Automatically compresses lead times if the available window is short,
 * snaps milestones to weekdays (Mon-Fri), and guarantees chronological ordering.
 */
export function generateTimeline(eventType: EventType, eventDate: string): Timeline {
  const targetDate = parseLocalDate(eventDate);
  const templates = MILESTONE_TEMPLATES[eventType] || MILESTONE_TEMPLATES.wedding;
  const availableDays = Math.max(7, daysUntilEvent(eventDate));
  const availableWeeks = Math.max(1, availableDays / 7);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const maxTemplateWeeks = Math.max(...templates.map((t) => t.weeksBeforeEvent), 1);
  const compressionRatio = availableWeeks < maxTemplateWeeks ? availableWeeks / maxTemplateWeeks : 1.0;

  const milestones: Milestone[] = templates.map((tmpl, idx) => {
    const scaledWeeks = Math.round(tmpl.weeksBeforeEvent * compressionRatio);
    const daysBefore = scaledWeeks * 7;

    const rawDueDate = new Date(targetDate.getTime());
    rawDueDate.setDate(rawDueDate.getDate() - daysBefore);

    const candidateDate = daysBefore > 0 ? snapToWeekday(rawDueDate) : rawDueDate;
    const minDate = daysBefore > 0 ? getEarliestUpcomingWeekday(today) : today;
    const dueDate = candidateDate.getTime() < minDate.getTime()
      ? (minDate.getTime() <= targetDate.getTime() ? minDate : candidateDate)
      : candidateDate;

    return {
      id: `milestone-${idx + 1}-${tmpl.category}`,
      label: tmpl.label,
      description: tmpl.description,
      dueDate: formatISODate(dueDate),
      category: tmpl.category,
      phase: tmpl.phase,
      status: 'pending',
      weeksBeforeEvent: scaledWeeks,
      isCritical: tmpl.isCritical,
    };
  });

  milestones.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return { milestones };
}

/**
 * Finds the next pending or in-progress milestone.
 */
export function getNextMilestone(timeline: Timeline, referenceDate?: Date): Milestone | null {
  const refIso = referenceDate ? formatISODate(referenceDate) : undefined;
  const active = timeline.milestones.filter(
    (m) =>
      (m.status === 'pending' || m.status === 'in-progress') &&
      (!refIso || m.dueDate >= refIso),
  );
  if (active.length === 0) return null;

  return active.reduce((earliest, curr) => {
    return curr.dueDate < earliest.dueDate ? curr : earliest;
  }, active[0]);
}
