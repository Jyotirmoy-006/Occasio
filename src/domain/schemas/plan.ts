/**
 * Occasio — Top-level Plan schema (Zod-first).
 * All TypeScript types are inferred from these schemas.
 * Used for: API input/output validation, localStorage reads, JSON import.
 */
import { z } from 'zod';
z.config({ jitless: true });
import { BudgetSchema } from './budget';
import { TimelineSchema } from './timeline';
import { ChecklistSchema } from './checklist';
import { IdeasSchema } from './ideas';
import {
  MAX_EVENT_NAME_LENGTH,
  MAX_STYLE_LENGTH,
  MAX_CULTURAL_NEEDS_LENGTH,
  MAX_PRIORITIES,
  SCHEMA_VERSION,
  MAX_GUEST_COUNT,
  MIN_GUEST_COUNT,
  SUPPORTED_CURRENCIES,
  EVENT_TYPES,
} from '@/lib/constants';

export const EventTypeSchema = z.enum(EVENT_TYPES);

export const DIETARY_CHIPS = [
  'Vegetarian',
  'Non-vegetarian',
  'Vegan',
  'Jain',
  'Halal',
  'Kosher',
  'Gluten-free',
  'Nut-free',
] as const;

export const AI_PAYLOAD_EXACT_FIELDS = [
  { field: 'eventType', label: 'Event Type', description: 'wedding, birthday, or community' },
  { field: 'guestCount', label: 'Guest Count', description: 'Approximate number of attendees' },
  { field: 'budgetAndCurrency', label: 'Budget Tier & Currency', description: 'Total budget and currency code (e.g. USD)' },
  { field: 'leadTimeDays', label: 'Lead Time', description: 'Calculated days until event (not exact date)' },
  { field: 'city', label: 'City / Region', description: 'City/region for regional & seasonal context' },
  { field: 'style', label: 'Style & Atmosphere', description: 'Desired vibe or theme preferences' },
  { field: 'dietaryRequirements', label: 'Dietary Selections', description: 'Selected structured dietary restrictions' },
  { field: 'culturalNeeds', label: 'Cultural Traditions', description: 'Customs or dietary guidelines to respect' },
  { field: 'priorities', label: 'Planning Priorities', description: 'Top selected priority areas (up to 5)' },
] as const;

export const OnboardingInputSchema = z.object({
  eventType: EventTypeSchema,
  eventName: z
    .string()
    .min(1, 'Event name is required')
    .max(MAX_EVENT_NAME_LENGTH, `Max ${MAX_EVENT_NAME_LENGTH} characters`),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
    .refine(
      (d) => new Date(d) > new Date(),
      'Event date must be in the future',
    ),
  guestCount: z
    .number()
    .int()
    .min(MIN_GUEST_COUNT, `Minimum ${MIN_GUEST_COUNT} guest`)
    .max(MAX_GUEST_COUNT, `Maximum ${MAX_GUEST_COUNT} guests`),
  budgetMinorUnits: z
    .number()
    .int()
    .min(0, 'Budget cannot be negative')
    .max(1_000_000_000, 'Budget is unrealistically large'),
  currency: z.enum(SUPPORTED_CURRENCIES),
  city: z.string().min(1, 'City is required').max(100),
  style: z.string().max(MAX_STYLE_LENGTH).default(''),
  culturalNeeds: z.string().max(MAX_CULTURAL_NEEDS_LENGTH).default(''),
  dietaryRequirements: z.array(z.string()).default([]),
  priorities: z.array(z.string().max(50)).max(MAX_PRIORITIES).default([]),
});

export const PlanSchema = z.object({
  id: z.string().uuid(),
  schemaVersion: z.literal(SCHEMA_VERSION),
  eventType: EventTypeSchema,
  eventName: z.string().max(MAX_EVENT_NAME_LENGTH),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guestCount: z.number().int().min(MIN_GUEST_COUNT).max(MAX_GUEST_COUNT),
  budgetMinorUnits: z.number().int().min(0),
  currency: z.enum(SUPPORTED_CURRENCIES),
  city: z.string().max(100),
  style: z.string().max(MAX_STYLE_LENGTH),
  culturalNeeds: z.string().max(MAX_CULTURAL_NEEDS_LENGTH),
  priorities: z.array(z.string()).max(MAX_PRIORITIES),
  budget: BudgetSchema,
  timeline: TimelineSchema,
  checklist: ChecklistSchema,
  ideas: IdeasSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  isAIGenerated: z.boolean(),
});

export type Plan = z.infer<typeof PlanSchema>;
export type OnboardingInput = z.infer<typeof OnboardingInputSchema>;
export type EventType = z.infer<typeof EventTypeSchema>;

