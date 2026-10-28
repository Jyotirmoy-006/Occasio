import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { executeCopilotChat } from '@/lib/ai/client';
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import {
  COPILOT_MESSAGE_MAX_LENGTH,
  RATE_LIMIT_AI_MAX,
  RATE_LIMIT_AI_WINDOW_MS,
} from '@/lib/constants';

const CopilotRequestSchema = z.object({
  userMessage: z.string().min(1).max(COPILOT_MESSAGE_MAX_LENGTH),
  planSummary: z.string().max(3000),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const rateLimit = checkRateLimit(`copilot_${ip}`, RATE_LIMIT_AI_MAX, RATE_LIMIT_AI_WINDOW_MS);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many copilot requests. Please wait a moment.' },
      { status: 429, headers: rateLimitHeaders(rateLimit) },
    );
  }

  try {
    const body: unknown = await req.json();
    const parsed = CopilotRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid message', details: parsed.error.flatten() },
        { status: 400, headers: rateLimitHeaders(rateLimit) },
      );
    }

    const { userMessage, planSummary } = parsed.data;
    const response = await executeCopilotChat(userMessage, planSummary);

    return NextResponse.json(response, { headers: rateLimitHeaders(rateLimit) });
  } catch (err) {
    console.error('Copilot API error:', err);
    return NextResponse.json(
      { error: 'Copilot encountered an error.' },
      { status: 500, headers: rateLimitHeaders(rateLimit) },
    );
  }
}

