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
git clone https://github.com/Jyotirmoy-006/Occasio.git
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

### Running in Demo Mode (No API Key Required)
Occasio is fully functional out-of-the-box without an API key or account:
- If `GEMINI_API_KEY` is omitted or empty, Occasio automatically boots in **Demo Mode**.
- The header status badge displays `Demo mode: no API key` with an explanatory popover.
- All core features—wizard setup, plan generation, individual idea regeneration, copilot natural language adjustments, undo/redo, timeline shifting, and exports—use our built-in deterministic demo engine with human-curated templates.
- Financial arithmetic and schedule deadlines always execute through tested local TypeScript algorithms regardless of AI status.

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
- **Zero-PII Privacy: Exactly What Is Sent to Gemini**:
  - **What IS sent**: Event type (`wedding`, `birthday`, `community`), guest count, total budget number, target date, style/vibe keywords, and dietary requirement flags.
  - **What is NEVER sent**: The event title (`eventName`), planner names, personal guest lists, contact details, notes, or uploaded documents. The application inspect panel lets users verify the exact sanitized JSON payload dispatched to the API.
- **Server-Side API Key Isolation**: The `GEMINI_API_KEY` never reaches client browsers; all inference requests route through authenticated Next.js server route handlers.
- **No Hallucinated Vendors**: Prompts and schemas restrict the AI to vendor *types* and *questions*. Real vendor names, phone numbers, and guaranteed quotes are never synthesized.
- **AI-Generated Imagery Disclosure**: All hero and mood visual assets located in `public/images/` are synthetic, AI-generated imagery (crafted with Imagen 3 / generative pipeline) and curated, compressed WebP assets for thematic resonance without using stock photography.
- **Disclaimer on Legal & Medical Advice**: Permits, licenses, and insurance guides provide general advice only and explicitly instruct users to verify requirements with local authorities.
- **Transparent Labelling**: AI-generated suggestions are clearly badged with honest source provenance: `"Generated by Gemini - <model> - <time>"`, or `"Demo engine"`, or `"Edited by you"`.
- **Cultural Inclusivity**: Prompts forbid assuming default religions, family structures, or gender traditions, ensuring respect for diverse celebration practices.

---

## Measured Performance & Testing Evidence

- **Unit & Domain Tests**: **101 passed across 21 test suites** (100% pass rate).
- **AI Layer Branch Coverage**: **88.23% branch coverage** in `lib/ai/` (exceeding 85% requirement).
- **Playwright E2E Tests**: **25 passed** (covering non-collision shell geometry at 1440/1024/768/360px, Radix tooltips and popovers across all viewports, horizontal overflow at 320–1440px, modal fit at 1366x768 and 360x640px, keyboard-only milestone toggle/undo, material richness smoke, mobile 360x640 flow, 500 fallback, and comprehensive axe scans).
- **Lighthouse Mobile Audit (Production Build on Port 3001)**:
  - **Performance**: **99 / 100** (FCP: 0.8s, LCP: 0.8s, TBT: 120ms, CLS: 0)
  - **Accessibility**: **100 / 100**
  - **Best Practices**: **100 / 100**
  - **SEO**: **100 / 100**
- **Contrast Verification**: **57/57 token pairs and composited textures passed** (`npm run test:contrast`, all ≥ 4.5:1 against respective backgrounds and procedural noise).
- **Automated Accessibility Scan**: **0 serious or critical violations** via `@axe-core/playwright` across 10 complete views and modal dialogs.
- **Tracked Repository Size**: **3.03 MB** (well under the 8 MB guardrail limit).
- **Security Audit**: **0 vulnerabilities** via `npm audit --audit-level=high`.
- **TypeScript**: **0 errors** under `strict: true` (`tsc --noEmit`).
- **Verified Live Models**: Tested and verified live with `@google/genai` using model **`gemini-3.5-flash-lite`** (primary, <3s latency, 100% first-attempt schema pass) and **`gemini-3.5-flash`**. Unverifiable `gemini-3.8-flash` (threw 503) was removed.
- **Privacy Minimization**: Verified via `scripts/verify-gemini-live.mjs`: `eventName` and personal names are strictly excluded from prompt payloads to prevent personal data disclosure to AI endpoints.

---

## Demo Video Pipeline

Occasio includes a fully reproducible, deterministic headless video production pipeline that records a pristine 1080p, 30 fps walkthrough with synchronized AI narration (`en-US-AndrewNeural`), burned-in accessible subtitles, and real live Gemini interactions:

- **Runtime**: **162.04 seconds (2:42.04)** — strictly calibrated within the 2:35 – 2:55 hackathon specification.
- **Visuals**: Constant **30.00 fps** (`30/1`), 1920×1080, encoded in H.264 with `crf 17` and `slow` preset (`yuv420p`) for crisp typography.
- **Audio**: Cleaned voiceover (`en-US-AndrewNeural`, +4% cadence) with dynamic loudness normalization (`-16 LUFS`) and humanized pause trimming (zero dead silences > 0.35s).
- **Subtitles**: Dual-track subtitles (burned-in master + standalone `.srt`) with 50 perfectly synchronized cues derived from Edge TTS acoustic sentence boundaries (≤ 40 chars/line, ≤ 17.0 CPS).
- **16 Curated Scenes**: Covers browser tab collapse cold open (S0), title card (S1), wizard with real-time budget donut (S2), live Gemini generation with privacy disclosure (S3), offline Demo engine popover (S3b), overview milestones & undo toast (S4), proportional budget slider rebalancing (S5), backward timeline scheduling (S6), 4-stage vendor pipeline & quote bridge (S6b), ideas with single-concept regeneration & pinning (S7), copilot parameter diff with confirm/undo (S8), side-by-side scenario compare (S9), multi-format exports (S10), theme cycling & minimal decoration mode (S11), verified quality scorecard (S12), and closing repository card (S13).

```bash
# 1. Start production server (port 3000) and demo proxy server (port 3001)
npm run build && npm start
node demo/demo_proxy_server.mjs

# 2. Synthesize scene voiceovers with edge-tts and natural cadence
npm run demo:voices

# 3. Record headless Playwright walkthrough with smooth cursor physics
npm run demo:record

# 4. Generate subtitles, align audio with zero drift, and encode master MP4
npm run demo:subs
npm run demo:audio
npm run demo:build

# 5. Generate YouTube chapters description and run quality assertions
npm run demo:youtube
npm run demo:verify

# Or run the entire pipeline in one command:
npm run demo:all
```

Artifacts are generated in the gitignored `demo-out/` directory:
- `demo-out/occasio-demo-v2.mp4` (Master with burned-in subtitles, 14.14 MB)
- `demo-out/occasio-demo-v2-nosubs.mp4` (Clean video, 12.06 MB)
- `demo-out/thumbnail-v2.png` (1280×720 video cover)
- `demo-out/subs-v2.srt` (50 cues, standards-compliant SRT)
- `demo-out/youtube-description-v2.txt` (16 timestamped chapter markers)

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
