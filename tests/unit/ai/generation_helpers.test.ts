import { describe, it, expect, vi } from 'vitest';
import {
  buildDemoFallbackResult,
  repairPartialIdeas,
  requestModelContent,
} from '@/lib/ai/generation-helpers';
import type { GoogleGenAI } from '@google/genai';

describe('AI Generation Helpers', () => {
  it('builds demo fallback result with correct provenance', () => {
    const result = buildDemoFallbackResult('wedding', 'Fallback demo triggered');
    expect(result.isDemoFallback).toBe(true);
    expect(result.statusMessage).toBe('Fallback demo triggered');
    expect(result.ideas.provenance?.source).toBe('demo_engine');
    expect(result.ideas.themes.length).toBeGreaterThan(0);
  });

  it('repairs partial JSON into valid Ideas schema using fallback for missing sections', () => {
    const partialJson = {
      themes: [
        {
          id: 'custom-1',
          content: 'Bespoke Vintage Botanical',
          pinned: false,
          dismissed: false,
          isAIGenerated: true,
        },
      ],
      // colorPalettes, menuIdeas, activities, decor, dayTimeline are omitted
    };

    const repaired = repairPartialIdeas(partialJson, 'birthday', 'gemini-3.5-flash-lite');
    expect(repaired).not.toBeNull();
    expect(repaired?.themes[0]?.content).toBe('Bespoke Vintage Botanical');
    expect(repaired?.colorPalettes.length).toBeGreaterThan(0);
    expect(repaired?.provenance?.source).toBe('gemini');
    expect(repaired?.provenance?.modelId).toBe('gemini-3.5-flash-lite');
  });

  it('returns null if partial JSON repair cannot satisfy schema', () => {
    const brokenJson = {
      themes: [{ id: 123 }], // Invalid type for theme id/content
    };
    const result = repairPartialIdeas(brokenJson, 'community', 'gemini-3.5-flash-lite');
    expect(result).toBeNull();
  });

  it('requests model content successfully from Gemini SDK', async () => {
    const mockClient = {
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({ themes: [] }),
        }),
      },
    } as unknown as GoogleGenAI;

    const content = await requestModelContent(
      mockClient,
      'gemini-3.5-flash-lite',
      'user prompt',
      'system instruction',
    );
    expect(content).toBe(JSON.stringify({ themes: [] }));
  });

  it('throws when model returns empty text', async () => {
    const mockClient = {
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: '   ',
        }),
      },
    } as unknown as GoogleGenAI;

    await expect(
      requestModelContent(mockClient, 'gemini-3.5-flash-lite', 'user prompt', 'system instruction'),
    ).rejects.toThrow('Empty response from model');
  });
});
