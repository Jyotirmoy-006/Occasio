/**
 * Occasio Curated Imagery Manifest.
 * Every image is strictly budgeted (< 150 KB, < 2.5 MB total),
 * optimized to WebP, and accompanied by accessible descriptive alt text.
 */

export interface AppImageMetadata {
  key: string;
  src: string;
  category: 'hero' | 'welcome' | 'mood';
  eventType: 'wedding' | 'birthday' | 'community';
  styleId?: string;
  label?: string;
  alt: string;
  isDecorative: boolean;
  width: number;
  height: number;
  aspectRatio: string;
  blurDataUrl: string;
}

export const APP_IMAGES: Record<string, AppImageMetadata> = {
  "hero-wedding": {
    "key": "hero-wedding",
    "src": "/images/hero/wedding.webp",
    "category": "hero",
    "eventType": "wedding",
    "alt": "Curated wedding stationery suite with olive branch, antique brass flatware, and cream linen in natural morning window light",
    "isDecorative": false,
    "width": 800,
    "height": 1000,
    "aspectRatio": "4:5",
    "blurDataUrl": "data:image/webp;base64,UklGRkYAAABXRUJQVlA4IDoAAADQAQCdASoKAAgABUB8JQBOgBwrEXcagAD+lOvnhdb1MYBWl8vqhHQ8nS7iA2q5SJqaKO5GeCC2UAAA"
  },
  "hero-birthday": {
    "key": "hero-birthday",
    "src": "/images/hero/birthday.webp",
    "category": "hero",
    "eventType": "birthday",
    "alt": "Single-tier artisanal celebration cake with glowing beeswax candle, vintage bubbly coupe, and botanical confetti",
    "isDecorative": false,
    "width": 800,
    "height": 1000,
    "aspectRatio": "4:5",
    "blurDataUrl": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADwAQCdASoKAAgABUB8JYgCdAEXfLJSZyAA99709Z9SmHvubyZx2/9Xi3sS7p1x22Y7ptl4zS4CneDydYCwAA=="
  },
  "hero-community": {
    "key": "hero-community",
    "src": "/images/hero/community.webp",
    "category": "hero",
    "eventType": "community",
    "alt": "Woven festival harvest basket with fresh citrus and herbs, handcrafted ceramic mugs, and parchment map on rustic cedar wood",
    "isDecorative": false,
    "width": 800,
    "height": 1000,
    "aspectRatio": "4:5",
    "blurDataUrl": "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADwAQCdASoKAAgABUB8JZACdAD0Fkqr8gAA3aWtp4ccdF/r6fWA/fDdKyUDV7y1fG6BKJnrgq8LmTWGfswMAAAA"
  },
  "welcome-wedding": {
    "key": "welcome-wedding",
    "src": "/images/welcome/wedding.webp",
    "category": "welcome",
    "eventType": "wedding",
    "alt": "Ornate brass invitation easel displaying blank deckle-edge handmade stationery with white ranunculus and silk ribbon",
    "isDecorative": false,
    "width": 800,
    "height": 600,
    "aspectRatio": "4:3",
    "blurDataUrl": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADwAQCdASoKAAgABUB8JYgCdADcqLyejAAAzjiZDaHycNq0u/1Tmlz4K1ZWyUXlLcuvtdYbXz1WBk/R9F3AAA=="
  },
  "welcome-birthday": {
    "key": "welcome-birthday",
    "src": "/images/welcome/birthday.webp",
    "category": "welcome",
    "eventType": "birthday",
    "alt": "Celebration dessert vignette featuring pastel macarons on a marble pedestal with fluted glassware on a brass bar cart",
    "isDecorative": false,
    "width": 800,
    "height": 600,
    "aspectRatio": "4:3",
    "blurDataUrl": "data:image/webp;base64,UklGRkYAAABXRUJQVlA4IDoAAABwAQCdASoKAAgABUB8JZACdAFAAAD+7I3GnewKCWT2lnidFV28H4rV0F1He/GHObZ4LvWiyCydhgAA"
  },
  "welcome-community": {
    "key": "welcome-community",
    "src": "/images/welcome/community.webp",
    "category": "welcome",
    "eventType": "community",
    "alt": "Community gathering table with handmade stoneware pitcher, fresh sunflowers, and wood clipboard with blank craft paper",
    "isDecorative": false,
    "width": 800,
    "height": 600,
    "aspectRatio": "4:3",
    "blurDataUrl": "data:image/webp;base64,UklGRjQAAABXRUJQVlA4ICgAAABwAQCdASoKAAgABUB8JZwAAV+pUADN5dFJPZC2y/18tZUHp7aqEAAA"
  },
  "mood-wedding-classic-botanical": {
    "key": "mood-wedding-classic-botanical",
    "src": "/images/mood/wedding-classic-botanical.webp",
    "category": "mood",
    "eventType": "wedding",
    "styleId": "classic-botanical",
    "label": "Classic Botanical",
    "alt": "Garden white roses with fresh olive sprigs, polished silver cutlery, and neutral French linen",
    "isDecorative": false,
    "width": 800,
    "height": 600,
    "aspectRatio": "4:3",
    "blurDataUrl": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADwAQCdASoKAAgABUB8JYwCsADcXFhjN0AA/sl2i9mjB9WLjT0srfANgwQw+kgPjsgo0Y+mTqAAAA=="
  },
  "mood-wedding-modern-minimalist": {
    "key": "mood-wedding-modern-minimalist",
    "src": "/images/mood/wedding-modern-minimalist.webp",
    "category": "mood",
    "eventType": "wedding",
    "styleId": "modern-minimalist",
    "label": "Modern Minimalist",
    "alt": "Architectural white calla lilies in matte black ceramics on polished travertine stone slabs",
    "isDecorative": false,
    "width": 800,
    "height": 600,
    "aspectRatio": "4:3",
    "blurDataUrl": "data:image/webp;base64,UklGRj4AAABXRUJQVlA4IDIAAADQAQCdASoKAAgABUB8JYwC7AELXkkEAAD+t4wrkKcxgKnzyjPUzdMu5G037JE1LEfcAA=="
  },
  "mood-wedding-warm-terracotta": {
    "key": "mood-wedding-warm-terracotta",
    "src": "/images/mood/wedding-warm-terracotta.webp",
    "category": "mood",
    "eventType": "wedding",
    "styleId": "warm-terracotta",
    "label": "Warm Terracotta",
    "alt": "Unglazed terracotta vessels with dried pampas plumes and warm amber glassware catching golden hour light",
    "isDecorative": false,
    "width": 800,
    "height": 600,
    "aspectRatio": "4:3",
    "blurDataUrl": "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAACwAQCdASoKAAgABUB8JZACdADZkynAAP3CwBLh9joGfwFZQ3xfyJl1kSY9mOc99eZ0L7hVETK6mbIewAA="
  },
  "mood-wedding-candlelit-intimate": {
    "key": "mood-wedding-candlelit-intimate",
    "src": "/images/mood/wedding-candlelit-intimate.webp",
    "category": "mood",
    "eventType": "wedding",
    "styleId": "candlelit-intimate",
    "label": "Candlelit Intimate",
    "alt": "Slender taper candles in vintage brass holders with dark oak table, forest green velvet runner, and crystal glasses",
    "isDecorative": false,
    "width": 800,
    "height": 600,
    "aspectRatio": "4:3",
    "blurDataUrl": "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADQAQCdASoKAAgABUB8JQBOgB6XjmUQ8AD+qOgSk3SqmlxTkq3Pl5FlsvktmvuK9z9LIAAA"
  },
  "mood-birthday-vintage-speakeasy": {
    "key": "mood-birthday-vintage-speakeasy",
    "src": "/images/mood/birthday-vintage-speakeasy.webp",
    "category": "mood",
    "eventType": "birthday",
    "styleId": "vintage-speakeasy",
    "label": "Vintage Speakeasy",
    "alt": "Fluted glass decanter with amber whiskey, cut crystal tumbler, and vintage brass turntable arm on dark walnut",
    "isDecorative": false,
    "width": 800,
    "height": 600,
    "aspectRatio": "4:3",
    "blurDataUrl": "data:image/webp;base64,UklGRiwAAABXRUJQVlA4ICAAAABwAQCdASoKAAgABUB8JZwC7AFAAAD+1QBxiHCPyvAAAA=="
  },
  "mood-birthday-garden-brunch": {
    "key": "mood-birthday-garden-brunch",
    "src": "/images/mood/birthday-garden-brunch.webp",
    "category": "mood",
    "eventType": "birthday",
    "styleId": "garden-brunch",
    "label": "Garden Conservatory Brunch",
    "alt": "Porcelain cake pedestal with sliced citrus and berries, French porcelain teapot, and dappled conservatory sunlight",
    "isDecorative": false,
    "width": 800,
    "height": 600,
    "aspectRatio": "4:3",
    "blurDataUrl": "data:image/webp;base64,UklGRioAAABXRUJQVlA4IB4AAAAwAQCdASoKAAgACoB8JZwAA3AA/urFYpjMTOBAAAA="
  },
  "mood-birthday-astronomy-midnight": {
    "key": "mood-birthday-astronomy-midnight",
    "src": "/images/mood/birthday-astronomy-midnight.webp",
    "category": "mood",
    "eventType": "birthday",
    "styleId": "astronomy-midnight",
    "label": "Astronomy & Midnight",
    "alt": "Brass celestial armillary sphere, indigo stationery with gold constellations, and obsidian dish with gold sequins",
    "isDecorative": false,
    "width": 800,
    "height": 600,
    "aspectRatio": "4:3",
    "blurDataUrl": "data:image/webp;base64,UklGRigAAABXRUJQVlA4IBwAAABQAQCdASoKAAgABUB8JZwABAAAAP7XlNuKAAAA"
  },
  "mood-birthday-retro-disco": {
    "key": "mood-birthday-retro-disco",
    "src": "/images/mood/birthday-retro-disco.webp",
    "category": "mood",
    "eventType": "birthday",
    "styleId": "retro-disco",
    "label": "Retro Warm Disco",
    "alt": "Faceted mirrored sphere reflecting amber glow with effervescent cocktail coupe and acrylic coasters",
    "isDecorative": false,
    "width": 800,
    "height": 600,
    "aspectRatio": "4:3",
    "blurDataUrl": "data:image/webp;base64,UklGRi4AAABXRUJQVlA4ICIAAAAwAQCdASoKAAgABUB8JZQAA3AA/s2il37jZvRsjw+xcgAA"
  },
  "mood-community-open-air-market": {
    "key": "mood-community-open-air-market",
    "src": "/images/mood/community-open-air-market.webp",
    "category": "mood",
    "eventType": "community",
    "styleId": "open-air-market",
    "label": "Open-Air Market",
    "alt": "Wooden slatted produce crate with heirloom tomatoes, artisanal sourdough boule, and fresh thyme on burlap",
    "isDecorative": false,
    "width": 800,
    "height": 600,
    "aspectRatio": "4:3",
    "blurDataUrl": "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACwAQCdASoKAAgABUB8JZQC7AEHEY1IAPIqDcEwVCuuR0Ct8xCSAA=="
  },
  "mood-community-neighborhood-harvest": {
    "key": "mood-community-neighborhood-harvest",
    "src": "/images/mood/community-neighborhood-harvest.webp",
    "category": "mood",
    "eventType": "community",
    "styleId": "neighborhood-harvest",
    "label": "Neighborhood Harvest",
    "alt": "Heirloom squash and pumpkins, dried wheat sheaves tied with twine, and ceramic cider jug on garden bench",
    "isDecorative": false,
    "width": 800,
    "height": 600,
    "aspectRatio": "4:3",
    "blurDataUrl": "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAABQAQCdASoKAAgABUB8JZQABDOAAP60LFIUlVPEYe6q7pKR+AAAAA=="
  },
  "mood-community-street-art-fair": {
    "key": "mood-community-street-art-fair",
    "src": "/images/mood/community-street-art-fair.webp",
    "category": "mood",
    "eventType": "community",
    "styleId": "street-art-fair",
    "label": "Street Art & Makers Fair",
    "alt": "Wood artist palette with oil pigment dollops, glass pigment jars, and natural bristle brushes on birch desk",
    "isDecorative": false,
    "width": 800,
    "height": 600,
    "aspectRatio": "4:3",
    "blurDataUrl": "data:image/webp;base64,UklGRiwAAABXRUJQVlA4ICAAAACQAQCdASoKAAgABUB8JZQAAudZuFQAyzOIKWD39q2wAA=="
  },
  "mood-community-lantern-festival": {
    "key": "mood-community-lantern-festival",
    "src": "/images/mood/community-lantern-festival.webp",
    "category": "mood",
    "eventType": "community",
    "styleId": "lantern-festival",
    "label": "Lantern Festival & Night Gathering",
    "alt": "Warm glowing paper lanterns on woven bamboo mat with stoneware tea bowls on cedar table at twilight",
    "isDecorative": false,
    "width": 800,
    "height": 600,
    "aspectRatio": "4:3",
    "blurDataUrl": "data:image/webp;base64,UklGRjYAAABXRUJQVlA4ICoAAACwAQCdASoKAAgABUB8JYwC7ACAmRQAAPuVfO6/5CPrP2/rq9reGXkAAAA="
  }
};

export function getHeroImage(eventType: 'wedding' | 'birthday' | 'community'): AppImageMetadata {
  return APP_IMAGES[`hero-${eventType}`] || APP_IMAGES['hero-wedding'];
}

export function getWelcomeImage(eventType: 'wedding' | 'birthday' | 'community'): AppImageMetadata {
  return APP_IMAGES[`welcome-${eventType}`] || APP_IMAGES['welcome-wedding'];
}

export function getMoodImages(eventType: 'wedding' | 'birthday' | 'community'): AppImageMetadata[] {
  return Object.values(APP_IMAGES).filter(
    (img) => img.category === 'mood' && img.eventType === eventType
  );
}
