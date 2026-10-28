import { NextResponse } from 'next/server';
import { IS_DEMO_MODE } from '@/lib/env';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    demoMode: IS_DEMO_MODE,
    timestamp: new Date().toISOString(),
  });
}
