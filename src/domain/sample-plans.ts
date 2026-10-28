import type { Plan } from '@/domain/schemas/plan';
import { createDefaultBudget } from '@/domain/budget/allocation';
import { generateTimeline } from '@/domain/timeline/generate';
import { generateChecklist } from '@/domain/checklist/generate';
import { getDemoIdeas } from '@/lib/ai/demo-engine';

export const SAMPLE_PLANS: Record<'wedding' | 'birthday' | 'community', Plan> = {
  wedding: {
    id: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d',
    schemaVersion: 1,
    eventType: 'wedding',
    eventName: 'Autumn Meadow Wedding',
    eventDate: '2027-10-16',
    guestCount: 120,
    budgetMinorUnits: 3000000, // $30,000
    currency: 'USD',
    city: 'Hudson Valley, NY',
    style: 'Botanical warmth, seasonal foliage, and acoustic string quartet',
    culturalNeeds: 'Vegetarian tasting courses with clear allergen signage',
    priorities: ['Venue', 'Catering & Bar', 'Photography'],
    budget: createDefaultBudget('wedding', 3000000),
    timeline: generateTimeline('wedding', '2027-10-16'),
    checklist: generateChecklist('wedding'),
    ideas: {
      ...getDemoIdeas('wedding'),
      provenance: {
        source: 'demo_engine',
        timestamp: new Date().toISOString(),
        label: 'Demo engine',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isAIGenerated: false,
  },
  birthday: {
    id: 'b2c3d4e5-f6a1-4b2c-8d3e-4f5a6b7c8d9e',
    schemaVersion: 1,
    eventType: 'birthday',
    eventName: 'Milestone Fortieth Celebration',
    eventDate: '2027-04-18',
    guestCount: 50,
    budgetMinorUnits: 800000, // $8,000
    currency: 'USD',
    city: 'Chicago, IL',
    style: 'Warm candlelight, vinyl listening lounge, and shared tapas plates',
    culturalNeeds: 'Gluten-free dessert options',
    priorities: ['Catering & Food', 'Entertainment', 'Venue Rental'],
    budget: createDefaultBudget('birthday', 800000),
    timeline: generateTimeline('birthday', '2027-04-18'),
    checklist: generateChecklist('birthday'),
    ideas: {
      ...getDemoIdeas('birthday'),
      provenance: {
        source: 'demo_engine',
        timestamp: new Date().toISOString(),
        label: 'Demo engine',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isAIGenerated: false,
  },
  community: {
    id: 'c3d4e5f6-a1b2-4c3d-8e4f-5a6b7c8d9e0f',
    schemaVersion: 1,
    eventType: 'community',
    eventName: 'Neighborhood Harvest Gathering',
    eventDate: '2027-09-25',
    guestCount: 250,
    budgetMinorUnits: 1200000, // $12,000
    currency: 'USD',
    city: 'Austin, TX',
    style: 'Open-air pavilion, family artisan workshops, and local folk bands',
    culturalNeeds: 'Accessible ramps, alcohol-free family area, multilingual signage',
    priorities: ['Venue & Permits', 'Sound & Staging', 'Family Activities'],
    budget: createDefaultBudget('community', 1200000),
    timeline: generateTimeline('community', '2027-09-25'),
    checklist: generateChecklist('community'),
    ideas: {
      ...getDemoIdeas('community'),
      provenance: {
        source: 'demo_engine',
        timestamp: new Date().toISOString(),
        label: 'Demo engine',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isAIGenerated: false,
  },
};
