/** Application-wide constants. Import from here; never use magic numbers in domain code. */

export const SCHEMA_VERSION = 1 as const;

export const MAX_GUEST_COUNT = 10_000;
export const MIN_GUEST_COUNT = 1;
export const MAX_EVENT_NAME_LENGTH = 80;
export const MAX_STYLE_LENGTH = 200;
export const MAX_CULTURAL_NEEDS_LENGTH = 300;
export const MAX_PRIORITIES = 5;
export const MAX_NOTES_LENGTH = 500;
export const MAX_CHECKLIST_QUESTIONS = 10;

export const COPILOT_MESSAGE_MAX_LENGTH = 1_000;
export const API_PAYLOAD_MAX_BYTES = 4_096;
export const IMPORT_FILE_MAX_BYTES = 512 * 1024; // 512 KB

export const AI_MAX_OUTPUT_TOKENS = 2_048;
export const AI_TIMEOUT_MS = 30_000;
export const CACHE_TTL_MS = 5 * 60 * 1_000; // 5 minutes

export const RATE_LIMIT_AI_MAX = 60;
export const RATE_LIMIT_AI_WINDOW_MS = 60_000;

export const DEBOUNCE_SLIDER_MS = 50;
export const DEBOUNCE_SEARCH_MS = 300;

export const EVENT_TYPES = ['wedding', 'birthday', 'community'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const VENDOR_STATUSES = ['to-contact', 'contacted', 'quoted', 'booked'] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number];

export const MILESTONE_STATUSES = ['pending', 'in-progress', 'done', 'skipped'] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export const SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'INR',
  'CAD',
  'AUD',
  'JPY',
  'SGD',
  'AED',
  'ZAR',
] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

