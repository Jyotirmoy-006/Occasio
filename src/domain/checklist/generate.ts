/**
 * Checklist generation — vendor types and suggested questions per event type.
 * Pure function; deterministic; no I/O.
 *
 * RESPONSIBLE AI NOTE:
 * This module generates vendor TYPES and question templates only.
 * It never generates or implies real vendor names, phone numbers, ratings, or prices.
 */

import type { Checklist, ChecklistItem } from '@/domain/schemas/checklist';
import type { EventType } from '@/lib/constants';

type ChecklistItemDef = {
  vendorType: string;
  category: string;
  questionsToAsk: string[];
};

const CHECKLIST_TEMPLATES: Record<EventType, ChecklistItemDef[]> = {
  wedding: [
    {
      vendorType: 'Venue',
      category: 'venue',
      questionsToAsk: [
        'What is the maximum guest capacity?',
        'Is catering in-house or do we bring our own?',
        'What are the parking and accessibility options?',
        'What is the cancellation and refund policy?',
        'Is there a dedicated wedding coordinator on-site?',
        'What time can we access the space for setup?',
      ],
    },
    {
      vendorType: 'Caterer',
      category: 'catering',
      questionsToAsk: [
        'Can you accommodate dietary restrictions (vegan, halal, gluten-free, etc.)?',
        'Do you handle rentals (linens, cutlery, glassware)?',
        'What is included in the per-head price?',
        'Do you provide a tasting session?',
        'What is the server-to-guest ratio?',
        'Do you handle alcohol licensing or should we?',
      ],
    },
    {
      vendorType: 'Photographer',
      category: 'photography',
      questionsToAsk: [
        'How many hours of coverage are included?',
        'Will you be the photographer on the day, or an associate?',
        'How many edited images will we receive, and by when?',
        'Do you offer an engagement shoot?',
        'What format are final images delivered in?',
        'What is your backup plan if you are ill on the day?',
      ],
    },
    {
      vendorType: 'Videographer',
      category: 'photography',
      questionsToAsk: [
        'What is the final video length and format?',
        'Do you provide a same-day edit or highlight reel?',
        'What audio equipment do you use for ceremony vows?',
        'How long after the wedding will we receive the final video?',
      ],
    },
    {
      vendorType: 'Florist / Decor',
      category: 'decor',
      questionsToAsk: [
        'Can you work with our color palette and theme?',
        'Do you handle setup and teardown on the day?',
        'What happens to the flowers after the event?',
        'Can you provide a detailed itemized quote?',
        'Do you carry event insurance?',
      ],
    },
    {
      vendorType: 'DJ or Band',
      category: 'entertainment',
      questionsToAsk: [
        'Can we provide a "must-play" and "do-not-play" list?',
        'Do you have MC capabilities for announcements?',
        'What equipment do you bring? Is a sound check included?',
        'How many breaks will there be?',
        'What is your overtime rate?',
      ],
    },
    {
      vendorType: 'Transport',
      category: 'transport',
      questionsToAsk: [
        'How many vehicles and drivers are included?',
        'What is the pickup and drop-off schedule?',
        'What is the vehicle capacity?',
        'Is gratuity included?',
      ],
    },
    {
      vendorType: 'Officiant / Celebrant',
      category: 'ceremony',
      questionsToAsk: [
        'Are you licensed to legally marry us in this region?',
        'Can you customize the ceremony script?',
        'How many meetings do you hold beforehand?',
        'Do you provide the script in writing?',
      ],
    },
  ],
  birthday: [
    {
      vendorType: 'Venue',
      category: 'venue',
      questionsToAsk: [
        'What is included in the hire (tables, chairs, AV)?',
        'Is there a preferred caterer list, or can we bring our own?',
        'What are the noise restrictions and curfew?',
        'What are the parking options for guests?',
      ],
    },
    {
      vendorType: 'Caterer / Food Supplier',
      category: 'catering',
      questionsToAsk: [
        'Can you handle dietary requirements?',
        'Do you provide serving staff?',
        'What is the minimum order quantity?',
        'Do you handle setup and cleanup?',
      ],
    },
    {
      vendorType: 'Baker / Cake Designer',
      category: 'catering',
      questionsToAsk: [
        'Do you do custom designs or themed cakes?',
        'Can you accommodate dietary restrictions (nut-free, vegan, etc.)?',
        'How far in advance must the order be placed?',
        'Do you deliver and set up the cake?',
      ],
    },
    {
      vendorType: 'Entertainer / Performer',
      category: 'entertainment',
      questionsToAsk: [
        'What is the performance duration?',
        'What age groups do you cater to?',
        'What setup space and equipment do you need?',
        'Do you carry public liability insurance?',
      ],
    },
    {
      vendorType: 'Photographer',
      category: 'photography',
      questionsToAsk: [
        'How many hours of coverage are included?',
        'How many edited photos will we receive?',
        'Do you bring your own lighting equipment?',
        'What is your turnaround time?',
      ],
    },
    {
      vendorType: 'Decoration Supplier',
      category: 'decor',
      questionsToAsk: [
        'Do you offer themed decoration packages?',
        'Is delivery and setup included?',
        'Do you handle balloon installations?',
      ],
    },
  ],
  community: [
    {
      vendorType: 'Venue / Outdoor Space',
      category: 'venue',
      questionsToAsk: [
        'What permits are required? (Verify with local authorities.)',
        'Are there noise ordinances or time restrictions?',
        'What utilities (power, water) are available?',
        'What is the capacity and layout?',
        'Is the space accessible for people with disabilities?',
      ],
    },
    {
      vendorType: 'AV / Equipment Hire',
      category: 'equipment',
      questionsToAsk: [
        'What is included in the hire package?',
        'Do you provide a technician on the day?',
        'What is the setup and teardown time?',
        'What is the power requirement?',
      ],
    },
    {
      vendorType: 'Food Vendor / Caterer',
      category: 'catering',
      questionsToAsk: [
        'Do you hold a valid food safety certification?',
        'Can you cater to dietary restrictions?',
        'Do you have your own setup equipment?',
        'What are your waste management arrangements?',
      ],
    },
    {
      vendorType: 'Performer / Artist',
      category: 'entertainment',
      questionsToAsk: [
        'What is the performance duration and set list?',
        'What technical requirements do you have?',
        'Do you carry public liability insurance?',
        'Do you have experience with community audiences?',
      ],
    },
    {
      vendorType: 'Insurance Broker',
      category: 'insurance',
      questionsToAsk: [
        'What types of event insurance are available?',
        'What does public liability cover and exclude?',
        'How much coverage is appropriate for our event size?',
        'Note: Verify all requirements with local authorities.',
      ],
    },
    {
      vendorType: 'Signage / Marketing Printer',
      category: 'marketing',
      questionsToAsk: [
        'What are your lead times for print orders?',
        'Do you offer digital proofs before printing?',
        'What file formats do you accept?',
        'Do you offer eco-friendly materials?',
      ],
    },
    {
      vendorType: 'First Aid / Medical Support',
      category: 'insurance',
      questionsToAsk: [
        'Are first aid personnel certified?',
        'What equipment do they bring?',
        'What is the recommended ratio for our guest count?',
        'Note: Requirements vary by region — confirm with local authorities.',
      ],
    },
  ],
};

/**
 * Generates a default vendor checklist for the given event type.
 *
 * @param eventType - Type of event
 * @returns Checklist with vendor items in "to-contact" status
 */
export function generateChecklist(eventType: EventType): Checklist {
  const templates = CHECKLIST_TEMPLATES[eventType];

  const items: ChecklistItem[] = templates.map((t, i) => ({
    id: `vendor-${eventType}-${i}`,
    vendorType: t.vendorType,
    category: t.category,
    status: 'to-contact' as const,
    questionsToAsk: t.questionsToAsk,
    quoteMinorUnits: null,
    notes: '',
    contactedAt: null,
    bookedAt: null,
  }));

  return { items };
}

