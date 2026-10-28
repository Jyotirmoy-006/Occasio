/**
 * Demo engine — deterministic, high-quality fallback when Gemini API is unavailable.
 * Activated when GEMINI_API_KEY is absent OR when any AI call fails.
 *
 * Returns the same schema-valid output as the AI layer, clearly labeled as demo content.
 * All responses are authored by human; no model involved.
 */

import type { Ideas } from '@/domain/schemas/ideas';
import type { EventType } from '@/lib/constants';

type DemoIdeas = Ideas;

const DEMO_IDEAS: Record<EventType, DemoIdeas> = {
  wedding: {
    themes: [
      { id: 'w-theme-1', content: 'Garden Romanticism — natural greenery, candlelight, and botanical arrangements with a relaxed, intimate atmosphere.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'w-theme-2', content: 'Timeless Elegance — refined simplicity with classic linens, curated florals, and a warm monochromatic palette.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'w-theme-3', content: 'Cultural Fusion — weave together meaningful traditions from both families with intentional, respectful storytelling.', pinned: false, dismissed: false, isAIGenerated: false },
    ],
    colorPalettes: [
      {
        id: 'w-palette-1',
        name: 'Sage & Ivory',
        swatches: [
          { hex: '#8FAF8F', name: 'Sage', textColor: '#1C1917' },
          { hex: '#F5F0E8', name: 'Ivory', textColor: '#1C1917' },
          { hex: '#C4A882', name: 'Warm Sand', textColor: '#1C1917' },
          { hex: '#2D5016', name: 'Forest', textColor: '#FAF7F2' },
          { hex: '#1C1917', name: 'Deep Ink', textColor: '#FAF7F2' },
        ],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
      {
        id: 'w-palette-2',
        name: 'Terracotta & Cream',
        swatches: [
          { hex: '#8B4513', name: 'Terracotta', textColor: '#FAF7F2' },
          { hex: '#FAF7F2', name: 'Cream', textColor: '#1C1917' },
          { hex: '#D4A57A', name: 'Warm Peach', textColor: '#1C1917' },
          { hex: '#5C3317', name: 'Mahogany', textColor: '#FAF7F2' },
          { hex: '#E8DDD0', name: 'Blush Linen', textColor: '#1C1917' },
        ],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
    ],
    menuIdeas: [
      { id: 'w-menu-1', content: 'Family-style seasonal sharing platters — encourages warmth and conversation at each table.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'w-menu-2', content: 'Three-course plated dinner with a vegetarian option for every course; prominently label all allergens.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'w-menu-3', content: 'Late-night street food station with local specialties — a crowd-pleasing surprise during dancing.', pinned: false, dismissed: false, isAIGenerated: false },
    ],
    activities: [
      { id: 'w-act-1', content: 'Golden hour portrait walk — dedicate 20 minutes for couple portraits during the best light.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'w-act-2', content: 'Guest book alternative: ask guests to write wishes on seed-paper cards that can be planted.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'w-act-3', content: 'Acoustic ceremony with live string quartet or acoustic guitar during processional.', pinned: false, dismissed: false, isAIGenerated: false },
    ],
    decor: [
      { id: 'w-decor-1', content: 'Cascading greenery centrepieces with pillar candles — timeless and scalable to any table size.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'w-decor-2', content: 'Handwritten calligraphy escort cards on kraft paper — personal and zero-waste.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'w-decor-3', content: 'Ceremony arch woven from seasonal branches and locally-sourced flowers.', pinned: false, dismissed: false, isAIGenerated: false },
    ],
    dayTimeline: [
      { id: 'w-day-1', time: '10:00', label: 'Hair & makeup begins', duration: '3 hr', notes: 'Begin with bridesmaids; leave 1 hr for the main person.' },
      { id: 'w-day-2', time: '13:00', label: 'Venue setup complete', duration: '—', notes: 'Final walkthrough with coordinator.' },
      { id: 'w-day-3', time: '14:00', label: 'Guest arrival', duration: '30 min', notes: 'Welcome drinks served.' },
      { id: 'w-day-4', time: '14:30', label: 'Ceremony', duration: '45 min', notes: 'Including processional and signing.' },
      { id: 'w-day-5', time: '15:30', label: 'Cocktail hour', duration: '1 hr', notes: 'Couple portraits during this time.' },
      { id: 'w-day-6', time: '16:30', label: 'Reception begins — entrée', duration: '30 min', notes: '' },
      { id: 'w-day-7', time: '17:00', label: 'First dance & speeches', duration: '45 min', notes: 'Maximum 4 speakers; brief them on time.' },
      { id: 'w-day-8', time: '18:00', label: 'Dinner', duration: '1.5 hr', notes: '' },
      { id: 'w-day-9', time: '19:30', label: 'Cake cutting', duration: '15 min', notes: '' },
      { id: 'w-day-10', time: '20:00', label: 'Dancing & celebrations', duration: '2.5 hr', notes: '' },
      { id: 'w-day-11', time: '22:30', label: 'Last dance & farewell', duration: '15 min', notes: 'Confirm vendor pack-down begins.' },
    ],
  },

  birthday: {
    themes: [
      { id: 'b-theme-1', content: 'Garden Party — outdoor setting with floral arrangements, lawn games, and a relaxed dresscode.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'b-theme-2', content: 'Decade Celebration — honor a milestone age with décor and music from that era.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'b-theme-3', content: 'Intimate Dinner Party — curated guest list, elevated menu, and meaningful conversation.', pinned: false, dismissed: false, isAIGenerated: false },
    ],
    colorPalettes: [
      {
        id: 'b-palette-1',
        name: 'Warm Celebration',
        swatches: [
          { hex: '#8B4513', name: 'Terracotta', textColor: '#FAF7F2' },
          { hex: '#F4D03F', name: 'Warm Gold', textColor: '#1C1917' },
          { hex: '#FAF7F2', name: 'Cream', textColor: '#1C1917' },
          { hex: '#2D5016', name: 'Evergreen', textColor: '#FAF7F2' },
        ],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
    ],
    menuIdeas: [
      { id: 'b-menu-1', content: 'Grazing table with artisan cheeses, charcuterie, seasonal fruits, and dips — inclusive and abundant.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'b-menu-2', content: 'Interactive food station: build-your-own tacos or sushi rolls — fun and dietary-flexible.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'b-menu-3', content: 'Cupcake tower instead of a traditional cake — individual servings simplify service and labeling allergens.', pinned: false, dismissed: false, isAIGenerated: false },
    ],
    activities: [
      { id: 'b-act-1', content: 'Photo booth with themed props — printed photos as party favors.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'b-act-2', content: 'Trivia round about the guest of honor — personal and hilarious.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'b-act-3', content: 'DIY craft table (candle-making, flower-arranging) that doubles as a keepsake.', pinned: false, dismissed: false, isAIGenerated: false },
    ],
    decor: [
      { id: 'b-decor-1', content: 'Balloon arch in two-tone neutral palette — modern, not childish.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'b-decor-2', content: 'Gallery wall of photos from the person's life — guests contribute via a shared album link.', pinned: false, dismissed: false, isAIGenerated: false },
    ],
    dayTimeline: [
      { id: 'b-day-1', time: '14:00', label: 'Guests arrive', duration: '30 min', notes: 'Welcome drinks ready.' },
      { id: 'b-day-2', time: '14:30', label: 'Activity or entertainment begins', duration: '1 hr', notes: '' },
      { id: 'b-day-3', time: '15:30', label: 'Food served', duration: '45 min', notes: '' },
      { id: 'b-day-4', time: '16:30', label: 'Cake cutting & birthday song', duration: '15 min', notes: '' },
      { id: 'b-day-5', time: '17:00', label: 'Free socializing & photos', duration: '1 hr', notes: '' },
      { id: 'b-day-6', time: '18:00', label: 'Guests depart', duration: '—', notes: '' },
    ],
  },

  community: {
    themes: [
      { id: 'c-theme-1', content: 'Local Harvest — celebrate the community and its local producers with a market-style layout.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'c-theme-2', content: 'Cultural Tapestry — showcase the diverse traditions within your community through food, music, and art.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'c-theme-3', content: 'Neighbourhood Reunion — welcoming, nostalgic atmosphere focused on connection and shared history.', pinned: false, dismissed: false, isAIGenerated: false },
    ],
    colorPalettes: [
      {
        id: 'c-palette-1',
        name: 'Earthy Community',
        swatches: [
          { hex: '#2D5016', name: 'Forest Green', textColor: '#FAF7F2' },
          { hex: '#FAF7F2', name: 'Warm White', textColor: '#1C1917' },
          { hex: '#8B6914', name: 'Amber', textColor: '#FAF7F2' },
          { hex: '#78716C', name: 'Warm Grey', textColor: '#FAF7F2' },
        ],
        pinned: false,
        dismissed: false,
        isAIGenerated: false,
      },
    ],
    menuIdeas: [
      { id: 'c-menu-1', content: 'Potluck-inspired shared tables — ask attendees to bring a dish from their culture; curate dietary balance.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'c-menu-2', content: 'Local food vendor stalls — support small businesses and keep the energy festival-like.', pinned: false, dismissed: false, isAIGenerated: false },
    ],
    activities: [
      { id: 'c-act-1', content: 'Live music showcase featuring local performers — open call for community talent.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'c-act-2', content: 'Interactive mural or community art installation that attendees contribute to during the event.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'c-act-3', content: 'Kids' area with supervised activities — encourages family attendance and inclusivity.', pinned: false, dismissed: false, isAIGenerated: false },
    ],
    decor: [
      { id: 'c-decor-1', content: 'Sustainable bunting from recycled fabric — involve community members in making it.', pinned: false, dismissed: false, isAIGenerated: false },
      { id: 'c-decor-2', content: 'Map of the neighbourhood as centrepiece — highlighting landmarks meaningful to attendees.', pinned: false, dismissed: false, isAIGenerated: false },
    ],
    dayTimeline: [
      { id: 'c-day-1', time: '09:00', label: 'Setup and volunteer briefing', duration: '2 hr', notes: '' },
      { id: 'c-day-2', time: '11:00', label: 'Doors open', duration: '—', notes: 'Welcome team at entrance.' },
      { id: 'c-day-3', time: '11:30', label: 'Opening remarks & welcome', duration: '15 min', notes: 'Acknowledge traditional custodians of the land if appropriate.' },
      { id: 'c-day-4', time: '12:00', label: 'Activities and entertainment', duration: '2.5 hr', notes: 'Staggered programming across zones.' },
      { id: 'c-day-5', time: '13:00', label: 'Lunch', duration: '1 hr', notes: '' },
      { id: 'c-day-6', time: '15:00', label: 'Main performance or keynote', duration: '1 hr', notes: '' },
      { id: 'c-day-7', time: '16:00', label: 'Community gathering and close', duration: '30 min', notes: 'Thank volunteers and sponsors.' },
      { id: 'c-day-8', time: '16:30', label: 'Pack-down begins', duration: '1.5 hr', notes: '' },
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

