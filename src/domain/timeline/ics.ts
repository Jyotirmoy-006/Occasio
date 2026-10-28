/**
 * ICS (iCalendar) export for timeline milestones.
 * Produces a standards-compliant .ics file content string.
 * RFC 5545 compliant.
 */

import type { Timeline } from '@/domain/schemas/timeline';
import { parseLocalDate } from './generate';

/**
 * Generates iCalendar file content for all timeline milestones.
 *
 * @param timeline - The plan's timeline
 * @param planName - Name of the event (used as calendar name and event summaries)
 * @returns .ics file content as a string
 */
export function generateICS(timeline: Timeline, planName: string): string {
  const now = formatICSDateTime(new Date());
  const safeName = escapeICSText(planName);

  const events = timeline.milestones
    .map((m, i) => {
      const date = parseLocalDate(m.dueDate);
      const dateStr = formatICSDate(date);
      const uid = `occasio-${m.id}-${i}@occasio.app`;
      const summary = escapeICSText(m.label);
      const description = escapeICSText(m.description);

      return [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `DTEND;VALUE=DATE:${dateStr}`,
        `SUMMARY:${summary}`,
        description ? `DESCRIPTION:${description}` : '',
        `CATEGORIES:${escapeICSText(m.category)}`,
        m.isCritical ? 'PRIORITY:1' : 'PRIORITY:5',
        'END:VEVENT',
      ]
        .filter(Boolean)
        .join('\r\n');
    })
    .join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Occasio//Event Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${safeName} — Occasio`,
    events,
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Formats a Date as YYYYMMDD for ICS DATE values.
 */
function formatICSDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Formats a Date as YYYYMMDDTHHMMSSZ for ICS DATETIME values.
 */
function formatICSDateTime(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Escapes special characters in ICS text values per RFC 5545.
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

