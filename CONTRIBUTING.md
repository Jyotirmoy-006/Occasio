# Contributing to Occasio

Thank you for your interest in contributing to Occasio! This document outlines our development workflows, coding standards, and verification requirements.

---

## 1. Development Prerequisites

- **Node.js**: v20 or higher
- **Package Manager**: `npm` (v10 or higher)
- **Git**: v2.30 or higher

---

## 2. Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Jyotirmoy-006/Occasio.git
   cd Occasio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables (Optional)**:
   ```bash
   cp .env.example .env.local
   ```
   *Note: If `GEMINI_API_KEY` is not provided, Occasio seamlessly falls back to its deterministic built-in demo engine.*

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Verification & Guardrails

Before submitting a Pull Request, all automated quality gates must pass cleanly:

### Unified Verification Check
Run the comprehensive verification command:
```bash
npm run check
```
This executes:
1. `npm run lint` — ESLint source code inspection.
2. `npm run type-check` — TypeScript strict type validation (`tsc --noEmit`).
3. `npm run test` — Vitest unit test suite (111 unit tests).
4. `npm run size-check` — Enforces repository assets stay within strict limits (images < 2.5 MB, tracked repo < 8 MB).

### End-to-End & Smoke Testing
```bash
# Run production build and execute Playwright regression & smoke suite
npm run build
npm run test:smoke

# Run full cross-browser E2E and Axe accessibility suite
npm run test:e2e
```

---

## 4. Coding Standards

- **Zero PII to External APIs**: Never include personal names, emails, addresses, or phone numbers in AI API payloads. All transmitted fields must adhere strictly to `AI_PAYLOAD_EXACT_FIELDS`.
- **Pure Domain Logic**: All mathematical, scheduling, and formatting functions in `src/domain/` must remain pure functions with zero React or browser DOM dependencies.
- **Strict CSP Compliance**: Never introduce `eval()`, `new Function()`, or inline scripts without cryptographic nonces. All Zod modules must maintain `z.config({ jitless: true })`.
- **Atomic Conventional Commits**: Structure commit messages using standard prefixes: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
