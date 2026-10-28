import { describe, it, expect } from 'vitest';
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';

describe('In-Memory Rate Limiter', () => {
  it('allows requests within limit and tracks remaining quota', () => {
    const ip = '192.168.1.100';
    const max = 3;
    const windowMs = 5000;

    const r1 = checkRateLimit(ip, max, windowMs);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(ip, max, windowMs);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(ip, max, windowMs);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);

    // 4th request exceeds limit
    const r4 = checkRateLimit(ip, max, windowMs);
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);

    const headers = rateLimitHeaders(r4);
    expect(headers['X-RateLimit-Remaining']).toBe('0');
    expect(headers['Retry-After']).toBeDefined();
  });

  it('resets quota after window expires', async () => {
    const ip = '192.168.1.101';
    const max = 1;
    const windowMs = 50; // 50ms window

    const r1 = checkRateLimit(ip, max, windowMs);
    expect(r1.allowed).toBe(true);

    const r2 = checkRateLimit(ip, max, windowMs);
    expect(r2.allowed).toBe(false);

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 60));

    const r3 = checkRateLimit(ip, max, windowMs);
    expect(r3.allowed).toBe(true);
  });
});
