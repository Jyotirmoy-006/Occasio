# Occasio — GenAI-Powered Event Planning Assistant
*Editorial Event Logistics for Weddings, Birthdays & Community Gatherings*

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
| `npm run build` | Produce optimized Turbopack production build |
| `npm run start` | Start production server |
| `npm run test` | Run all 83 Vitest unit and component tests |
| `npm run test:coverage` | Run test suite with V8 coverage enforcement |
| `npm run test:contrast` | Mathematically verify WCAG 2.2 AA (≥ 4.5:1) across 48 token pairs |
| `npm run test:e2e` | Run 14 Playwright E2E tests (geometry, modal fit, keyboard, axe-core) |
| `npm run type-check` | Run strict TypeScript compiler verification (`tsc --noEmit`) |
| `npm run size-check` | Fail if tracked repository files exceed 8 MB |
| `npm audit` | Verify dependencies are free of high-severity vulnerabilities |

---

## Responsible AI & Safety Architecture

- **Prompt Injection Defense**: All user text inputs are stripped of control characters and jailbreak tokens (`ignore previous instructions`, `roleplay as`, script tags) and wrapped in XML delimiters before prompt construction (`src/lib/ai/sanitize.ts`).
- **No Hallucinated Vendors**: Prompts and schemas restrict the AI to vendor *types* and *questions*. Real vendor names, phone numbers, and guaranteed quotes are never synthesized.
- **Disclaimer on Legal & Medical Advice**: Permits, licenses, and insurance guides provide general advice only and explicitly instruct users to verify requirements with local authorities.
- **Transparent Labelling**: AI-generated suggestions are clearly badged with a visual icon and label; demo engine fallbacks are transparently disclosed.
- **Cultural Inclusivity**: Prompts forbid assuming default religions, family structures, or gender traditions, ensuring respect for diverse celebration practices.

---

## Measured Performance & Testing Evidence

- **Unit & Component Tests**: **83 passed across 17 test suites** (100% pass rate).
- **Playwright E2E Tests**: **14 passed** (covering non-collision shell geometry at 1440/1024/768/360px, horizontal overflow at 320–1440px, modal fit at 1366x768 and 360x640px, keyboard-only milestone toggle/undo, and automated axe-core scans).
- **Code Coverage**: **91.96% lines overall**, **98.23% budget logic**, **100% timeline logic**, **100% checklist logic**, **100% schema models**, **94.4% functions**.
- **Lighthouse Mobile Audit (Emulated Mobile)**:
  - **Performance**: **92** (FCP: 0.8s, LCP: 0.8s, Cumulative Layout Shift: 0, Speed Index: 1.0s)
  - **Accessibility**: **100**
  - **Best Practices**: **100**
  - **SEO**: **100**
- **Contrast Verification**: **48/48 token pairs passed** (`npm run test:contrast`, all ≥ 4.5:1 against respective backgrounds).
- **Automated Accessibility Scan**: **0 serious or critical violations** via `@axe-core/playwright` on both Overview dashboard and Onboarding Wizard dialogs.
- **Tracked Repository Size**: **0.74 MB** (774,305 bytes, 9.2% of the 8 MB hard limit).
- **Security Audit**: **0 vulnerabilities** via `npm audit --audit-level=high`.
- **TypeScript**: **0 errors** under `strict: true` (`tsc --noEmit`).
- **Verified Live Models**: Tested and verified live with `@google/genai` using model **`gemini-3.5-flash`** (with fallback to `gemini-3.5-flash-lite` and `gemini-3.8-flash`). Deprecated `gemini-2.5-flash` / `gemini-2.0-flash` were replaced.
- **Privacy Minimization**: Single source of truth payload audit (`AI_PAYLOAD_EXACT_FIELDS`). `eventName` is strictly excluded from prompt payloads to prevent personal data disclosure to AI endpoints.

---

## Limitations & Roadmap

### Current Limitations
- **Local Persistence**: Plans reside in browser `localStorage`. Transferring plans between different devices requires using the JSON export/import feature.
- **Rate Limiting**: Server rate limiting uses an in-memory LRU cache per instance; production scaling across multiple serverless regions would benefit from Redis/Upstash.

### Roadmap
- [ ] Collaborative real-time planning via WebRTC or party CRDTs.
- [ ] Integration with municipal permit databases for automated local regulatory checklists.
- [ ] Multi-lingual localized prompt templates (Spanish, French, Japanese, Hindi).

---

## License
MIT License. See [LICENSE](LICENSE) for details.
