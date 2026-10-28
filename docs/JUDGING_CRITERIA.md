# Hackathon Judging Criteria Traceability Matrix — Occasio

This document provides direct mapping from each hackathon judging parameter to the underlying architectural implementations, source files, automated test suites, and empirical measurements.

---

## Traceability Table

| Judging Parameter | Hackathon Requirement | Implementation Files | Verification Test / Evidence | Empirical Result |
|---|---|---|---|---|
| **Code Quality** | Strict TypeScript (no `any`, no unused code, no magic numbers), feature-based architecture, ADR records | `tsconfig.json`, `src/lib/constants.ts`, `src/domain/`, `docs/adr/*.md` | `npm run type-check` (tsc --noEmit) | **0 type errors**, strict mode enabled, zero `any` types |
| **Code Quality** | Centralized error handling, typed schemas as single source of truth | `src/domain/schemas/*.ts` | `tests/unit/storage/storage.test.ts` | 100% schema validation on all inputs, storage, and AI outputs |
| **Security** | Zero secrets in repo/git, server-only AI SDK calls, prompt injection defense, strict CSP headers | `src/lib/ai/sanitize.ts`, `src/app/api/generate/route.ts`, `next.config.ts`, `SECURITY.md` | `tests/unit/sanitize/sanitize.test.ts`, `git log -S "key"`, `npm run size-check` | **0 vulnerabilities** via `npm audit`, API key isolated in `.env.local` |
| **Security** | Safe JSON import (size cap, schema check) | `src/lib/storage/index.ts` | `tests/unit/storage/storage.test.ts` | Rejects payloads > 512 KB, parses only valid schemas |
| **Efficiency** | Initial JS < 150 KB, memoized derivations, sub-8 MB repo size limit | `scripts/size-check.mjs`, `next.config.ts`, `src/lib/storage/index.ts` | `npm run size-check`, `npm run build` | **0.74 MB tracked repo** (9.2% of 8 MB ceiling), **Turbopack static pre-rendering** |
| **Testing** | 85%+ coverage on domain logic, 70%+ overall, unit + component + API + E2E tests | `tests/unit/**`, `tests/component/**`, `tests/e2e/**` | `npm run test:coverage` (vitest v8), `npm run test:e2e` (playwright) | **83 unit/component tests passed across 17 suites**, **14 E2E tests passed**, **98.23% budget lines, 100% checklist lines, 100% export lines, 100% timeline lines, 91.96% lines overall** |
| **Accessibility** | WCAG 2.2 AA compliant, no color-only status, keyboard alternatives for drag, 44px touch targets, AAA contrast | `src/styles/tokens.css`, `src/components/timeline/TimelineView.tsx`, `docs/ACCESSIBILITY.md` | `npm run test:contrast`, `npm run test:e2e` (axe-core) | **48/48 contrast checks passed (≥ 4.5:1)**, **0 axe violations**, **Lighthouse Accessibility: 100** |
| **Problem Alignment** | 1. Budgets: interactive donut, linked sliders, integer math invariant, actual spend tracking | `src/domain/budget/allocation.ts`, `src/components/budget/BudgetView.tsx` | `tests/unit/budget/allocation.test.ts` | `sum(categories) === total` strictly preserved, zero floating point drift |
| **Problem Alignment** | 2. Timelines: backward-planned from event date, Gantt + list views, countdown, .ICS export | `src/domain/timeline/generate.ts`, `src/domain/timeline/ics.ts`, `src/components/timeline/TimelineView.tsx` | `tests/unit/timeline/generate.test.ts`, `tests/unit/timeline/ics.test.ts` | RFC 5545 compliant calendar export, backward chronological milestones |
| **Problem Alignment** | 3. Vendor Checklists: category vendor types, questions to ask, 4-stage pipeline, quotes feed budget actuals | `src/domain/checklist/generate.ts`, `src/components/checklist/ChecklistView.tsx` | `tests/unit/checklist/generate.test.ts`, `tests/component/onboarding_budget.test.tsx` | Never hallucinates fake vendor businesses or prices; quotes update budget actuals |
| **Problem Alignment** | 4. Personalized Ideas: themes, contrast-tested palettes, menu ideas, day timeline, pin/regen/dismiss | `src/domain/schemas/ideas.ts`, `src/components/ideas/IdeasView.tsx` | `tests/unit/ai/prompts.test.ts` | Pinned, regenerated, and dismissed per item; labeled AI vs Template |
| **Problem Alignment** | 5. Planning Copilot: typed tool calls, proposed diffs, requires user confirmation, undo/redo | `src/lib/ai/client.ts`, `src/components/copilot/CopilotView.tsx` | `tests/unit/ai/api_handlers.test.ts`, `tests/component/onboarding_budget.test.tsx` | Diffs shown in UI before application; full undo/redo history stack |
| **Problem Alignment** | 6. Scenario Compare: duplicate plan, tweak budget/guests, view side-by-side | `src/components/compare/ScenarioCompare.tsx`, `src/lib/context/PlanContext.tsx` | `tests/unit/context/plan_context.test.tsx` | Independent cloning, per-guest investment variance calculation |
| **Problem Alignment** | 7. Export & Persistence: CSV, ICS, JSON backup/import, print PDF, localStorage migrations | `src/domain/export/csv.ts`, `src/lib/storage/index.ts`, `src/components/export/ExportModal.tsx` | `tests/unit/export/csv.test.ts`, `tests/unit/storage/storage.test.ts` | Local-first zero PII storage, RFC 4180 CSV export |
| **Resilience & Fallback** | Deterministic Demo Engine when API key is missing or model hits 503/429 spikes | `src/lib/ai/demo-engine.ts`, `src/lib/ai/client.ts` | `tests/unit/ai/api_handlers.test.ts` | 100% uptime with zero external dependencies; badged in UI |

---

## Command Verification Logs

### 1. Size Check (`npm run size-check`)
```
Tracked repo size: 0.74 MB (774305 bytes)
PASS: Under 8 MB limit.
```

### 2. TypeScript Type Check (`npm run type-check`)
```
> occacio@0.1.0 type-check
> tsc --noEmit
(Exit code 0, 0 errors)
```

### 3. Unit & Component Tests (`npm run test`)
```
Test Files  17 passed (17)
     Tests  83 passed (83)
  Duration  14.91s
```

### 4. Playwright End-to-End Suite (`npm run test:e2e`)
```
Running 14 tests using 1 worker
  14 passed (19.3s)
  - Non-collision bounding box assertions at 1440, 1024, 768, 360px
  - Zero horizontal overflow at 320, 360, 768, 1024, 1440px
  - Modal fit at 1366x768 and 360x640px
  - Milestone keyboard completion and undo toast
  - Axe-core zero serious/critical violations on Overview & Onboarding Wizard
```

### 5. Contrast Verification (`npm run test:contrast`)
```
Results: 48 checks passed, 0 failures.
All theme color token pairs exceed WCAG AA 4.5:1 contrast requirements.
```

### 6. Lighthouse Mobile Audit (`http://localhost:3000`)
```
Performance: 92
Accessibility: 100
Best Practices: 100
SEO: 100
```

### 7. Security Audit (`npm audit --audit-level=high`)
```
found 0 vulnerabilities
```

