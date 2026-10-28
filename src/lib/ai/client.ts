/**
 * Gemini AI Client for Occasio (Server-Side Only).
 *
 * Implements:
 * 1. Primary AI generation via official @google/genai SDK
 * 2. Timeout protection and automatic 1-retry on 503
 * 3. Structured JSON generation & Zod validation
 * 4. Deterministic fallback to Demo Engine on any error, timeout, or missing API key
 */

import { GoogleGenAI } from '@google/genai';
import { env, IS_DEMO_MODE } from '@/lib/env';
import { AI_MAX_OUTPUT_TOKENS, AI_TIMEOUT_MS } from '@/lib/constants';
import {
  buildSystemPrompt,
  buildGenerationPrompt,
  buildCopilotSystemPrompt,
  buildCopilotPrompt,
} from './prompts';
import { getDemoIdeas } from './demo-engine';
import { IdeasSchema } from '@/domain/schemas/ideas';
import type { Ideas } from '@/domain/schemas/ideas';
import type { OnboardingInput } from '@/domain/schemas/plan';
import { z } from 'zod';

let _aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (IS_DEMO_MODE || !env.GEMINI_API_KEY) return null;
  if (!_aiClient) {
    _aiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return _aiClient;
}

export type GenerationResult = {
  ideas: Ideas;
  isDemoFallback: boolean;
  statusMessage?: string;
};

/**
 * Generates personalized event ideas using Gemini.
 * Falls back deterministically to demo engine on any error, timeout, or missing key.
 */
export async function generateEventPlanIdeas(
  input: OnboardingInput,
): Promise<GenerationResult> {
  const client = getAiClient();

  if (!client) {
    return {
      ideas: getDemoIdeas(input.eventType),
      isDemoFallback: true,
      statusMessage: 'Running in Demo Mode (deterministic templates). Set GEMINI_API_KEY for live AI.',
    };
  }

  const systemInstruction = buildSystemPrompt();
  const userPrompt = buildGenerationPrompt(input);

  // Models to try in order
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.8-flash'];

  for (const model of models) {
    try {
      const generatePromise = client.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction,
          maxOutputTokens: AI_MAX_OUTPUT_TOKENS,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      // Timeout wrapper
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timed out')), AI_TIMEOUT_MS),
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const rawText = response.text?.trim();

      if (!rawText) {
        throw new Error('Empty response from model');
      }

      // Parse JSON
      const json = JSON.parse(rawText);

      // Validate against IdeasSchema
      const validated = IdeasSchema.safeParse(json);
      if (validated.success) {
        return {
          ideas: validated.data,
          isDemoFallback: false,
          statusMessage: 'Generated live with Gemini.',
        };
      }

      // If partial match, attempt repair
      console.warn('AI output did not fully match IdeasSchema, repairing:', validated.error.flatten());
      const fallback = getDemoIdeas(input.eventType);
      const repaired: Ideas = {
        themes: Array.isArray(json.themes) && json.themes.length > 0 ? json.themes : fallback.themes,
        colorPalettes: Array.isArray(json.colorPalettes) && json.colorPalettes.length > 0 ? json.colorPalettes : fallback.colorPalettes,
        menuIdeas: Array.isArray(json.menuIdeas) && json.menuIdeas.length > 0 ? json.menuIdeas : fallback.menuIdeas,
        activities: Array.isArray(json.activities) && json.activities.length > 0 ? json.activities : fallback.activities,
        decor: Array.isArray(json.decor) && json.decor.length > 0 ? json.decor : fallback.decor,
        dayTimeline: Array.isArray(json.dayTimeline) && json.dayTimeline.length > 0 ? json.dayTimeline : fallback.dayTimeline,
      };

      const repairedValid = IdeasSchema.safeParse(repaired);
      if (repairedValid.success) {
        return {
          ideas: repairedValid.data,
          isDemoFallback: false,
          statusMessage: 'Generated live with Gemini (repaired schema).',
        };
      }
    } catch (err) {
      console.warn(`Gemini generation failed on model ${model}:`, err instanceof Error ? err.message : String(err));
      // Continue to next model or fallback
    }
  }

  // Graceful fallback to demo engine
  return {
    ideas: getDemoIdeas(input.eventType),
    isDemoFallback: true,
    statusMessage: 'AI temporarily unavailable or high demand. High-quality curated template loaded.',
  };
}

export const CopilotChangeSchema = z.object({
  action: z.enum(['set', 'delete', 'push', 'scale_budget', 'add_milestone', 'update_checklist']),
  target: z.string(),
  value: z.unknown(),
  description: z.string(),
});

export const CopilotResponseSchema = z.object({
  explanation: z.string(),
  proposedChanges: z.array(CopilotChangeSchema),
  requiresConfirmation: z.literal(true),
  isDemoFallback: z.boolean().default(false),
});

export type CopilotResponse = z.infer<typeof CopilotResponseSchema>;

/**
 * Handles planning copilot chat interactions.
 */
export async function executeCopilotChat(
  userMessage: string,
  planSummary: string,
): Promise<CopilotResponse> {
  const client = getAiClient();

  if (!client) {
    return generateFallbackCopilotResponse(userMessage);
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: buildCopilotPrompt(userMessage, planSummary),
      config: {
        systemInstruction: buildCopilotSystemPrompt(),
        responseMimeType: 'application/json',
        maxOutputTokens: 1024,
      },
    });

    const raw = response.text?.trim();
    if (!raw) throw new Error('Empty copilot response');

    const parsed = JSON.parse(raw);
    const valid = CopilotResponseSchema.safeParse(parsed);
    if (valid.success) {
      return valid.data;
    }
  } catch (err) {
    console.warn('Copilot live call failed, using fallback rule engine:', err instanceof Error ? err.message : String(err));
  }

  return generateFallbackCopilotResponse(userMessage);
}

/**
 * Deterministic rule-based copilot fallback.
 * Understands common event planning commands like:
 * - "cut budget by 10%"
 * - "add milestone"
 * - "increase catering"
 */
export function generateFallbackCopilotResponse(userMessage: string): CopilotResponse {
  const lower = userMessage.toLowerCase();

  if (lower.includes('cut') || lower.includes('reduce') || lower.includes('decrease')) {
    return {
      explanation: 'I propose reducing the overall budget by 10% while proportionally scaling down non-locked categories to preserve your planning balance.',
      proposedChanges: [
        {
          action: 'scale_budget',
          target: 'budget.totalMinorUnits',
          value: 0.9,
          description: 'Scale total budget to 90%',
        },
      ],
      requiresConfirmation: true,
      isDemoFallback: true,
    };
  }

  if (lower.includes('increase') || lower.includes('add budget') || lower.includes('more budget')) {
    return {
      explanation: 'I propose increasing the total budget by 10% and allocating the surplus proportionally across categories.',
      proposedChanges: [
        {
          action: 'scale_budget',
          target: 'budget.totalMinorUnits',
          value: 1.1,
          description: 'Scale total budget to 110%',
        },
      ],
      requiresConfirmation: true,
      isDemoFallback: true,
    };
  }

  return {
    explanation: `I've analyzed your request: "${userMessage}". To apply this cleanly to your plan, please confirm this adjustment.`,
    proposedChanges: [
      {
        action: 'set',
        target: 'ideas.customNote',
        value: userMessage,
        description: `Plan note: ${userMessage}`,
      },
    ],
    requiresConfirmation: true,
    isDemoFallback: true,
  };
}
