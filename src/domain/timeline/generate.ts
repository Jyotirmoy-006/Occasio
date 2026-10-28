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
    // Phase 1: Concept & Venue
    { label: 'Define theme, budget & guest list', description: 'Establish party concept, budget ceiling, and guest headcount.', category: 'planning', phase: 'Phase 1: Concept', weeksBeforeEvent: 14, isCritical: true },
    { label: 'Book party venue or lounge space', description: 'Reserve venue space and confirm noise ordinances.', category: 'venue', phase: 'Phase 1: Concept', weeksBeforeEvent: 12, isCritical: true },
    { label: 'Book DJ, live music or performers', description: 'Secure entertainers, activity hosts, or photobooth.', category: 'entertainment', phase: 'Phase 1: Concept', weeksBeforeEvent: 10, isCritical: false },

    // Phase 2: Menu & Activities
    { label: 'Send digital invitations with RSVP', description: 'Dispatch invitations with theme notes and RSVP date.', category: 'communication', phase: 'Phase 2: Invitations', weeksBeforeEvent: 8, isCritical: true },
    { label: 'Order custom cake & dessert display', description: 'Provide baker with theme reference and dietary needs.', category: 'catering', phase: 'Phase 2: Invitations', weeksBeforeEvent: 6, isCritical: true },
    { label: 'Confirm catering menu & bar package', description: 'Finalize bites, passed appetizers, and signature cocktail.', category: 'catering', phase: 'Phase 2: Invitations', weeksBeforeEvent: 4, isCritical: false },

    // Phase 3: Details & Supplies
    { label: 'RSVP deadline & finalize headcount', description: 'Confirm party favors, food portions, and seating count.', category: 'communication', phase: 'Phase 3: Coordination', weeksBeforeEvent: 3, isCritical: false },
    { label: 'Source decor, lighting & balloon accents', description: 'Order signage, table runners, and atmospheric lighting.', category: 'decor', phase: 'Phase 3: Coordination', weeksBeforeEvent: 2, isCritical: false },
    { label: 'Confirm playlist & speeches schedule', description: 'Brief DJ on must-play tracks and timing for toasts.', category: 'entertainment', phase: 'Phase 3: Coordination', weeksBeforeEvent: 1, isCritical: false },

    // Phase 4: Day-of Execution
    { label: 'Venue setup, cake delivery & audio check', description: 'Arrive 2 hours prior to coordinate vendors and setup decor.', category: 'venue', phase: 'Phase 4: Day-Of', weeksBeforeEvent: 0, isCritical: true },
  ],
  community: [
    // Phase 1: Charter & Permitting
    { label: 'Define event charter & committee roles', description: 'Clarify community mission, safety goals, and committee leads.', category: 'planning', phase: 'Phase 1: Charter & Permits', weeksBeforeEvent: 24, isCritical: true },
    { label: 'Reserve public park / venue & file municipal permits', description: 'Submit permits for sound, public assembly, and park reservation. Verify with local authorities.', category: 'venue', phase: 'Phase 1: Charter & Permits', weeksBeforeEvent: 20, isCritical: true },
    { label: 'Secure sponsors, grants & neighborhood partners', description: 'Engage local merchants and community associations.', category: 'planning', phase: 'Phase 1: Charter & Permits', weeksBeforeEvent: 18, isCritical: false },

    // Phase 2: Programming & Logistics
    { label: 'Book performers, sound system & stage canopy', description: 'Contract staging, PA audio engineer, and performers.', category: 'entertainment', phase: 'Phase 2: Programming', weeksBeforeEvent: 14, isCritical: true },
    { label: 'Coordinate food trucks & local artisans', description: 'Verify health department food handler permits and vendor spaces.', category: 'catering', phase: 'Phase 2: Programming', weeksBeforeEvent: 12, isCritical: false },
    { label: 'Launch public marketing, flyers & social outreach', description: 'Display posters in local libraries, cafes, and digital boards.', category: 'marketing', phase: 'Phase 2: Programming', weeksBeforeEvent: 10, isCritical: false },

    // Phase 3: Safety & Volunteers
    { label: 'Confirm event liability insurance & medical first aid', description: 'Procure event rider insurance and line up emergency services.', category: 'insurance', phase: 'Phase 3: Operations', weeksBeforeEvent: 8, isCritical: true },
    { label: 'Recruit volunteer roster & assign shifts', description: 'Brief volunteers on check-in, crowd flow, and cleanup.', category: 'volunteers', phase: 'Phase 3: Operations', weeksBeforeEvent: 5, isCritical: false },
    { label: 'Order accessibility ramps, waste bins & signage', description: 'Guarantee ADA accessibility and directional signage.', category: 'decor', phase: 'Phase 3: Operations', weeksBeforeEvent: 3, isCritical: false },

    // Phase 4: Delivery
    { label: 'Site walkthrough with city inspector & committee', description: 'Inspect emergency exits, electrical lines, and water points.', category: 'planning', phase: 'Phase 4: Delivery', weeksBeforeEvent: 1, isCritical: true },
    { label: 'Event day staging, sound check & volunteer briefing', description: 'Morning setup, safety briefing, and attendee check-in.', category: 'venue', phase: 'Phase 4: Delivery', weeksBeforeEvent: 0, isCritical: true },
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
 * Parses YYYY-MM-DD as local date to prevent timezone shift.
 */
export function parseLocalDate(isoDate: string): Date {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return new Date(NaN);
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

/**
 * Formats a Date object to YYYY-MM-DD string.
 */
export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Generates backward-planned phased milestones from the event date.
 * Automatically compresses lead times if the available window is short,
 * ensuring milestones are evenly distributed and not scheduled in the past.
 */
export function generateTimeline(eventType: EventType, eventDate: string): Timeline {
  const targetDate = parseLocalDate(eventDate);
  const templates = MILESTONE_TEMPLATES[eventType] || MILESTONE_TEMPLATES.wedding;
  const availableDays = Math.max(7, daysUntilEvent(eventDate));
  const availableWeeks = Math.max(1, availableDays / 7);

  // Find max weeks in template
  const maxTemplateWeeks = Math.max(...templates.map((t) => t.weeksBeforeEvent), 1);
  const compressionRatio = availableWeeks < maxTemplateWeeks ? availableWeeks / maxTemplateWeeks : 1.0;

  const milestones: Milestone[] = templates.map((tmpl, idx) => {
    // Compress weeks if short lead time
    const scaledWeeks = Math.round(tmpl.weeksBeforeEvent * compressionRatio);
    const daysBefore = scaledWeeks * 7;

    const dueDate = new Date(targetDate.getTime());
    dueDate.setDate(dueDate.getDate() - daysBefore);

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
