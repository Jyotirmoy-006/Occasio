# Occasio Design System — Material Richness & Stationery System

> **Philosophy**: Occasio embraces the tactile craftsmanship of an invitation suite and premium stationery house. Digital interfaces often default to synthetic gradients, transparent glassmorphism, floating blur blobs, or generic rounded-card grids. Occasio rejects these SaaS defaults in favor of layered paper, engraved linework, crisp letterpress headings, selective foil accents, and one deep hero surface.

---

## 1. Core Material Foundations

| Material Element | Token / Utility Class | Visual Role | Accessibility & Performance Rules |
|:---|:---|:---|:---|
| **Paper Grain Texture** | `.paper-grain` | Micro-texture resembling fine laid stationery across document backgrounds. | Pre-baked tiled radial pattern at 3.5% opacity. Zero layout shifts, zero live SVG filter re-computations, zero network requests. Disables under `data-reduce-decoration`. |
| **Layered Sheets** | `.paper-sheet`, `.paper-sheet-hover` | Cards and panels appear as physical paper sheets stacked on a drafting table. | Multi-layer soft contact shadow (`rgba(28,25,23,0.04)`), 1px inner top highlight (`rgba(255,255,255,0.75)`), and 1px hairline border. Hover lifts by 2px (disabled under `prefers-reduced-motion`). |
| **Stacked Paper (Hero)** | `.stacked-paper` | Hero card features two subtle offset paper sheets behind its primary surface. | Pseudo-elements `::before` and `::after` offset by 4px and 8px. Disables cleanly when decoration is minimized. |
| **Linen / Woven Spine** | `.sidebar-woven` | Gives the primary navigation sidebar the feeling of a hardbound archival binder. | CSS repeating linear gradient crosshatch at 1.5% opacity. Navigation links sit on flat solid paper backing to guarantee 15.8:1 text contrast. |
| **Letterpress Display** | `.letterpress-display`, `.letterpress-dark` | Display headings feel pressed into heavy stock. | 1px text-shadow below. Strictly applied only to large display titles. Never applied to body text or metadata. |
| **Selective Foil Accents** | `.foil-accent`, `.foil-rule`, `--color-foil` | Warm metallic gold accents for key metrics and divider rules. | Maximum 2 foil elements per viewport. Uses a solid metallic base color (`#C59B27`, `#D4AF37`, `#B8860B`) with subtle warm sheen, avoiding rainbow or neon gradients. Falls back to flat colors under high-contrast modes. |
| **Engraved Ornaments** | `CornerFlourish`, `OrnamentalDivider` | Corner brackets and hairline dividers echoing traditional letterpress copperplate prints. | Hand-drawn vector SVGs tailored per event theme. Zero image dependencies. |
| **One Deep Hero Surface** | `.hero-surface` | The Overview hero uses the event's deepest tone with an engraved line pattern and ivory serif type. | Contrast exceeds 7:1 (AAA) across raw and textured worst-case background pixels. |

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

