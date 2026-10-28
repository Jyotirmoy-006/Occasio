import { describe, it, expect, vi, beforeEach } from 'vitest';
import { classifyAiError, checkAiHealth, recordAiCallResult } from '@/app/api/health/route';

describe('AI Health States & Classification (/api/health)', () => {
  it('correctly classifies invalid API key errors (400, 401, API_KEY_INVALID)', () => {
    const err400 = { status: 400, message: 'API key not valid. Please pass a valid API key.' };
    const res1 = classifyAiError(err400);
    expect(res1.state).toBe('unavailable_invalid_key');
    expect(res1.label).toBe('AI unavailable: invalid API key');
    expect(res1.sanitizedClass).toBe('AUTH_INVALID_KEY');

    const errKey = new Error('Request had invalid authentication credentials. Expected OAuth 2 access token, login cookie or other valid authentication credential. API_KEY_INVALID');
    const res2 = classifyAiError(errKey);
    expect(res2.state).toBe('unavailable_invalid_key');
  });

  it('correctly classifies model not found errors (404, NOT_FOUND)', () => {
    const err404 = { status: 404, message: 'models/gemini-unreal is not found for API version v1beta' };
    const res = classifyAiError(err404);
    expect(res.state).toBe('unavailable_model_not_found');
    expect(res.label).toBe('AI unavailable: model not found');
    expect(res.sanitizedClass).toBe('MODEL_NOT_FOUND');
  });

  it('correctly classifies quota & rate limit errors (429, RESOURCE_EXHAUSTED)', () => {
    const err429 = { status: 429, message: 'Resource has been exhausted (e.g. check quota).' };
    const res = classifyAiError(err429);
    expect(res.state).toBe('unavailable_quota_limit');
    expect(res.label).toBe('AI unavailable: quota or rate limit reached');
    expect(res.sanitizedClass).toBe('RATE_LIMIT_EXHAUSTED');
  });

  it('correctly classifies network errors and timeouts (503, ETIMEDOUT, fetch failed)', () => {
    const errTimeout = new Error('The operation was aborted due to timeout');
    const res1 = classifyAiError(errTimeout);
    expect(res1.state).toBe('unavailable_network_error');
    expect(res1.label).toBe('AI unavailable: network error or timeout');
    expect(res1.sanitizedClass).toBe('NETWORK_TIMEOUT');

    const err503 = { status: 503, message: 'Service Unavailable' };
    const res2 = classifyAiError(err503);
    expect(res2.state).toBe('unavailable_network_error');
  });

  it('recordAiCallResult updates in-memory status and caches state', async () => {
    // Record failure
    recordAiCallResult(false, 'API_KEY_INVALID');
    const healthFail = await checkAiHealth(false);
    expect(healthFail.aiStatus).toBe('unavailable_invalid_key');
    expect(healthFail.label).toBe('AI unavailable: invalid API key');
    expect(healthFail.demoMode).toBe(true);

    // Record success
    recordAiCallResult(true);
    const healthSuccess = await checkAiHealth(false);
    expect(healthSuccess.aiStatus).toBe('live');
    expect(healthSuccess.label).toBe('AI live (gemini-3.5-flash-lite)');
    expect(healthSuccess.demoMode).toBe(false);
  });
});

