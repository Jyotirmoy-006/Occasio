/**
 * Ideas domain schema.
 * All AI-generated content; pinned/dismissed state tracked client-side.
 */
import { z } from 'zod';

export const IdeaItemSchema = z.object({
  id: z.string(),
  content: z.string().max(500),
  pinned: z.boolean().default(false),
  dismissed: z.boolean().default(false),
  /** Marks this as AI-generated — rendered with a label in the UI. */
  isAIGenerated: z.boolean().default(true),
});

export const ColorSwatchSchema = z.object({
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  name: z.string().max(40),
  /** Precomputed contrast-safe text color (either #1C1917 or #FAF7F2). */
  textColor: z.enum(['#1C1917', '#FAF7F2']),
});

export const ColorPaletteSchema = z.object({
  id: z.string(),
  name: z.string().max(60),
  swatches: z.array(ColorSwatchSchema).min(2).max(6),
  pinned: z.boolean().default(false),
  dismissed: z.boolean().default(false),
  isAIGenerated: z.boolean().default(true),
});

export const DayTimelineItemSchema = z.object({
  id: z.string(),
  time: z.string().max(10),
  label: z.string().max(100),
  duration: z.string().max(40),
  notes: z.string().max(200).default(''),
});

export const IdeasSchema = z.object({
  themes: z.array(IdeaItemSchema).max(10),
  colorPalettes: z.array(ColorPaletteSchema).max(5),
  menuIdeas: z.array(IdeaItemSchema).max(10),
  activities: z.array(IdeaItemSchema).max(10),
  decor: z.array(IdeaItemSchema).max(10),
  dayTimeline: z.array(DayTimelineItemSchema).max(20),
});

export type IdeaItem = z.infer<typeof IdeaItemSchema>;
export type ColorSwatch = z.infer<typeof ColorSwatchSchema>;
export type ColorPalette = z.infer<typeof ColorPaletteSchema>;
export type DayTimelineItem = z.infer<typeof DayTimelineItemSchema>;
export type Ideas = z.infer<typeof IdeasSchema>;
