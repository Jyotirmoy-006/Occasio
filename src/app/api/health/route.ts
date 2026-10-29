import { NextRequest, NextResponse } from 'next/server';
import { env, IS_DEMO_MODE } from '@/lib/env';

export type AiHealthState =
  | 'live'
  | 'demo_no_key'
  | 'unavailable_invalid_key'
  | 'unavailable_model_not_found'
  | 'unavailable_quota_limit'
  | 'unavailable_network_error';

export interface HealthResponse {
  status: 'ok';
  demoMode: boolean;
  aiStatus: AiHealthState;
  label: string;
  tooltip: string;
  model: string | null;
  timestamp: string;
}

// 60-second cache
let cachedResponse: HealthResponse | null = null;
let lastCheckTime = 0;
const CACHE_TTL_MS = 60 * 1000;

export function classifyAiError(err: unknown): {
  state: AiHealthState;
  label: string;
  tooltip: string;
  sanitizedClass: string;
} {
  const msg = err instanceof Error ? err.message : String(err);
  const status = (err as { status?: number })?.status;

  if (
    status === 400 ||
    status === 401 ||
    /API_KEY_INVALID|invalid.*api.*key|unauthenticated/i.test(msg)
  ) {
    return {
      state: 'unavailable_invalid_key',
      label: 'AI unavailable: invalid API key',
      tooltip: 'The configured GEMINI_API_KEY was rejected by Google AI. Please verify the key in .env.local.',
      sanitizedClass: 'AUTH_INVALID_KEY',
    };
  }

  if (status === 404 || /NOT_FOUND|model.*not.*found/i.test(msg)) {
    return {
      state: 'unavailable_model_not_found',
      label: 'AI unavailable: model not found',
      tooltip: 'The configured Gemini model ID was not found or is unavailable for this account.',
      sanitizedClass: 'MODEL_NOT_FOUND',
    };
  }

  if (status === 429 || /RESOURCE_EXHAUSTED|quota|rate.*limit/i.test(msg)) {
    return {
      state: 'unavailable_quota_limit',
      label: 'AI unavailable: quota or rate limit reached',
      tooltip: 'Gemini API quota or rate limit reached. The application is operating safely on the demo engine.',
      sanitizedClass: 'RATE_LIMIT_EXHAUSTED',
    };
  }

  return {
    state: 'unavailable_network_error',
    label: 'AI unavailable: network error or timeout',
    tooltip: 'Temporary network connection issue or timeout reaching Google AI. Running on demo engine.',
    sanitizedClass: 'NETWORK_TIMEOUT',
  };
}

export function recordAiCallResult(success: boolean, errorMsg?: string) {
  const now = Date.now();
  lastCheckTime = now;
  if (success) {
    cachedResponse = {
      status: 'ok',
      demoMode: false,
      aiStatus: 'live',
      label: 'AI live (gemini-3.5-flash-lite)',
      tooltip: 'Connected to Google Gemini (gemini-3.5-flash-lite). Real-time generation active.',
      model: 'gemini-3.5-flash-lite',
      timestamp: new Date().toISOString(),
    };
    console.log('[AI Health] AI_CALL_SUCCESS: gemini-3.5-flash-lite');
  } else {
    const classified = classifyAiError(errorMsg || 'Unknown error');
    console.log('[AI Health]', classified.sanitizedClass);
    cachedResponse = {
      status: 'ok',
      demoMode: true,
      aiStatus: classified.state,
      label: classified.label,
      tooltip: classified.tooltip,
      model: null,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function checkAiHealth(force = false): Promise<HealthResponse> {
  const now = Date.now();
  if (!force && cachedResponse && now - lastCheckTime < CACHE_TTL_MS) {
    return cachedResponse;
  }

  // 1. Missing key state
  if (IS_DEMO_MODE || !env.GEMINI_API_KEY) {
    console.log('[AI Health] DEMO_MODE_NO_KEY (GEMINI_API_KEY is unset)');
    const res: HealthResponse = {
      status: 'ok',
      demoMode: true,
      aiStatus: 'demo_no_key',
      label: 'Demo mode: no API key',
      tooltip: 'Running deterministic templates. Set GEMINI_API_KEY in .env.local and restart the server to activate live AI.',
      model: null,
      timestamp: new Date().toISOString(),
    };
    cachedResponse = res;
    lastCheckTime = now;
    return res;
  }

  // 2. Server-side key presence check (log presence only, never the value)
  console.log('[AI Health] GEMINI_API_KEY present (server-side verification initiated)');

  // 3. Perform a lightweight ping to the primary verified model
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const verifiedModel = 'gemini-3.5-flash-lite';

    const pingPromise = client.models.generateContent({
      model: verifiedModel,
      contents: 'ping',
    });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI health check timed out after 8s')), 8000)
    );

    await Promise.race([pingPromise, timeoutPromise]);

    const res: HealthResponse = {
      status: 'ok',
      demoMode: false,
      aiStatus: 'live',
      label: `AI live (${verifiedModel})`,
      tooltip: `Connected to Google Gemini (${verifiedModel}). Real-time generation active.`,
      model: verifiedModel,
      timestamp: new Date().toISOString(),
    };
    cachedResponse = res;
    lastCheckTime = now;
    console.log('[AI Health] HEALTH_CHECK_SUCCESS:', verifiedModel);
    return res;
  } catch (err: unknown) {
    const classified = classifyAiError(err);
    console.log('[AI Health]', classified.sanitizedClass);
    const res: HealthResponse = {
      status: 'ok',
      demoMode: true,
      aiStatus: classified.state,
      label: classified.label,
      tooltip: classified.tooltip,
      model: null,
      timestamp: new Date().toISOString(),
    };
    cachedResponse = res;
    lastCheckTime = now;
    return res;
  }
}

export async function GET(request?: NextRequest) {
  const force = request?.nextUrl ? request.nextUrl.searchParams.get('force') === '1' : false;
  const responseData = await checkAiHealth(force);
  return NextResponse.json(responseData);
}
