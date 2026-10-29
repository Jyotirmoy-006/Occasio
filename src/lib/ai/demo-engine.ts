/**
 * Demo engine — deterministic, high-quality fallback when Gemini API is unavailable.
 * Activated when GEMINI_API_KEY is absent OR when any AI call fails.
 *
 * Returns the same schema-valid output as the AI layer, clearly labeled as demo content.
 * All responses are authored by human; no model involved.
 *
 * Richness guarantees:
 * - >= 3 theme directions (with style tags)
 * - 3 palettes (5 colors each, WCAG contrast verified)
 * - Full menu (starter, main, dessert, drinks)
 * - 3 decor ideas
 * - 3 activities
 * - Day schedule
 * - Vendor questions
 */

import type { Ideas } from '@/domain/schemas/ideas';
import type { EventType } from '@/lib/constants';

type DemoIdeas = Ideas;

const DEMO_IDEAS: Record<EventType, DemoIdeas> = {
  wedding: {
    themes: [
      {
        id: 'w-theme-1',
        content: 'Garden Romanticism — natural greenery, candlelight, and botanical arrangements with a relaxed, intimate atmosphere.',
        styleTags: ['Botanical', 'Intimate', 'Warm Organic'],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'w-theme-2',
        content: 'Timeless Elegance — refined simplicity with classic linens, curated florals, and a warm monochromatic palette.',
        styleTags: ['Minimalist', 'Monochrome', 'Refined'],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'w-theme-3',
        content: 'Cultural Fusion — weave together meaningful traditions from both families with intentional, respectful storytelling.',
        styleTags: ['Heritage', 'Celebratory', 'Storytelling'],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
    ],
    colorPalettes: [
      {
        id: 'w-palette-1',
        name: 'Sage & Forest Harvest',
        swatches: [
          { hex: '#8FAF8F', name: 'Sage Green', textColor: '#1C1917' },
          { hex: '#F7F3EC', name: 'Warm Ivory', textColor: '#1C1917' },
          { hex: '#D9B65B', name: 'Gilded Leaf', textColor: '#1C1917' },
          { hex: '#17392C', name: 'Deep Forest', textColor: '#FAF7F2' },
          { hex: '#1C1917', name: 'Antique Ink', textColor: '#FAF7F2' },
        ],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'w-palette-2',
        name: 'Warm Terracotta & Sand',
        swatches: [
          { hex: '#8B4513', name: 'Terracotta', textColor: '#FAF7F2' },
          { hex: '#FAF7F2', name: 'Linen Cream', textColor: '#1C1917' },
          { hex: '#D4A57A', name: 'Desert Rose', textColor: '#1C1917' },
          { hex: '#5C3317', name: 'Burnt Ochre', textColor: '#FAF7F2' },
          { hex: '#8A6A12', name: 'Antique Brass', textColor: '#FAF7F2' },
        ],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'w-palette-3',
        name: 'Candlelit Travertine',
        swatches: [
          { hex: '#EAE3D5', name: 'Raw Travertine', textColor: '#1C1917' },
          { hex: '#3E342B', name: 'Charred Timber', textColor: '#FAF7F2' },
          { hex: '#D9B65B', name: 'Warm Foil', textColor: '#1C1917' },
          { hex: '#2F4F4F', name: 'Slate Teal', textColor: '#FAF7F2' },
          { hex: '#FFFDF8', name: 'Fine Vellum', textColor: '#1C1917' },
        ],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
    ],
    menuIdeas: [
      {
        id: 'w-menu-1',
        content: 'Starter: Heirloom burrata with roasted mission figs, microgreens, and reduced balsamic glaze.',
        course: 'starter',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'w-menu-2',
        content: 'Main: Pan-seared sea bass over lemon-herb risotto (paired with wild mushroom tart option for vegetarians).',
        course: 'main',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'w-menu-3',
        content: 'Dessert: Olive oil rosemary cake with whipped mascarpone and macerated blackberries.',
        course: 'dessert',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'w-menu-4',
        content: 'Drinks: Botanical elderflower spritz with cucumber ribbon and artisanal non-alcoholic sparkling cider.',
        course: 'drinks',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
    ],
    activities: [
      {
        id: 'w-act-1',
        content: 'Golden hour portrait walk — dedicate 20 minutes for couple portraits during the best natural light.',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'w-act-2',
        content: 'Living guest book: attendees write notes on seed-embedded handmade paper for planting later.',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'w-act-3',
        content: 'Acoustic ceremony processional transitioning into lively courtyard jazz during cocktail hour.',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
    ],
    decor: [
      {
        id: 'w-decor-1',
        content: 'Low-profile meadow runner centerpieces with organic florals that allow unobstructed across-table conversation.',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'w-decor-2',
        content: 'Hand-lettered deckle-edge escort cards suspended with brass clips from linen display boards.',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'w-decor-3',
        content: 'Curved ceremony arch of woven grapevine, olive boughs, and neutral garden roses.',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
    ],
    dayTimeline: [
      { id: 'w-day-1', time: '10:00', label: 'Hair & makeup styling begins', duration: '3 hr', notes: 'Party begins in dressing suite.' },
      { id: 'w-day-2', time: '13:00', label: 'Venue floral installation & sound check', duration: '1 hr', notes: 'Walkthrough with coordinator.' },
      { id: 'w-day-3', time: '14:00', label: 'Guest arrival & welcome refreshments', duration: '30 min', notes: 'Acoustic guitar prelude.' },
      { id: 'w-day-4', time: '14:30', label: 'Ceremony & vow exchange', duration: '45 min', notes: 'Unplugged ceremony.' },
      { id: 'w-day-5', time: '15:30', label: 'Cocktail hour & golden hour photos', duration: '1 hr', notes: 'Passed canapés served.' },
      { id: 'w-day-6', time: '16:30', label: 'Dinner service & toasts', duration: '2 hr', notes: 'Three courses with wine pairing.' },
      { id: 'w-day-7', time: '18:30', label: 'Cake cutting & dessert table opening', duration: '30 min', notes: 'Coffee service opens.' },
      { id: 'w-day-8', time: '19:00', label: 'Live music & dancing celebration', duration: '3 hr', notes: 'Late-night savoury bites served at 21:00.' },
      { id: 'w-day-9', time: '22:00', label: 'Sparkler farewell & departure', duration: '15 min', notes: 'Transport shuttles depart.' },
    ],
    vendorQuestions: [
      {
        vendorType: 'Venue',
        questions: [
          'What is the precise load-in and teardown curfew for external rental companies?',
          'Is there an on-site dedicated backup space in the event of inclement weather?',
          'Are open-flame taper candles permitted if enclosed in hurricane glass?',
        ],
      },
      {
        vendorType: 'Catering & Bar',
        questions: [
          'How are severe allergen cross-contaminations managed in off-site kitchen setups?',
          'What is the recommended server-to-guest ratio for a seated three-course dinner?',
          'Is glassware and table linen included in the per-person package or billed separately?',
        ],
      },
      {
        vendorType: 'Photography',
        questions: [
          'How do you manage low-light indoor receptions without harsh direct flash?',
          'What is the delivery turnaround timeline for sneak peek photos and the full gallery?',
          'Do we receive unrestricted printing rights for our personal albums?',
        ],
      },
    ],
  },

  birthday: {
    themes: [
      {
        id: 'b-theme-1',
        content: 'Vintage Speakeasy Lounge — intimate jazz club ambiance, craft cocktails, low ambient glow, and vinyl selections.',
        styleTags: ['Speakeasy', 'Nocturne', 'Tactile'],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'b-theme-2',
        content: 'Garden Conservatory Brunch — sun-dappled morning celebration with champagne, fresh citrus, and floral linen.',
        styleTags: ['Garden', 'Botanical', 'Airy'],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'b-theme-3',
        content: 'Celestial Starlight Dinner — indigo table runners, gilded constellation stationery, and lantern warmth.',
        styleTags: ['Celestial', 'Atmospheric', 'Refined'],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
    ],
    colorPalettes: [
      {
        id: 'b-palette-1',
        name: 'Terracotta & Warm Amber',
        swatches: [
          { hex: '#7A3112', name: 'Terracotta Red', textColor: '#FAF7F2' },
          { hex: '#D9B65B', name: 'Warm Amber Gold', textColor: '#1C1917' },
          { hex: '#FAF7F2', name: 'Cream Vellum', textColor: '#1C1917' },
          { hex: '#2A1B14', name: 'Smoked Walnut', textColor: '#FAF7F2' },
          { hex: '#8A5A00', name: 'Antique Honey', textColor: '#FAF7F2' },
        ],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'b-palette-2',
        name: 'Speakeasy Velvet',
        swatches: [
          { hex: '#1C1512', name: 'Espresso Velvet', textColor: '#FAF7F2' },
          { hex: '#C46D47', name: 'Burnt Copper', textColor: '#FAF7F2' },
          { hex: '#E5A823', name: 'Champagne Fizz', textColor: '#1C1917' },
          { hex: '#5C2210', name: 'Vintage Mahagony', textColor: '#FAF7F2' },
          { hex: '#FAF7F2', name: 'Silk Linen', textColor: '#1C1917' },
        ],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'b-palette-3',
        name: 'Conservatory Citrus',
        swatches: [
          { hex: '#8FAF8F', name: 'Eucalyptus', textColor: '#1C1917' },
          { hex: '#E89635', name: 'Seville Orange', textColor: '#1C1917' },
          { hex: '#F4EFE6', name: 'Limestone', textColor: '#1C1917' },
          { hex: '#2F6B4F', name: 'Deep Laurel', textColor: '#FAF7F2' },
          { hex: '#D9B65B', name: 'Sunlit Brass', textColor: '#1C1917' },
        ],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
    ],
    menuIdeas: [
      {
        id: 'b-menu-1',
        content: 'Starter: Artisanal charcuterie and grazing boards with local honeycomb, warm focaccia, and pickled shallots.',
        course: 'starter',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'b-menu-2',
        content: 'Main: Wood-fired small plates: braised short rib sliders, grilled polenta bites, and roasted vegetable flatbreads.',
        course: 'main',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'b-menu-3',
        content: 'Dessert: Single-tier almond flour salted caramel cake accompanied by miniature dark chocolate tartlets.',
        course: 'dessert',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'b-menu-4',
        content: 'Drinks: Smoked rosemary Old Fashioned cocktail and a crisp zero-proof blood orange spritz.',
        course: 'drinks',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
    ],
    activities: [
      {
        id: 'b-act-1',
        content: 'Vinyl record listening corner: guests select tracks from the celebrant’s curated vinyl collection.',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'b-act-2',
        content: 'Bespoke trivia round based on milestone memories and favorite cultural moments.',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'b-act-3',
        content: 'Polaroid guest book station with metallic ink pens for immediate physical keepsakes.',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
    ],
    decor: [
      {
        id: 'b-decor-1',
        content: 'Amber glass apothecary bottles filled with dried florals and warm candlelight groupings.',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'b-decor-2',
        content: 'Architectural brass bar cart styling with crystal decanters and custom cocktail recipe cards.',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'b-decor-3',
        content: 'Faceted mirror centerpiece catching golden ambient room glow without harsh reflections.',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
    ],
    dayTimeline: [
      { id: 'b-day-1', time: '17:00', label: 'Bar cart styling & ambient playlist setup', duration: '1 hr', notes: 'Ice and glassware staged.' },
      { id: 'b-day-2', time: '18:00', label: 'Doors open & welcome cocktails', duration: '1 hr', notes: 'Grazing boards available.' },
      { id: 'b-day-3', time: '19:00', label: 'Passed warm savory small plates', duration: '1.5 hr', notes: 'Chef active stations.' },
      { id: 'b-day-4', time: '20:30', label: 'Milestone toast & cake cutting', duration: '30 min', notes: 'Short speeches by close friends.' },
      { id: 'b-day-5', time: '21:00', label: 'Vinyl DJ set & dessert service', duration: '2 hr', notes: 'Cocktails continue.' },
      { id: 'b-day-6', time: '23:00', label: 'Celebration wrap-up & favor gifting', duration: '30 min', notes: 'Coats and favors retrieved.' },
    ],
    vendorQuestions: [
      {
        vendorType: 'Venue',
        questions: [
          'What is the sound decibel limit and closing curfew for evening celebrations?',
          'Can external specialty bakeries deliver cakes directly into walk-in refrigeration?',
          'Is there an accessible entrance and private lounge space for the celebrant?',
        ],
      },
      {
        vendorType: 'Catering & Food',
        questions: [
          'Can dietary modifications (gluten-free, dairy-free) be flagged on individual pass trays?',
          'Do you supply certified bar staff and ice delivery alongside food service?',
          'What is the deposit policy for booking confirmation?',
        ],
      },
    ],
  },

  community: {
    themes: [
      {
        id: 'c-theme-1',
        content: 'Local Harvest & Artisans — celebrate regional growers, neighborhood bakers, and maker crafts in an open-air pavilion.',
        styleTags: ['Harvest', 'Artisanal', 'Civic'],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'c-theme-2',
        content: 'Neighborhood Lantern Festival — twilight gathering with illuminated installations, world music, and shared community tables.',
        styleTags: ['Lanterns', 'Twilight', 'All-Ages'],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'c-theme-3',
        content: 'Street Arts & Living Mural — collaborative chalk art, acoustic buskers, and open participatory workshops for families.',
        styleTags: ['Interactive', 'Vibrant', 'Inclusive'],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
    ],
    colorPalettes: [
      {
        id: 'c-palette-1',
        name: 'Pavilion Sage & Ochre',
        swatches: [
          { hex: '#123F45', name: 'Civic Teal', textColor: '#FAF7F2' },
          { hex: '#8A5A00', name: 'Harvest Ochre', textColor: '#FAF7F2' },
          { hex: '#2F6B4F', name: 'Park Laurel', textColor: '#FAF7F2' },
          { hex: '#F1EADC', name: 'Linen Parchment', textColor: '#1C1917' },
          { hex: '#1C1917', name: 'Cast Iron', textColor: '#FAF7F2' },
        ],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'c-palette-2',
        name: 'Twilight Lantern Warmth',
        swatches: [
          { hex: '#0D1E24', name: 'Midnight Navy', textColor: '#FAF7F2' },
          { hex: '#D99B26', name: 'Lantern Glow', textColor: '#1C1917' },
          { hex: '#D9B65B', name: 'Candle Gold', textColor: '#1C1917' },
          { hex: '#C46D47', name: 'Terracotta Pot', textColor: '#FAF7F2' },
          { hex: '#FFFDF8', name: 'Washi Paper', textColor: '#1C1917' },
        ],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'c-palette-3',
        name: 'Heirloom Orchard',
        swatches: [
          { hex: '#C43322', name: 'Heirloom Apple', textColor: '#FAF7F2' },
          { hex: '#8A603C', name: 'Weathered Oak', textColor: '#FAF7F2' },
          { hex: '#E5A823', name: 'Sweet Corn', textColor: '#1C1917' },
          { hex: '#5E7550', name: 'Garden Moss', textColor: '#FAF7F2' },
          { hex: '#F7F3EC', name: 'Cotton Canvas', textColor: '#1C1917' },
        ],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
    ],
    menuIdeas: [
      {
        id: 'c-menu-1',
        content: 'Starter: Community bread basket with local butter varieties, sea salt, and seasonal farm dips.',
        course: 'starter',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'c-menu-2',
        content: 'Main: Festival food truck stations: wood-fired artisan pizza slices, grain harvest bowls, and empanadas.',
        course: 'main',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'c-menu-3',
        content: 'Dessert: Handheld local apple hand pies and warm cinnamon churros wrapped in compostable kraft paper.',
        course: 'dessert',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'c-menu-4',
        content: 'Drinks: Spiced hot cider vat and a complimentary filtered citrus hydration station.',
        course: 'drinks',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
    ],
    activities: [
      {
        id: 'c-act-1',
        content: 'Community collaborative mural: children and adults contribute painted tiles forming a lasting civic mosaic.',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'c-act-2',
        content: 'Local acoustic musician showcase on a shaded grass stage with picnic blanket seating.',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'c-act-3',
        content: 'Seedling giveaway and gardening Q&A hosted by the neighborhood community garden team.',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
    ],
    decor: [
      {
        id: 'c-decor-1',
        content: 'Repurposed canvas and fabric pennants strung between park trees for festive, low-waste atmosphere.',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'c-decor-2',
        content: 'Chalkboard directional signage framed in reclaimed timber clearly marking hydration and accessibility ramps.',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'c-decor-3',
        content: 'Solar-powered hanging globe lanterns that turn on automatically at twilight.',
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
    ],
    dayTimeline: [
      { id: 'c-day-1', time: '08:00', label: 'Site setup & volunteer check-in', duration: '2 hr', notes: 'Safety briefing and map distribution.' },
      { id: 'c-day-2', time: '10:00', label: 'Festival grounds open to public', duration: '1 hr', notes: 'Hydration and info booths live.' },
      { id: 'c-day-3', time: '11:00', label: 'Welcome remarks from organizers', duration: '15 min', notes: 'Acknowledge community sponsors.' },
      { id: 'c-day-4', time: '11:30', label: 'Food trucks & artisan market open', duration: '4 hr', notes: 'Compostable sorting bins monitored.' },
      { id: 'c-day-5', time: '13:00', label: 'Interactive mural workshops begin', duration: '3 hr', notes: 'All supplies provided.' },
      { id: 'c-day-6', time: '16:00', label: 'Main acoustic music set', duration: '2 hr', notes: 'Family picnic seating encouraged.' },
      { id: 'c-day-7', time: '18:00', label: 'Lantern lighting ceremony', duration: '30 min', notes: 'Ambient park illumination.' },
      { id: 'c-day-8', time: '19:00', label: 'Closing & organized site clean-up', duration: '1.5 hr', notes: 'Volunteers execute leave-no-trace sweep.' },
    ],
    vendorQuestions: [
      {
        vendorType: 'Park / Municipal Venue',
        questions: [
          'What are the city requirements for waste management, recycling, and compost collection?',
          'Where are the designated emergency vehicle access lanes and electrical tie-in boxes?',
          'Is special event insurance coverage verification required 30 days prior to event day?',
        ],
      },
      {
        vendorType: 'Food Trucks / Vendors',
        questions: [
          'Do all operating trucks hold active county health inspection certificates?',
          'What are your electrical generator wattage needs or can you connect to park power?',
          'Are compostable serving containers and utensils strictly used for all orders?',
        ],
      },
    ],
  },
};

/**
 * Returns demo ideas for the given event type.
 * All content is clearly labeled isAIGenerated: false to distinguish from real AI output.
 */
export function getDemoIdeas(eventType: EventType): Ideas {
  return DEMO_IDEAS[eventType];
}

/**
 * Returns a demo plan name based on event type.
 */
export function getDemoPlanName(eventType: EventType): string {
  const names: Record<EventType, string> = {
    wedding: 'Our Celebration',
    birthday: 'Birthday Celebration',
    community: 'Community Gathering',
  };
  return names[eventType];
}
