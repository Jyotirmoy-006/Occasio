# Occasio — GenAI-Powered Event Planning Assistant
*Editorial Event Logistics for Weddings, Birthdays & Community Gatherings*

![Occasio Event Planning Assistant](docs/banner.webp)

> **Pitch**: Occasio is a tactile, editorial event planning assistant that marries deterministic financial math and backward-planned schedules with Gemini-powered creative synthesis. Designed for real-world weddings, birthdays, and community gatherings, Occasio empowers planners with integer-precision budget rebalancing sliders, milestone Gantt roadmaps with iCalendar export, inquiry checklists across four vendor stages, and curated styling concepts—all operating under a local-first, zero-PII privacy architecture that works seamlessly both with live AI and in deterministic Demo Mode.

---

## Architecture Diagram

```mermaid
flowchart TD
  User["Browser Client (Next.js 16 App Router)"]
  LocalStorage["localStorage Engine\n(Schema-Versioned & Migrations)"]
  ExportEngine["Export Layer\n(RFC 4180 CSV, RFC 5545 ICS, JSON)"]
  ServerRoutes["Server Route Handlers\n/api/generate & /api/copilot & /api/health"]
  GeminiSDK["Google Gemini API (@google/genai)\n(gemini-3.5-flash / gemini-3.5-flash-lite / gemini-3.8-flash)"]
  DemoEngine["Deterministic Demo Engine\n(Curated Templates & Fallback)"]

  User <--> LocalStorage
  User --> ExportEngine
  User -->|"POST JSON (Delimited & Sanitized, No PII/EventName)"| ServerRoutes
  ServerRoutes -->|"Server-Side Only Auth"| GeminiSDK
  GeminiSDK -->|"Response Validation (Zod)"| ServerRoutes
  ServerRoutes -.->|"On 503 / Timeout / No Key"| DemoEngine
  DemoEngine --> ServerRoutes
  ServerRoutes -->|"Schema-Valid Plan"| User
```

---

## 4 Core Problem Statement Pillars

Every feature in Occasio traces directly to the four core pillars of the problem statement:

### 1. Budgets & Allocation
- **Proportional Rebalancing Sliders**: Adjusting any category dynamically scales unlocked categories so the total always strictly equals the overall budget.
- **Integer Minor Units**: All monetary arithmetic operates in integer minor currency units (cents/paise) to permanently eliminate floating-point drift. Leftovers are distributed via the Largest Remainder Method.
- **Interactive Accessible Donut**: Custom SVG chart with category hover tooltips, keyboard focus, and a one-click toggle to an accessible HTML `<table>`.
- **Actual vs. Estimated Tracker**: Real-time variance tracking with visual and textual over-budget warnings (never color alone).

### 2. Backward-Planned Timelines
- **Milestone Roadmap**: Automatically calculated backward from the target event date (e.g. 52 weeks prior for wedding venues, 4 weeks prior for cakes).
- **Dual Visual Modes**: Switch between a compact card list view and a horizontal Gantt chart.
- **Accessible Rescheduling**: Keyboard and button steppers allow shifting dates in 1-week intervals without requiring complex mouse-drag gestures.
- **Countdown & ICS Export**: Live days-remaining ticker and standards-compliant `.ics` iCalendar download compatible with Apple, Google, and Outlook calendars.

### 3. Vendor Checklists & Pipeline
- **Categorized Vendor Types**: Covers venues, caterers, photographers, entertainment, decor, and municipal permits.
- **Actionable Question Templates**: Pre-curated negotiation questions tailored to each vendor category.
- **4-Stage Pipeline**: Track vendors through `To contact`, `Contacted`, `Quoted`, and `Booked`.
- **Quote-to-Budget Bridge**: Entering a vendor quote automatically updates the actual spend for that category in your budget tracker.
- **Responsible AI Guarantee**: Never hallucinates fake vendor businesses, phone numbers, ratings, or prices presented as fact.

### 4. Personalized Creative Ideas
- **Contrast-Tested Color Swatches**: Real color palettes with text overlays mathematically verified for WCAG AA contrast (≥ 4.5:1 ratio).
- **Culinary Concepts**: Menu ideas with prominent allergen awareness and dietary accommodation guidance.
- **Day-of Schedule**: Hour-by-hour run of show from morning preparation through evening departure.
- **Interactive Controls**: Every theme, palette, menu, and activity idea can be individually pinned, regenerated, or dismissed.

---

## Additional Features

- **Planning Copilot**: A conversational assistant that modifies plan state through typed tool calls (e.g., *"Cut the budget by 10%"*). Presents a clear visual diff of proposed changes and strictly requires user confirmation before applying. Includes full **Undo/Redo** history.
- **Scenario Compare**: Duplicate your baseline plan to test alternative budgets or guest counts side-by-side with automatic per-guest cost variance calculations.
- **Comprehensive Export & Backup**: Print-friendly PDF view, RFC 4180 CSV exports for budget and checklist, `.ics` calendar export, and safe JSON backup/restore with file size caps (max 512 KB).
- **Local-First Privacy**: Zero accounts, zero cookies, zero server-side storage of user data.

---

## Quick Setup (Under 5 Steps)

### Step 1: Clone the repository
```bash
git clone https://github.com/your-username/occasio.git
cd occasio
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: (Optional) Set your Gemini API key
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your API key from [Google AI Studio](https://aistudio.google.com/):
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note**: If no API key is provided, Occasio automatically boots in **Demo Mode**, utilizing human-curated deterministic templates badged clearly in the header.

### Step 4: Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Produce optimized production build |
| `npm run start` | Start production server with dynamic nonce CSP |
| `npm run test` | Run all 101 Vitest unit, domain, and core logic tests |
| `npm run test:coverage` | Run test suite with V8 coverage enforcement (>85% AI layer branch coverage) |
| `npm run test:contrast` | Mathematically verify WCAG 2.2 AA (≥ 4.5:1) across 57 token & composited pairs |
| `npm run test:e2e` | Run all 34 Playwright E2E tests (pixel-truth contrast, geometry, tooltips, modals, axe-core) |
| `npm run type-check` | Run strict TypeScript compiler verification (`tsc --noEmit`) |
| `npm run size-check` | Assert tracked repo < 8 MB and images < 2.5 MB (each < 150 KB) |
| `npm audit` | Verify dependencies are free of high-severity vulnerabilities |

---

## Responsible AI & Safety Architecture

- **Prompt Injection Defense**: All user text inputs are stripped of control characters and jailbreak tokens (`ignore previous instructions`, `roleplay as`, script tags) and wrapped in XML delimiters before prompt construction (`src/lib/ai/sanitize.ts`).
- **No Hallucinated Vendors**: Prompts and schemas restrict the AI to vendor *types* and *questions*. Real vendor names, phone numbers, and guaranteed quotes are never synthesized.
- **Disclaimer on Legal & Medical Advice**: Permits, licenses, and insurance guides provide general advice only and explicitly instruct users to verify requirements with local authorities.
- **Transparent Labelling**: AI-generated suggestions are clearly badged with honest source provenance: `"Generated by Gemini - <model> - <time>"`, or `"Demo engine"`, or `"Edited by you"`.
- **Cultural Inclusivity**: Prompts forbid assuming default religions, family structures, or gender traditions, ensuring respect for diverse celebration practices.

---

## Measured Performance & Testing Evidence

- **Unit & Domain Tests**: **100 passed across 21 test suites** (100% pass rate).
- **AI Layer Branch Coverage**: **88.23% branch coverage** in `lib/ai/` (exceeding 85% requirement).
- **Playwright E2E Tests**: **25 passed** (covering non-collision shell geometry at 1440/1024/768/360px, Radix tooltips and popovers across all viewports, horizontal overflow at 320–1440px, modal fit at 1366x768 and 360x640px, keyboard-only milestone toggle/undo, material richness smoke, mobile 360x640 flow, 500 fallback, and comprehensive axe scans).
- **Lighthouse Mobile Audit (Production Build on Port 3001)**:
  - **Performance**: **99 / 100** (FCP: 0.8s, LCP: 0.8s, TBT: 120ms, CLS: 0)
  - **Accessibility**: **100 / 100**
  - **Best Practices**: **100 / 100**
  - **SEO**: **100 / 100**
- **Contrast Verification**: **57/57 token pairs and composited textures passed** (`npm run test:contrast`, all ≥ 4.5:1 against respective backgrounds and procedural noise).
- **Automated Accessibility Scan**: **0 serious or critical violations** via `@axe-core/playwright` across 10 complete views and modal dialogs.
- **Tracked Repository Size**: **0.79 MB** (825,758 bytes, ~9.9% of the 8 MB hard limit).
- **Security Audit**: **0 vulnerabilities** via `npm audit --audit-level=high`.
- **TypeScript**: **0 errors** under `strict: true` (`tsc --noEmit`).
- **Verified Live Models**: Tested and verified live with `@google/genai` using model **`gemini-3.5-flash-lite`** (primary, <3s latency, 100% first-attempt schema pass) and **`gemini-3.5-flash`**. Unverifiable `gemini-3.8-flash` (threw 503) was removed.
- **Privacy Minimization**: Verified via `scripts/verify-gemini-live.mjs`: `eventName` and personal names are strictly excluded from prompt payloads to prevent personal data disclosure to AI endpoints.

---

## Limitations & Roadmap

### Current Limitations
- **Local Persistence**: Plans reside in browser `localStorage`. Transferring plans between different devices requires using the JSON export/import feature.
- **Rate Limiting**: Server rate limiting uses an in-memory LRU cache per instance; production scaling across multiple serverless regions would benefit from Redis/Upstash.
- **Environment Changes**: Adding or updating `GEMINI_API_KEY` in `.env.local` requires restarting the Next.js dev server for server environment variables to be picked up.

### Roadmap
- [ ] Collaborative real-time planning via WebRTC or party CRDTs.
- [ ] Integration with municipal permit databases for automated local regulatory checklists.
- [ ] Multi-lingual localized prompt templates (Spanish, French, Japanese, Hindi).

---

## License
MIT License. See [LICENSE](LICENSE) for details.
