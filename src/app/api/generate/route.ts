import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { OnboardingInputSchema, PlanSchema, type Plan } from '@/domain/schemas/plan';
import { createDefaultBudget } from '@/domain/budget/allocation';
import { generateTimeline } from '@/domain/timeline/generate';
import { generateChecklist } from '@/domain/checklist/generate';
import { generateEventPlanIdeas } from '@/lib/ai/client';
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import {
  API_PAYLOAD_MAX_BYTES,
  RATE_LIMIT_AI_MAX,
  RATE_LIMIT_AI_WINDOW_MS,
  SCHEMA_VERSION,
} from '@/lib/constants';

export async function POST(req: NextRequest) {
  // 1. IP rate limiting
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const rateLimit = checkRateLimit(`gen_${ip}`, RATE_LIMIT_AI_MAX, RATE_LIMIT_AI_WINDOW_MS);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a moment before generating another plan.' },
      { status: 429, headers: rateLimitHeaders(rateLimit) },
    );
  }

  // 2. Payload size check
  const contentLength = Number(req.headers.get('content-length') || 0);
  if (contentLength > API_PAYLOAD_MAX_BYTES) {
    return NextResponse.json(
      { error: 'Request payload too large' },
      { status: 413, headers: rateLimitHeaders(rateLimit) },
    );
  }

  try {
    const body: unknown = await req.json();

    // 3. Input validation
    const parsedInput = OnboardingInputSchema.safeParse(body);
    if (!parsedInput.success) {
      return NextResponse.json(
        { error: 'Invalid plan input', details: parsedInput.error.flatten() },
        { status: 400, headers: rateLimitHeaders(rateLimit) },
      );
    }

    const input = parsedInput.data;

    // 4. Deterministic domain layer builds budget, timeline, checklist
    const budget = createDefaultBudget(input.eventType, input.budgetMinorUnits);
    const timeline = generateTimeline(input.eventType, input.eventDate);
    const checklist = generateChecklist(input.eventType);

    // 5. AI layer generates creative ideas (with automatic fallback to demo engine)
    const { ideas, isDemoFallback, statusMessage } = await generateEventPlanIdeas(input);

    const now = new Date().toISOString();
    const plan: Plan = {
      id: crypto.randomUUID(),
      schemaVersion: SCHEMA_VERSION,
      eventType: input.eventType,
      eventName: input.eventName,
      eventDate: input.eventDate,
      guestCount: input.guestCount,
      budgetMinorUnits: input.budgetMinorUnits,
      currency: input.currency,
      city: input.city,
      style: input.style,
      culturalNeeds: input.culturalNeeds,
      priorities: input.priorities,
      budget,
      timeline,
      checklist,
      ideas,
      createdAt: now,
      updatedAt: now,
      isAIGenerated: !isDemoFallback,
    };

    // 6. Final verification against PlanSchema
    const validPlan = PlanSchema.parse(plan);

    return NextResponse.json(
      {
        plan: validPlan,
        isDemoFallback,
        statusMessage,
      },
      { headers: rateLimitHeaders(rateLimit) },
    );
  } catch (err) {
    console.error('Plan generation failed:', err);
    return NextResponse.json(
      { error: 'Failed to generate plan. Please try again.' },
      { status: 500, headers: rateLimitHeaders(rateLimit) },
    );
  }
}
