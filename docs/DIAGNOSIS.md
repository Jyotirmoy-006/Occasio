# Occasio Comprehensive Diagnosis & Evaluation Audit

**Date**: November 1, 2026  
**Target Deployment**: `https://occasio-ochre.vercel.app`  
**Git Rollback Baseline**: `pre-improvement` (`8c33d38f5ddb633f3787adcbbcb2b8db57c8e17e`)  
**Active Evaluation Score**: 96.83 / 100 (Code Quality: 88, Security: 99, Efficiency: 100, Testing: 99, Accessibility: 100, Alignment: 100)

---

## 1. Executive Summary

This diagnostic report provides empirical, measured evidence across all six evaluation dimensions of Occasio, with a focused investigation into the weakest scoring dimension (**Code Quality: 88**) and the production live deployment state.

### Key Takeaways
1. **Live Site Health**: The live Vercel deployment (`occasio-ochre.vercel.app`) is active, functional, and successfully connected to Google Gemini (`gemini-3.5-flash-lite`). Every `<script>` tag carries a fresh, dynamically matching CSP nonce on request.
2. **Defects Identified**:
   - **P0 / CSP Event**: Zod's internal JIT detection triggers an uncaught `Function("")` capability test on the browser client, resulting in a `securitypolicyviolation` event for directive `script-src` (`blockedURI: "eval"`). Setting `z.config({ jitless: true })` on the server layout did not propagate to client-side bundles.
   - **P0 / Timeline Unit Test Failure**: When run on a Sunday (such as Nov 1, 2026), `generateTimeline` snaps weekend deadlines backward to the preceding Friday, which can push milestone dates into the past for events scheduled 2 weeks out. This broke `tests/unit/timeline/generate.test.ts`.
   - **P1 / Monolithic Component Architecture**: Two massive UI components—`OnboardingModal.tsx` (1,015 lines) and `OverviewView.tsx` (851 lines)—contain coupled presentation, calculation, and wizard step orchestration logic.
   - **P1 / Dependency Bloat**: 20 packages listed in `dependencies` (including `@dnd-kit/*`, `framer-motion`, `recharts`, and 13 `@radix-ui/*` primitives) are never imported or used anywhere in `src/`.
   - **P2 / Testing Gaps**: Branch coverage in `PlanContext.tsx` is at 47.5% and `storage/index.ts` is at 70.5%, leaving storage quota failures and corrupted JSON recovery untested.
   - **P3 / Documentation Discrepancies**: The README previously cited 25 Playwright tests (now 36) and mobile Lighthouse 99 (now 75 under dynamic rendering and mobile throttling).

---

## 2. Phase 1A: Live Site Empirical Diagnosis

Audited against `https://occasio-ochre.vercel.app` using Playwright, curl, and Google Lighthouse:

### A. Nonce Matching & Cache Headers
```text
=== Request 1 ===
x-vercel-cache:         MISS (Dynamic on-demand rendering)
cache-control:          private, no-cache, no-store, max-age=0, must-revalidate
CSP header nonce:       NjM0MDU4NTMtZjBjMC00M2Q2LTg2N2QtNjM2MGQ5NGI5MWVi
Total <script> tags:    12
Scripts matching CSP:   12 / 12 (100%)
Scripts WITHOUT nonce:  0

=== Request 2 ===
x-vercel-cache:         MISS
cache-control:          private, no-cache, no-store, max-age=0, must-revalidate
CSP header nonce:       ZWJmOTliMmQtZGIyZi00NjFmLTliZmEtODA4MTk5NzRhYzAy
Total <script> tags:    12
Scripts matching CSP:   12 / 12 (100%)
Scripts WITHOUT nonce:  0
```
- **Result**: Nonce generation works correctly; nonces change on every request and match 100% of emitted scripts.

### B. Health & AI Connectivity (`/api/health`)
```json
{
  "status": "ok",
  "demoMode": false,
  "aiStatus": "live",
  "label": "AI live (gemini-3.5-flash-lite)",
  "tooltip": "Connected to Google Gemini (gemini-3.5-flash-lite). Real-time generation active.",
  "model": "gemini-3.5-flash-lite",
  "timestamp": "2026-11-01T06:21:02.603Z"
}
```

### C. Live Interactive User Flows & Accessibility
- **Console Errors**: 0
- **Page Errors**: 0
- **Failed Same-Origin HTTP Requests**: 0
- **Axe-core Scan on Live Overview**: 0 violations (100% accessible)
- **Tab Switching**: All 7 tabs (Overview, Budget, Timeline, Checklist, Ideas, Copilot, Compare) switch without errors.
- **New Plan Wizard**: Opens, fills event details, advances through steps.
- **Command Palette (`Ctrl+K`)**: Opens and closes smoothly.
- **Identified Flaw**: Modal does not close when the `Escape` key is pressed; user must click the explicit close button.

### D. Live Lighthouse Mobile Audit
- **Performance**: 75 (FCP: 2.9s, LCP: 3.1s, TBT: 540ms, CLS: 0.000)
- **Accessibility**: 100 / 100
- **Best Practices**: 96 / 100
- **SEO**: 100 / 100

---

## 3. Phase 1B: Code Quality & Architecture Audit

### A. Size & Volume Distribution
- Total Files Analyzed in `src/`: 50
- Total Source Lines (SLOC): 7,832
- Total Lines (LOC): 9,073

### B. Monolithic Files (> 300 LOC)
1. `src/components/onboarding/OnboardingModal.tsx`: **1,015 lines** (SLOC 934)
   - Houses Step 1 (Event), Step 2 (Date/City), Step 3 (Budget/Guests), Step 4 (Priorities/Inclusions), and wizard state.
2. `src/components/overview/OverviewView.tsx`: **851 lines** (SLOC 783)
   - Houses Hero card, Section I (Deadlines), Section II (Health Alerts), Section III (Budget Ledger), Section IV (Vendor pipeline), Section V (Styling preview).
3. `src/lib/ai/demo-engine.ts`: **593 lines** (SLOC 563)
   - Deterministic offline plan synthesizer.
4. `src/components/budget/BudgetView.tsx`: **422 lines** (SLOC 389)
   - Donut chart, ledger table, category sliders.
5. `src/components/timeline/TimelineView.tsx`: **337 lines** (SLOC 312)
6. `src/components/ideas/IdeasView.tsx`: **309 lines** (SLOC 280)

### C. Code Cleanliness Metrics
- **`any` usages**: **0** (Exceptional type safety)
- **`@ts-ignore` / `@ts-expect-error`**: **0**
- **`eslint-disable`**: **0**
- **`TODO` / `FIXME`**: **0**
- **Commented-out code blocks**: **0**
- **Circular dependencies**: **0** (Verified via DFS graph traversal)
- **`console.log` statements**: **6** (all in `src/app/api/health/route.ts` for server logging)
- **Non-null assertions (`!`)**: **3** (in test harnesses or DOM focus lookups)
- **Type casts (`as`)**: **19** (mostly DOM element casting like `e.target as HTMLElement`)

### D. Unused Dependencies (Dead Code in `package.json`)
The following 20 packages are declared in `package.json` but have zero imports across `src/`:
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- `@radix-ui/react-alert-dialog`, `@radix-ui/react-checkbox`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`, `@radix-ui/react-progress`, `@radix-ui/react-scroll-area`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slider`, `@radix-ui/react-tabs`, `@radix-ui/react-toast`, `@radix-ui/react-toggle`
- `@types/canvas-confetti`, `canvas-confetti`
- `framer-motion`
- `recharts`

---

## 4. Phase 1C: Security & Privacy Audit

1. **Content Security Policy**:
   - Directive: `default-src 'self'; script-src 'self' 'nonce-{nonce}' 'strict-dynamic'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none';`
   - Verified: Nonce-based, strictly dynamic, zero `unsafe-eval` permitted in production.
2. **Security Headers**:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
3. **API Route Hardening**:
   - `/api/generate`: Rate limited (IP sliding window via LRU cache), 10 KB payload max limit, strict Zod parsing, PII stripping before Gemini dispatch.
   - `/api/copilot`: Rate limited, 3,000 char plan summary cap, 500 char user message cap.
   - `/api/health`: 60s in-memory cache, 8s timeout on Google GenAI ping to prevent hung requests.
4. **Secret Scanning**:
   - Scanned working tree and full git history across all commits and branches.
   - Result: **0 API keys, tokens, or credentials committed** (`.env.local` was never tracked).
5. **NPM Audit**:
   - 0 high or critical vulnerabilities.

---

## 5. Phase 1D: Testing & Accessibility Gaps

1. **Defect in `generateTimeline`**:
   - `tests/unit/timeline/generate.test.ts` fails when an event is 14 days out on a Sunday: backward snapping pushes Sunday deadlines back to Friday, placing deadlines before "today".
   - Fix required: Clamp minimum due date to `today` so milestones never occur in the past.
2. **Coverage Gaps**:
   - `lib/context/PlanContext.tsx`: 47.5% branch coverage.
   - `lib/storage/index.ts`: 70.5% branch coverage.
   - `lib/env.ts`: 33.3% branch coverage.
3. **Accessibility**:
   - Need keyboard `Escape` dismissal on `OnboardingModal`.

---

## 6. Phase 1E & 1F: Documentation Honesty & Repo Hygiene

1. **Test Count Accuracy**: README and docs claimed 25 Playwright tests; actual count is 36.
2. **Lighthouse Score Accuracy**: README claimed 99 mobile performance; actual live production mobile score is 75 (due to mobile CPU throttling and dynamic SSR). Needs accurate disclosure.
3. **Repo Size**: 3.13 MB tracked (limit: 8.00 MB). Git pack size: 283 KiB. Well within limits.
4. **Missing Docs**: Missing standard open-source documentation: `ARCHITECTURE.md` and `CONTRIBUTING.md`.
5. **Missing Unified Script**: Missing `npm run check` to run all linters, type checks, unit tests, and size gates in one pass.

---

## 7. Prioritized Action Plan

| Priority | Issue / Task | Severity × Effort | Target Resolution |
| :--- | :--- | :--- | :--- |
| **P0** | Fix Zod Client JIT CSP Violation | High × Low | Import and configure `z.config({ jitless: true })` in client entrypoint (`PlanContext.tsx` / `storage/index.ts`) to eliminate browser `securitypolicyviolation` event for `eval`. |
| **P0** | Fix Timeline Date Clamping | High × Low | In `generateTimeline`, guarantee that backward-calculated deadlines are clamped to `≥ today` so deadlines never land in the past. |
| **P1** | Decompose `OnboardingModal.tsx` | High × Med | Split 1,015-line component into isolated sub-components: `StepEventDetails.tsx`, `StepDateLocation.tsx`, `StepBudgetGuests.tsx`, `StepPriorities.tsx`, and `WizardProgress.tsx`. |
| **P1** | Decompose `OverviewView.tsx` | High × Med | Split 851-line component into `OverviewHero.tsx`, `OverviewDeadlinesSection.tsx`, `OverviewHealthSection.tsx`, `OverviewBudgetSnapshot.tsx`, `OverviewVendorSnapshot.tsx`, `OverviewCreativePreview.tsx`. |
| **P1** | Remove 20 Unused Dependencies | Med × Low | Prune unused `@dnd-kit`, `@radix-ui`, `framer-motion`, `recharts`, and `canvas-confetti` from `package.json` to reduce surface area. |
| **P1** | Add `Escape` key to Modals | Med × Low | Support accessible `Escape` dismissal on `OnboardingModal`. |
| **P1** | Add `ARCHITECTURE.md` & `CONTRIBUTING.md` | Med × Low | Add complete, verified architecture documentation and developer contribution guide. |
| **P1** | Add `npm run check` & Wire CI | Med × Low | Create unified `npm run check` script and wire it into GitHub Actions CI workflow. |
| **P2** | Boost Branch Coverage in Storage & Context | Med × Low | Add unit tests covering corrupted localStorage data, quota exceptions, and custom environment variable overrides. |
| **P3** | Align Documentation Truth | Med × Low | Correct test counts (36 E2E tests, 101 unit tests), accurate mobile Lighthouse score (75), and precise dependency listings across all docs. |

### Deliberately Unchanged
- **Visual Design & Layout Styling**: All colors, fonts, margins, animations, and editorial stationery aesthetic are preserved without changes.
- **Deterministic Math Core**: The Largest Remainder Method, integer minor currency calculations, and backward milestone scheduling algorithm remain intact.
- **Live Models & Prompts**: The prompt structure and verified `gemini-3.5-flash-lite` model configuration remain untouched.
- **Git Tags**: Existing `v1.0.0` release tag and release assets are strictly preserved.

