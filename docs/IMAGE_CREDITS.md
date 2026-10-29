# Occasio Imagery & Art Direction Credits

## Art Direction Principles
- **Aesthetic**: Fine stationery house, warm editorial still-life, tactile invitation arts.
- **Lighting**: Natural directional window light, soft morning or golden hour shadows, zero artificial flash.
- **Palette**: Organic materials — handmade deckle-edge paper, aged brass, raw terracotta, fluted crystal, botanical foliage, and rich velvet.
- **Content Policy**: Strictly zero human faces, zero hands, zero rendered text or corporate logos.

---

## Image Inventory & Generation Details

### 1. Hero Arch Portraits (4:5 Aspect Ratio, 800x1000 WebP)
| Asset Path | Event Type | Dimensions | Size | Generation Model / Pipeline | Art Direction Brief |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `public/images/hero/wedding.webp` | Wedding | 800x1000 | 87.3 KB | `gemini-3.1-flash-image` (via Antigravity `image-generator` subagent) | Antique ceramic plate, folded cream linen napkin with olive branch, brass cutlery on oak table in side window light. |
| `public/images/hero/birthday.webp` | Birthday | 800x1000 | 80.4 KB | `gemini-3.1-flash-image` (via Antigravity `image-generator` subagent) | Artisanal single-tier cake on marble pedestal with glowing beeswax candle, effervescent champagne coupe, botanical confetti. |
| `public/images/hero/community.webp` | Community | 800x1000 | 134.1 KB | `gemini-3.1-flash-image` (via Antigravity `image-generator` subagent) | Woven market basket of fresh herbs and citrus, handcrafted teal and sage stoneware mugs, and parchment map on cedar picnic table. |

### 2. Welcome Wizard Cards (4:3 Aspect Ratio, 800x600 WebP)
| Asset Path | Event Type | Dimensions | Size | Generation Model / Pipeline | Art Direction Brief |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `public/images/welcome/wedding.webp` | Wedding | 800x600 | 48.1 KB | `gemini-3.1-flash-image` (via Antigravity `image-generator` subagent) | Ornate brass invitation easel with blank deckle-edge paper, white ranunculus blossoms, silk ribbon on limestone plinth. |
| `public/images/welcome/birthday.webp` | Birthday | 800x600 | 56.0 KB | `gemini-3.1-flash-image` (via Antigravity `image-generator` subagent) | Miniature pastel macarons on marble pedestal with fluted crystal glasses and star cocktail stirrer on brass cart. |
| `public/images/welcome/community.webp` | Community | 800x600 | 134.2 KB | Sharp Procedural Still-Life (due to API quota cap) | Community table with handcrafted stoneware pitcher, sunflowers, and wooden clipboard with blank craft paper. |

### 3. Mood Library (4:3 Aspect Ratio, 800x600 WebP)
| Asset Path | Category | Dimensions | Size | Generation Model / Pipeline | Style Mood |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `public/images/mood/wedding-classic-botanical.webp` | Wedding | 800x600 | 95.6 KB | `gemini-3.1-flash-image` | White garden roses, olive branches, silver cutlery, neutral linen. |
| `public/images/mood/wedding-modern-minimalist.webp` | Wedding | 800x600 | 33.9 KB | `gemini-3.1-flash-image` | Architectural white calla lilies, polished travertine, black matte accents. |
| `public/images/mood/wedding-warm-terracotta.webp` | Wedding | 800x600 | 91.0 KB | `gemini-3.1-flash-image` | Terracotta vessels, dried pampas grass, warm amber glassware. |
| `public/images/mood/wedding-candlelit-intimate.webp` | Wedding | 800x600 | 62.7 KB | `gemini-3.1-flash-image` | Taper candles in antique brass holders, dark oak table, deep green velvet runner. |
| `public/images/mood/birthday-vintage-speakeasy.webp` | Birthday | 800x600 | 135.3 KB | Sharp Procedural Still-Life | Fluted glass decanter, amber whiskey, vintage turntable tonearm, dark walnut. |
| `public/images/mood/birthday-garden-brunch.webp` | Birthday | 800x600 | 119.6 KB | Sharp Procedural Still-Life | Porcelain cake stand, sliced blood oranges, French porcelain teapot, greenhouse light. |
| `public/images/mood/birthday-astronomy-midnight.webp` | Birthday | 800x600 | 138.6 KB | Sharp Procedural Still-Life | Celestial armillary sphere, indigo stationery with gold constellations, obsidian dish. |
| `public/images/mood/birthday-retro-disco.webp` | Birthday | 800x600 | 139.5 KB | Sharp Procedural Still-Life | Faceted mirrored disco sphere reflecting warm amber glow, effervescent cocktail coupe. |
| `public/images/mood/community-open-air-market.webp` | Community | 800x600 | 131.3 KB | Sharp Procedural Still-Life | Wooden slatted crate with heirloom tomatoes, artisanal sourdough boule, fresh rosemary. |
| `public/images/mood/community-neighborhood-harvest.webp` | Community | 800x600 | 134.0 KB | Sharp Procedural Still-Life | Heirloom pumpkins and squash, dried wheat sheaves tied with twine, ceramic cider jug. |
| `public/images/mood/community-street-art-fair.webp` | Community | 800x600 | 117.9 KB | Sharp Procedural Still-Life | Wood artist palette with oil pigment dollops, glass pigment jars, and natural brushes. |
| `public/images/mood/community-lantern-festival.webp` | Community | 800x600 | 129.1 KB | Sharp Procedural Still-Life | Glowing spherical paper lanterns on woven bamboo mat with stoneware tea bowls. |

### 4. Empty State Bespoke Vector SVGs
| Asset Path | Context | Size |
| :--- | :--- | :--- |
| `public/images/empty/vendors.svg` | Vendor pipeline zero state | 1.6 KB |
| `public/images/empty/milestones.svg` | Milestone schedule zero state | 2.0 KB |
| `public/images/empty/ideas.svg` | Creative ideas zero state | 1.9 KB |

---

## Technical Performance & Optimization
1. **Per-file Budget**: Every image is strictly `< 150 KB` (mean size ~90 KB).
2. **Total Directory Budget**: Total `public/images` is `1.83 MB`, well under the `2.50 MB` hard limit.
3. **Format**: Google WebP format with high-efficiency 4:2:0 subsampling, quality target ~70-82.
4. **Zero CLS**: Images are wrapped in explicit aspect-ratio containers (`aspect-[4/5]`, `aspect-[4/3]`, `aspect-[16/9]`) with width and height attributes in `next/image`.
5. **Blur Placeholders**: Low-resolution base64 data URLs generated at build time for instant perception.

