# ADR 001: Server-Side Only AI Invocation via Next.js Route Handlers

## Status
Accepted

## Context
Occasio uses Google's Gemini models via the official `@google/genai` SDK. In single-page applications or direct client-side integration patterns, API keys or secret tokens are frequently bundled into browser scripts or exposed in network traffic inspectable by end-users.

## Decision
All interactions with the Gemini API are executed exclusively from Next.js server route handlers (`/api/generate` and `/api/copilot`). The client bundle contains zero Gemini SDK imports and zero references to `process.env.GEMINI_API_KEY`. The browser communicates with the server via standard JSON endpoints protected by rate limiting and payload validation.

## Consequences
- **Positive**: Complete prevention of API key leakage to browser inspect tools or reverse engineering.
- **Positive**: Strict system prompt enforcement that cannot be bypassed or tampered with by client-side modifications.
- **Positive**: Server-side payload sanitization and prompt-injection defense before prompt construction.
- **Tradeoff**: Route handlers introduce a small network hop between client and server before reaching Google's AI endpoints. Mitigated by low-overhead streaming and server-side timeouts.

