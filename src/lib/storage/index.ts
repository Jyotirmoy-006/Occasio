/**
 * localStorage persistence layer with schema versioning and migration.
 * All reads are Zod-validated. All writes are type-safe.
 *
 * No user PII is stored: plan data contains event logistics only.
 */

import { z } from 'zod';
import { PlanSchema } from '@/domain/schemas/plan';
import type { Plan } from '@/domain/schemas/plan';
import { SCHEMA_VERSION } from '@/lib/constants';

const STORAGE_KEY_PREFIX = 'occasio_plan_';
const INDEX_KEY = 'occasio_plan_index';

type PlanIndex = string[]; // array of plan IDs

// ─── Schema migration registry ─────────────────────────────────────────────

/**
 * Add a migration function here when bumping SCHEMA_VERSION.
 * Each function takes the previous version's raw data and returns migrated data.
 */
const MIGRATIONS: Record<number, (raw: unknown) => unknown> = {
  // Example: 2: (raw) => ({ ...raw, newField: 'default' }),
};

function migrate(raw: unknown, fromVersion: number): unknown {
  let data = raw;
  for (let v = fromVersion + 1; v <= SCHEMA_VERSION; v++) {
    const migrateFn = MIGRATIONS[v];
    if (migrateFn) {
      data = migrateFn(data);
    }
  }
  return data;
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Saves a plan to localStorage. Returns true on success.
 */
export function savePlan(plan: Plan): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const serialized = JSON.stringify(plan);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${plan.id}`, serialized);
    addToIndex(plan.id);
    return true;
  } catch {
    // localStorage may be full or unavailable (private browsing)
    return false;
  }
}

/**
 * Loads a plan by ID. Validates against current schema and migrates if needed.
 * Returns null if not found or validation fails.
 */
export function loadPlan(id: string): Plan | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;

    // Check schema version and migrate if needed
    const versionSchema = z.object({ schemaVersion: z.number().int() });
    const versionResult = versionSchema.safeParse(parsed);
    const fromVersion = versionResult.success ? versionResult.data.schemaVersion : 0;

    const migrated = migrate(parsed, fromVersion);

    // Validate against current schema
    const result = PlanSchema.safeParse(migrated);
    if (!result.success) {
      console.warn('Plan validation failed after migration:', result.error.flatten());
      return null;
    }

    return result.data;
  } catch {
    return null;
  }
}

/**
 * Loads all plans from localStorage.
 * Invalid or corrupted plans are silently skipped.
 */
export function loadAllPlans(): Plan[] {
  if (typeof window === 'undefined') return [];

  const index = getIndex();
  return index.map((id) => loadPlan(id)).filter((p): p is Plan => p !== null);
}

/**
 * Deletes a plan by ID. Returns true on success.
 */
export function deletePlan(id: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
    removeFromIndex(id);
    return true;
  } catch {
    return false;
  }
}

/**
 * Exports a plan as a validated JSON string for download.
 */
export function exportPlanJSON(plan: Plan): string {
  return JSON.stringify(plan, null, 2);
}

/**
 * Imports a plan from a JSON string.
 * Validates against the schema and migrates if needed.
 * Returns the validated plan or throws a descriptive error.
 */
export function importPlanJSON(jsonString: string): Plan {
  const MAX_IMPORT_BYTES = 512 * 1024; // 512 KB

  if (jsonString.length > MAX_IMPORT_BYTES) {
    throw new Error('Import file is too large (max 512 KB).');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON file. Could not parse.');
  }

  const versionSchema = z.object({ schemaVersion: z.number().int() });
  const versionResult = versionSchema.safeParse(parsed);
  const fromVersion = versionResult.success ? versionResult.data.schemaVersion : 0;

  const migrated = migrate(parsed, fromVersion);
  const result = PlanSchema.safeParse(migrated);

  if (!result.success) {
    throw new Error(`Import validation failed: ${result.error.issues[0]?.message ?? 'Unknown error'}`);
  }

  return result.data;
}

// ─── Index helpers ─────────────────────────────────────────────────────────

function getIndex(): PlanIndex {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function addToIndex(id: string): void {
  const index = getIndex();
  if (!index.includes(id)) {
    index.push(id);
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  }
}

function removeFromIndex(id: string): void {
  const index = getIndex().filter((i) => i !== id);
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

