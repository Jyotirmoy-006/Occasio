# Occasio Design System — Material Richness & Stationery System

> **Philosophy**: Occasio embraces the tactile craftsmanship of an invitation suite and premium stationery house. Digital interfaces often default to synthetic gradients, transparent glassmorphism, floating blur blobs, or generic rounded-card grids. Occasio rejects these SaaS defaults in favor of layered paper, engraved linework, crisp letterpress headings, selective foil accents, and one deep hero surface.

---

## 1. Core Material Foundations

| Material Element | Token / Utility Class | Visual Role | Accessibility & Performance Rules |
|:---|:---|:---|:---|
| **Paper Grain Texture** | `.paper-grain` | Micro-texture resembling fine laid stationery across document backgrounds. | Pre-baked tiled radial pattern at 3.5% opacity. Zero layout shifts, zero live SVG filter re-computations, zero network requests. Disables under `data-reduce-decoration`. |
| **Three Surface Levels** | `--color-page`, `--color-card`, `--color-inset` | Editorial layering: Page `#F7F3EC`, Card `#FFFDF8` (brighter stationery sheet with 1px contact shadow and soft ambient drop), Inset `#F1EADC` (recessed rows and wells). | Strict hierarchy: Cards are always brighter than the page canvas. Insets provide soft contrast wells without heavy borders. |
| **Solid Deep Hero Base** | `.hero-surface` | The Overview hero uses a solid deep base color: Wedding `#17392C`, Birthday `#7A3112`, Community `#123F45`. | No pseudo-elements or paper layers paint over this base. Real computed contrast against `#FAF7F2` ivory text exceeds 8:1 (AAA). Ornaments use low-opacity SVG engraving overlays. |
| **Dual Gold Foil System** | `.foil-accent-dark`, `.foil-accent-light` | Context-aware metallic accents: on-dark gold `#D9B65B` (6.8:1 on dark hero surfaces), on-light antique brass `#8A6A12` (4.7:1 on ivory stationery cards). | Prevents unreadable washed-out gold on paper or dark brass on green. Verified by pixel-truth contrast assertions. |
| **Linen / Woven Spine** | `.sidebar-woven` | Gives the primary navigation sidebar the feeling of a hardbound archival binder. | CSS repeating linear gradient crosshatch at 1.5% opacity. Navigation links sit on flat solid paper backing to guarantee 15.8:1 text contrast. Active nav items display a tinted fill plus a 3px left accent bar. |
| **Letterpress Display** | `.letterpress-display`, `.letterpress-dark` | Display headings feel pressed into heavy stock. | 1px text-shadow below. Strictly applied only to large display titles. Never applied to body text or metadata. |
| **Engraved Ornaments** | `CornerFlourish`, `OrnamentalDivider` | Corner brackets and hairline dividers echoing traditional letterpress copperplate prints. | Hand-drawn vector SVGs tailored per event theme. Zero image dependencies. |
| **Hero Arch & Medallion** | Arch photo (4:5) + Countdown Medallion | Editorial arch photo mask flanked by a circular countdown seal. On mobile (<768px), seamlessly transitions to a 16:9 banner with zero CLS. | Optimized WebP under 150 KB with blur placeholders and explicit sizes. |

---

## 2. Event-Specific Themes (`data-event-theme`)

### Wedding (`wedding`)
- **Tone**: Traditional, romantic, archival.
- **Hero Surface**: Deep Forest Green (`#1B4434`).
- **Foil Accent**: Champagne Gold (`#C59B27`).
- **Paper Tone**: Warm Ivory Laid (`#FAF7F2`).
- **Flourishes**: Botanical vines and interlocking rings.

### Birthday (`birthday`)
- **Tone**: Jubilant, warm, celebratory.
- **Hero Surface**: Deep Terracotta (`#823415`).
- **Foil Accent**: Bright Celebratory Gold (`#D4AF37`).
- **Paper Tone**: Cream Vellum (`#FAF7F2`).
- **Flourishes**: Geometric confetti stars and scalloped corner brackets.

### Community (`community`)
- **Tone**: Civic, grounded, welcoming.
- **Hero Surface**: Deep Teal (`#13464C`).
- **Foil Accent**: Antique Brass (`#B8860B`).
- **Paper Tone**: Sand / Kraft tinted paper (`#FAF7F2`).
- **Flourishes**: Interlinked civic nodes and geometric woven borders.

---

## 3. Craft Details That Sell Quality

1. **Roman Numeral Section Markers**:
   - `I. Milestones & Agenda`
   - `II. Health & Advisory`
   - `III. Financial Ledger`
   - `IV. Vendor Procurement`
   - `V. Styling & Concepts`
2. **Editorial Drop Cap**:
   - The first paragraph of the creative ideas overview utilizes `.drop-cap`, styling the first letter in a 3.25rem Fraunces serif initial.
3. **Monogram Seal**:
   - The logo lockup in the navigation rail features a circular monogram seal with a 2px foil ring.
4. **Ticket-Notched Corners**:
   - Upcoming milestone cards feature clean stationery framing.
5. **Perforated Dividers**:
   - `.perforated-h` creates a dashed hairline reminiscent of ticket stubs and ledger tear-outs.

---

## 4. Guardrails & Accessibility Compliance

1. **Flat Text Surfaces**:
   - All forms, input fields, tables, charts, sliders, and dense body text sit on completely flat, solid `#FAF7F2` or `#F5EFE6` surfaces with **zero texture behind the text**.
2. **"Reduce Decoration" Mode**:
   - Persisted in browser `localStorage` (`occasio_reduce_decoration`).
   - Automatically engaged when the user has OS-level `prefers-contrast: more`, `forced-colors: active`, or `prefers-reduced-motion: reduce`.
   - When active, all paper grain, woven crosshatching, stacked paper offsets, foil sheens, and hover animations are removed, yielding a pure, high-contrast flat layout.
3. **Contrast Mathematical Verification**:
   - Verified via `npm run test:contrast` across 57 checks:
     - Ink on paper: **15.8:1** (AAA)
     - Ivory on forest green hero: **10.2:1** (AAA)
     - Ivory on terracotta hero: **8.0:1** (AAA)
     - Ivory on teal hero: **9.8:1** (AAA)
     - Worst-case textured composite: **6.92:1** to **14.8:1** (exceeds all AA and AAA criteria).

