import { NextResponse } from 'next/server';
import { env, IS_DEMO_MODE } from '@/lib/env';

// Track last known AI health state in memory
let lastKnownLiveSuccess = false;
let lastKnownCheckTime = 0;
let lastKnownError = '';

export function recordAiCallResult(success: boolean, errorMsg?: string) {
  lastKnownLiveSuccess = success;
  lastKnownCheckTime = Date.now();
  if (!success && errorMsg) {
    lastKnownError = errorMsg;
  }
}

export async function GET() {
  if (IS_DEMO_MODE || !env.GEMINI_API_KEY) {
    return NextResponse.json({
      status: 'ok',
      demoMode: true,
      aiStatus: 'demo_no_key',
      label: 'Demo mode (no key)',
      tooltip: 'Running deterministic templates. Set GEMINI_API_KEY for live AI.',
      model: null,
      timestamp: new Date().toISOString(),
    });
  }

  // If we haven't tested in the last 5 minutes, or on startup, perform a lightweight check
  const now = Date.now();
  if (now - lastKnownCheckTime > 5 * 60 * 1000) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      // Fast check with current model
      await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: 'ping',
        config: { maxOutputTokens: 5 },
      });
      lastKnownLiveSuccess = true;
      lastKnownCheckTime = now;
      lastKnownError = '';
    } catch (err: unknown) {
      lastKnownLiveSuccess = false;
      lastKnownCheckTime = now;
      lastKnownError = err instanceof Error ? err.message : String(err);
    }
  }

  if (lastKnownLiveSuccess) {
    return NextResponse.json({
      status: 'ok',
      demoMode: false,
      aiStatus: 'ai_live',
      label: 'AI live',
      tooltip: 'Connected to Gemini (gemini-3.5-flash). Real-time generation active.',
      model: 'gemini-3.5-flash',
      timestamp: new Date().toISOString(),
    });
  } else {
    return NextResponse.json({
      status: 'ok',
      demoMode: true,
      aiStatus: 'ai_unavailable_fallback',
      label: 'AI unavailable, using demo engine',
      tooltip: `Gemini service is temporarily unreachable or busy (${lastKnownError.slice(0, 80)}). Automatic demo engine fallback active.`,
      model: 'demo-engine',
      timestamp: new Date().toISOString(),
    });
  }
}
