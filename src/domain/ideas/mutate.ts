import type { Ideas, IdeaItem } from '@/domain/schemas/ideas';

export type IdeaItemSection = 'themes' | 'menuIdeas' | 'activities' | 'decor';
export type IdeaPinnableSection = IdeaItemSection | 'colorPalettes';

export const ALTERNATIVE_PROMPTS: Record<IdeaItemSection, string[]> = {
  themes: [
    'Midsummer Botanical Sanctuary — lush herb planters, organic linen runners, and acoustic folk strings.',
    'Modern Archival Gallery — curated monochrome florals, architectural candle columns, and tactile typography.',
    'Golden Hour Hearth — terracotta vessel centerpieces, amber glassware, and a warm communal fireplace gathering.',
  ],
  menuIdeas: [
    'Wood-fired seasonal harvest feast: roasted heirloom squashes, charred rosemary focaccia, and smoked sea salt honey butter.',
    'Interactive chef stations: hand-pulled noodles and seasonal dumpling bar with clearly delineated vegetarian broth.',
    'Artisanal farm-to-table dessert flight: cardamom panna cotta, citrus olive oil cake, and dark chocolate lavender truffles.',
  ],
  activities: [
    'Audio guestbook booth with vintage rotary telephone recording heartfelt guest messages.',
    'Twilight stargazing lounge with binoculars, warm wool blankets, and hot spiced cider station.',
    'Polaroid keepsake photo board where guests snap candids and peg them with handwritten memories.',
  ],
  decor: [
    'Hanging installation of dried florals and textured linen lanterns creating an intimate canopy ceiling.',
    'Handmade ceramic bud vases in varied heights along guest banquet tables.',
    'Bespoke calligraphed fabric banner at entrance with welcome quote.',
  ],
};

export function getRandomAlternative(section: IdeaItemSection): string {
  const options = ALTERNATIVE_PROMPTS[section] || ['Curated bespoke concept tailored to your vision.'];
  return options[Math.floor(Math.random() * options.length)] ?? options[0] ?? '';
}

export function toggleIdeaPin(ideas: Ideas, section: IdeaPinnableSection, id: string): Ideas {
  if (section === 'colorPalettes') {
    return {
      ...ideas,
      colorPalettes: ideas.colorPalettes.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p)),
    };
  }
  return {
    ...ideas,
    [section]: ideas[section].map((item: IdeaItem) => (item.id === id ? { ...item, pinned: !item.pinned } : item)),
  };
}

export function toggleIdeaDismiss(ideas: Ideas, section: IdeaPinnableSection, id: string): Ideas {
  if (section === 'colorPalettes') {
    return {
      ...ideas,
      colorPalettes: ideas.colorPalettes.map((p) => (p.id === id ? { ...p, dismissed: !p.dismissed } : p)),
    };
  }
  return {
    ...ideas,
    [section]: ideas[section].map((item: IdeaItem) => (item.id === id ? { ...item, dismissed: !item.dismissed } : item)),
  };
}

export function replaceIdeaContent(ideas: Ideas, section: IdeaItemSection, id: string, newContent: string): Ideas {
  return {
    ...ideas,
    [section]: ideas[section].map((item: IdeaItem) => (item.id === id ? { ...item, content: newContent } : item)),
  };
}
