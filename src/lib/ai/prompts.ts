/**
 * AI prompt templates for Occasio.
 * Server-side only. Never imported by client code.
 *
 * Security: All user-supplied fields are sanitized before embedding.
 * Inputs are delimited with XML tags to prevent prompt injection.
 * Output is schema-constrained JSON.
 */

import { sanitizePromptField, delimitField } from './sanitize';
import type { OnboardingInput } from '@/domain/schemas/plan';

// The JSON schema for the AI's structured output
export const PLAN_GENERATION_OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    themes: {
      type: 'array',
      items: { type: 'object', properties: { id: { type: 'string' }, content: { type: 'string' } }, required: ['id', 'content'] },
      maxItems: 4,
    },
    colorPalettes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          swatches: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                hex: { type: 'string' },
                name: { type: 'string' },
                textColor: { type: 'string', enum: ['#1C1917', '#FAF7F2'] },
              },
              required: ['hex', 'name', 'textColor'],
            },
            minItems: 3,
            maxItems: 5,
          },
        },
        required: ['id', 'name', 'swatches'],
      },
      maxItems: 3,
    },
    menuIdeas: {
      type: 'array',
      items: { type: 'object', properties: { id: { type: 'string' }, content: { type: 'string' } }, required: ['id', 'content'] },
      maxItems: 4,
    },
    activities: {
      type: 'array',
      items: { type: 'object', properties: { id: { type: 'string' }, content: { type: 'string' } }, required: ['id', 'content'] },
      maxItems: 4,
    },
    decor: {
      type: 'array',
      items: { type: 'object', properties: { id: { type: 'string' }, content: { type: 'string' } }, required: ['id', 'content'] },
      maxItems: 4,
    },
    dayTimeline: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          time: { type: 'string' },
          label: { type: 'string' },
          duration: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['id', 'time', 'label', 'duration'],
      },
      maxItems: 15,
    },
    vendorQuestions: {
      type: 'array',
      description: 'Additional questions for specific vendor types, given cultural or dietary needs.',
      items: {
        type: 'object',
        properties: {
          vendorType: { type: 'string' },
          questions: { type: 'array', items: { type: 'string' }, maxItems: 5 },
        },
        required: ['vendorType', 'questions'],
      },
      maxItems: 5,
    },
  },
  required: ['themes', 'colorPalettes', 'menuIdeas', 'activities', 'decor', 'dayTimeline'],
} as const;

/**
 * Builds the system prompt for AI plan generation.
 * This is separate from user input — system prompt is not influenced by user data.
 */
export function buildSystemPrompt(): string {
  return `You are Occasio, an expert event planning assistant. You help users plan weddings, birthdays, and community events.

Your responsibilities:
- Suggest themes, color palettes, menu ideas, activities, decor ideas, and a day-of timeline
- Be culturally inclusive: do NOT assume religion, gender, family structure, or traditions
- Be practical and considerate of different budget ranges
- For menu ideas, always suggest labeling allergens and accommodating dietary needs

Your strict restrictions:
- NEVER suggest or imply specific vendor names, phone numbers, email addresses, or prices as facts
- NEVER give medical, legal, or immigration advice
- For permits, insurance, or licenses: give general guidance only and remind users to verify with local authorities
- All estimates are ranges, never guarantees
- Output ONLY valid JSON matching the schema. No commentary outside the JSON.
- Do not include markdown formatting in your response — only raw JSON.`;
}

/**
 * Builds the user prompt for AI plan generation.
 * All user-supplied fields are sanitized before embedding.
 */
export function buildGenerationPrompt(input: OnboardingInput): string {
  const safeCity = sanitizePromptField(input.city, 100);
  const safeStyle = sanitizePromptField(input.style, 200);
  const safeCultural = sanitizePromptField(input.culturalNeeds, 300);
  const safeDietary = (input.dietaryRequirements || [])
    .map((d) => sanitizePromptField(d, 50))
    .join(', ');
  const safePriorities = (input.priorities || [])
    .map((p) => sanitizePromptField(p, 50))
    .join(', ');

  // Compute lead time in days to avoid sending exact personal calendar dates
  let leadTimeNote = 'Flexible lead time';
  try {
    const eventTime = new Date(input.eventDate).getTime();
    if (!isNaN(eventTime)) {
      const nowTime = Date.now();
      const days = Math.max(1, Math.round((eventTime - nowTime) / (1000 * 60 * 60 * 24)));
      leadTimeNote = `Approximately ${days} days lead time`;
    }
  } catch {
    // fallback
  }

  // NOTE: eventName is deliberately omitted to protect user privacy.
  return `Generate personalized event planning ideas for the following event:

Event type: ${input.eventType}
Lead time: ${leadTimeNote}
Budget tier: ${input.currency} ${Math.round(input.budgetMinorUnits / 100).toLocaleString('en-US')}
${delimitField('city', safeCity)}
${delimitField('style', safeStyle || 'No specific style preference')}
${delimitField('dietaryRequirements', safeDietary || 'Standard catering')}
${delimitField('culturalNeeds', safeCultural || 'None specified')}
${delimitField('priorities', safePriorities || 'Balanced')}
Guest count: approximately ${input.guestCount}

Respond with a JSON object matching the schema. Keep content ideas concise (under 120 words each). Ensure color palette hex codes are valid. For textColor fields, use "#1C1917" for light swatches and "#FAF7F2" for dark swatches (WCAG AA contrast required).`;
}

/**
 * Builds the system prompt for the planning copilot.
 */
export function buildCopilotSystemPrompt(): string {
  return `You are the Occasio planning copilot. You help users modify their event plan through natural language.

When the user asks to make a change:
1. Identify what changed (budget category, timeline milestone, checklist item, etc.)
2. Return a JSON diff object describing the specific changes
3. Include a plain-language explanation

Strict rules:
- Budget math is always done by the system code — you describe WHAT to change, not the numbers
- Never suggest specific vendor names or prices
- Never make changes without explaining them
- Output only valid JSON

Output schema:
{
  "changes": [
    { "path": "string (dot-notation path)", "action": "set | delete | push", "value": "any" }
  ],
  "explanation": "string — plain language description of what will change",
  "requiresConfirmation": true
}`;
}

/**
 * Builds the user message for the copilot.
 */
export function buildCopilotPrompt(userMessage: string, planSummary: string): string {
  const safeMessage = sanitizePromptField(userMessage, 1000);
  const safeSummary = sanitizePromptField(planSummary, 2000);

  return `Current plan summary:
${delimitField('planSummary', safeSummary)}

User request:
${delimitField('userRequest', safeMessage)}`;
}

