/**
 * Budget domain schema.
 * All monetary values are integer minor units (cents, paise, etc.)
 * to avoid floating-point drift during rebalancing.
 */
import { z } from 'zod';

export const BudgetCategorySchema = z.object({
  id: z.string(),
  label: z.string().min(1).max(60),
  /** Percentage of total budget (0-100). Stored alongside minor units for quick display. */
  allocatedPercent: z.number().min(0).max(100),
  allocatedMinorUnits: z.number().int().min(0),
  actualMinorUnits: z.number().int().min(0),
  /** Hex color for donut chart segment. */
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  /** When locked, rebalancing other sliders does not change this category. */
  locked: z.boolean(),
});

export const BudgetSchema = z.object({
  categories: z
    .array(BudgetCategorySchema)
    .min(1)
    .max(20),
  totalMinorUnits: z.number().int().min(0),
});

export type BudgetCategory = z.infer<typeof BudgetCategorySchema>;
export type Budget = z.infer<typeof BudgetSchema>;
