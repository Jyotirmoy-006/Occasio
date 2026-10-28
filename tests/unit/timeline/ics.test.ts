import { describe, it, expect } from 'vitest';
import { generateICS } from '@/domain/timeline/ics';
import { generateTimeline } from '@/domain/timeline/generate';

describe('iCalendar (ICS) Export', () => {
  it('generates valid RFC 5545 iCalendar content', () => {
    const timeline = generateTimeline('wedding', '2027-09-18');
    const ics = generateICS(timeline, 'Maya & Liam Wedding');

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//Occasio//Event Planner//EN');
    expect(ics).toContain('X-WR-CALNAME:Maya & Liam Wedding — Occasio');

    // Must contain VEVENT blocks
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('DTSTART;VALUE=DATE:');
    expect(ics).toContain('SUMMARY:');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');

    // CRLF line endings per RFC 5545
    expect(ics).toContain('\r\n');
  });

  it('escapes special characters in event summaries and descriptions', () => {
    const customTimeline = {
      milestones: [
        {
          id: 'm-special',
          label: 'Book; caterer, and music \n meeting',
          description: 'Bring notes, menus & questions; check price.',
          dueDate: '2027-05-01',
          category: 'catering',
          status: 'pending' as const,
          weeksBeforeEvent: 8,
          isCritical: true,
        },
      ],
    };

    const ics = generateICS(customTimeline, 'Test Event');
    expect(ics).toContain('SUMMARY:Book\\; caterer\\, and music \\n meeting');
    expect(ics).toContain('DESCRIPTION:Bring notes\\, menus & questions\\; check price.');
  });
});
