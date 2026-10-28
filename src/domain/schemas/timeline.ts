/**
 * Timeline domain schema.
 * Milestones are backward-planned from the event date.
 */
import { z } from 'zod';

export const MilestoneStatusSchema = z.enum(['pending', 'in-progress', 'done', 'skipped']);

export const MilestoneSchema = z.object({
  id: z.string(),
  label: z.string().min(1).max(120),
  description: z.string().max(300).default(''),
  /** ISO date string YYYY-MM-DD */
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.string().max(60),
  status: MilestoneStatusSchema,
  /** How many weeks before the event this milestone is due. */
  weeksBeforeEvent: z.number().int(),
  /** Whether this milestone is on the critical path. */
  isCritical: z.boolean().default(false),
});

export const TimelineSchema = z.object({
  milestones: z.array(MilestoneSchema).min(0).max(100),
});

export type Milestone = z.infer<typeof MilestoneSchema>;
export type MilestoneStatus = z.infer<typeof MilestoneStatusSchema>;
export type Timeline = z.infer<typeof TimelineSchema>;
