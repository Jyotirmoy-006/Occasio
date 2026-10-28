/**
 * Rate limiter — sliding window per IP using an in-process LRU cache.
 * NOTE: Resets on cold start; sufficient for hackathon scale.
 * For production, replace with Redis or Upstash.
 */

import { LRUCache } from 'lru-cache';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const cache = new LRUCache<string, RateLimitEntry>({
  max: 500,
  ttl: 60_000, // 1 minute default TTL
});

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Checks and increments the rate limit counter for a given key.
 *
 * @param key - Typically the IP address
 * @param maxRequests - Maximum allowed requests per window
 * @param windowMs - Window duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = cache.get(key);

  if (!entry || now >= entry.resetAt) {
    const newEntry: RateLimitEntry = { count: 1, resetAt: now + windowMs };
    cache.set(key, newEntry);
    return { allowed: true, remaining: maxRequests - 1, resetAt: newEntry.resetAt };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  cache.set(key, entry);
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

/**
 * Returns standardized rate-limit response headers.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
    'Retry-After': result.allowed ? '' : String(Math.ceil((result.resetAt - Date.now()) / 1000)),
  };
}

