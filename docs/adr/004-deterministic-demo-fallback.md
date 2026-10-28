# ADR 004: Deterministic Demo Engine Fallback

## Status
Accepted

## Context
Third-party AI APIs can experience network timeouts, transient 503 high-demand errors, strict quota exhaustion (HTTP 429), or absence of an API key when evaluators run the repository locally (`npm install && npm run dev`). Applications that crash or show empty blank states under these conditions fail the hackathon resilience criteria.

## Decision
Occasio provides a dual-mode generation architecture:
1. When `GEMINI_API_KEY` is present and Google endpoints are reachable, live creative synthesis executes via the official `@google/genai` SDK with strict timeout protection.
2. When `GEMINI_API_KEY` is absent, or if any live AI call throws an error or times out, the system automatically falls back to a deterministic, human-curated Demo Engine (`src/lib/ai/demo-engine.ts`).
3. Fallback responses conform to the exact same Zod `PlanSchema` and `IdeasSchema`, clearly badged in the UI as "Demo Mode" or "Template Fallback" with transparent messaging.

## Consequences
- **Positive**: 100% test and evaluation reliability: the app works immediately out of the box with zero external configuration.
- **Positive**: Deterministic unit testing for UI and downstream domain logic without mocking network calls.
- **Positive**: Zero latency or downtime during hackathon judging evaluation.
