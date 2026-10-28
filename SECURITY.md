# Security Policy & Threat Model — Occasio

Occasio adheres to defense-in-depth principles across client, server, and AI integration boundaries.

## 1. Threat Model & Mitigations

| Threat | Risk Level | Mitigation Strategy | Implementation |
|---|---|---|---|
| **Gemini API Key Leakage** | Critical | Keys are stored only on the server environment (`.env.local`). Next.js route handlers isolate AI calls. No client bundle contains the SDK or key references. | `src/app/api/generate/route.ts`, `.gitignore` |
| **Prompt Injection Attacks** | High | User inputs are stripped of control characters, jailbreak phrases, and system override tags. Inputs are wrapped in semantic XML delimiters (`<user_city>`, `<user_style>`) before prompt interpolation. Output is schema-constrained JSON. | `src/lib/ai/sanitize.ts`, `src/lib/ai/prompts.ts` |
| **Cross-Site Scripting (XSS)** | High | Strict Content Security Policy (CSP) blocking unauthorized external scripts. No use of `dangerouslySetInnerHTML`. React automatic text escaping on all AI and user nodes. | `next.config.ts`, all JSX components |
| **Malicious JSON Import DOS** | Medium | File size strictly capped at 512 KB before parsing. Contents must validate against the comprehensive Zod `PlanSchema` before state hydration. | `src/lib/storage/index.ts`, `src/components/export/ExportModal.tsx` |
| **Server Resource Exhaustion** | Medium | Per-IP sliding-window rate limiting (LRU cache) on `/api/generate` (60 req/min) and `/api/copilot`. Strict 4 KB payload limit and request timeouts. | `src/lib/rate-limit.ts`, `src/app/api/generate/route.ts` |
| **Data Privacy & PII Leakage** | High | Local-first persistence. The app never asks for, transmits, or stores user names, phone numbers, or email addresses. All plan data remains in browser `localStorage`. | `src/lib/storage/index.ts`, `src/components/onboarding/OnboardingModal.tsx` |
| **Hallucinated Business Recommendations** | Medium | System instructions explicitly forbid generating real vendor phone numbers, ratings, or prices presented as fact. Domain checklist only produces vendor types. | `src/lib/ai/prompts.ts`, `src/domain/checklist/generate.ts` |

## 2. Content Security Policy (CSP)

Occasio enforces strict HTTP security headers via `next.config.ts`:
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

## 3. Dependency Auditing

`npm audit --audit-level=high` is run in CI. Automated vulnerability reporting ensures all production and development dependencies are free of known high- or critical-severity CVEs.
Current audit status: **0 vulnerabilities**.

## 4. Known Limitations

- **Rate Limiting Persistence**: The current rate limiter uses an in-memory LRU cache per server instance. In a distributed multi-pod environment (e.g., Kubernetes), this should be backed by Redis or Upstash.
- **Single-Device Storage**: Because plans are stored in browser `localStorage`, multi-device collaboration requires exporting and importing JSON backup files.
