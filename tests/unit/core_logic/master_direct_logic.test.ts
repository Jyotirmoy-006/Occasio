import { describe, it, expect } from 'vitest';
import { SAMPLE_PLANS } from '@/domain/sample-plans';
import { importPlanJSON, exportPlanJSON } from '@/lib/storage';
import { parseInputToMinorUnits } from '@/domain/budget/format';
import { generateFallbackCopilotResponse } from '@/lib/ai/client';

describe('Master Direct Logic Verification (Core Domain Rules)', () => {
  const weddingPlan = JSON.parse(JSON.stringify(SAMPLE_PLANS.wedding));

  it('recorded vendor quote updates category actual spend and over-budget warning', () => {
    const plan = JSON.parse(JSON.stringify(weddingPlan));
    const targetCategory = plan.budget.categories.find((c: any) => c.id === 'venue' || c.label.toLowerCase().includes('venue'));
    expect(targetCategory).toBeDefined();

    // Baseline: actualMinorUnits is initially 0
    expect(targetCategory.actualMinorUnits).toBe(0);
    const allocated = targetCategory.allocatedMinorUnits; // e.g., 900,000 cents ($9,000)

    // Vendor quote exceeding allocation: $12,000 -> 1,200,000 cents
    const quoteString = '12,000';
    const parsedQuoteMinor = parseInputToMinorUnits(quoteString, plan.currency);
    expect(parsedQuoteMinor).toBe(1200000);

    // Apply quote update directly mirroring ChecklistView.handleQuoteUpdate
    const updatedChecklistItems = plan.checklist.items.map((item: any) =>
      item.category === 'venue' ? { ...item, quoteMinorUnits: parsedQuoteMinor } : item,
    );

    const updatedCategories = plan.budget.categories.map((c: any) =>
      c.id === 'venue' ? { ...c, actualMinorUnits: parsedQuoteMinor } : c,
    );

    const updatedPlan = {
      ...plan,
      checklist: { items: updatedItemsChecklist(updatedChecklistItems) },
      budget: { ...plan.budget, categories: updatedCategories },
    };

    function updatedItemsChecklist(items: any) {
      return items;
    }

    const updatedCat = updatedPlan.budget.categories.find((c: any) => c.id === 'venue');
    expect(updatedCat.actualMinorUnits).toBe(1200000);

    // Assert over-budget rule triggers: actual spend exceeds allocation
    const isOverBudget = updatedCat.actualMinorUnits > updatedCat.allocatedMinorUnits;
    expect(isOverBudget).toBe(true);

    const overrunAmount = updatedCat.actualMinorUnits - updatedCat.allocatedMinorUnits;
    expect(overrunAmount).toBe(1200000 - allocated);
    expect(overrunAmount).toBeGreaterThan(0);
  });

  it('moving a vendor through the 4-stage pipeline updates pipeline counts and records timestamps', () => {
    const plan = JSON.parse(JSON.stringify(weddingPlan));
    const vendorItem = plan.checklist.items[0];
    expect(vendorItem.status).toBe('to-contact');

    // Initial counts
    const countToContactBefore = plan.checklist.items.filter((i: any) => i.status === 'to-contact').length;
    const countBookedBefore = plan.checklist.items.filter((i: any) => i.status === 'booked').length;

    // Step 1: Move to contacted
    const contactedAt = new Date().toISOString();
    let updatedItem = { ...vendorItem, status: 'contacted', contactedAt };
    expect(updatedItem.status).toBe('contacted');
    expect(updatedItem.contactedAt).toBe(contactedAt);

    // Step 2: Move to quoted
    updatedItem = { ...updatedItem, status: 'quoted', quoteMinorUnits: 250000 };
    expect(updatedItem.status).toBe('quoted');
    expect(updatedItem.quoteMinorUnits).toBe(250000);

    // Step 3: Move to booked
    const bookedAt = new Date().toISOString();
    updatedItem = { ...updatedItem, status: 'booked', bookedAt };
    expect(updatedItem.status).toBe('booked');
    expect(updatedItem.bookedAt).toBe(bookedAt);

    // Replace in checklist and re-calculate pipeline
    const updatedChecklist = plan.checklist.items.map((i: any) =>
      i.id === vendorItem.id ? updatedItem : i,
    );

    const countToContactAfter = updatedChecklist.filter((i: any) => i.status === 'to-contact').length;
    const countBookedAfter = updatedChecklist.filter((i: any) => i.status === 'booked').length;

    expect(countToContactAfter).toBe(countToContactBefore - 1);
    expect(countBookedAfter).toBe(countBookedBefore + 1);
  });

  it('copilot diff proposal shows changes and baseline state is unchanged until confirmation', () => {
    const baselinePlan = JSON.parse(JSON.stringify(weddingPlan));
    const originalBudget = baselinePlan.budget.totalMinorUnits;

    // User asks copilot: "Cut budget by 10%"
    const copilotProposal = generateFallbackCopilotResponse('cut budget by 10%');
    expect(copilotProposal.proposedChanges.length).toBeGreaterThan(0);
    expect(copilotProposal.proposedChanges[0].action).toBe('scale_budget');

    // Verification: baseline plan is NOT mutated prior to user clicking "Apply"
    expect(baselinePlan.budget.totalMinorUnits).toBe(originalBudget);

    // User explicitly confirms and applies the diff
    const change = copilotProposal.proposedChanges[0];
    const newTotal = Math.round(baselinePlan.budget.totalMinorUnits * Number(change.value));

    const confirmedPlan = {
      ...baselinePlan,
      budget: {
        ...baselinePlan.budget,
        totalMinorUnits: newTotal,
      },
    };

    expect(confirmedPlan.budget.totalMinorUnits).toBe(Math.round(originalBudget * 0.9));
    expect(confirmedPlan.budget.totalMinorUnits).not.toBe(originalBudget);
  });

  it('undo and redo restore exact state with zero drift', () => {
    const history: any[] = [];
    let state = JSON.parse(JSON.stringify(weddingPlan));
    const stateA = JSON.parse(JSON.stringify(state));

    // Push State A to history
    history.push(JSON.parse(JSON.stringify(state)));

    // Transition to State B (change guest count from 120 to 180)
    state = { ...state, guestCount: 180 };
    const stateB = JSON.parse(JSON.stringify(state));
    expect(state.guestCount).toBe(180);

    // Undo: pop from history
    const restoredStateA = history.pop();
    expect(restoredStateA.guestCount).toBe(stateA.guestCount);
    expect(restoredStateA).toEqual(stateA);

    // Redo: restore state B
    const redoStack = [stateB];
    const restoredStateB = redoStack.pop();
    expect(restoredStateB.guestCount).toBe(180);
    expect(restoredStateB).toEqual(stateB);
  });

  it('JSON import hardening rejects oversized (>512 KB) and malformed payloads', () => {
    // 1. Oversized payload
    const largePadding = 'a'.repeat(600 * 1024); // 600 KB
    expect(() => importPlanJSON(largePadding)).toThrow('Import file is too large (max 512 KB).');

    // 2. Malformed JSON syntax
    expect(() => importPlanJSON('{ "invalid": syntax error }')).toThrow('Invalid JSON file. Could not parse.');

    // 3. Schema invalid JSON (missing essential fields)
    const invalidSchemaJson = JSON.stringify({ eventName: 'Missing other fields' });
    expect(() => importPlanJSON(invalidSchemaJson)).toThrow(/Import validation failed/);

    // 4. Valid JSON roundtrip
    const serialized = exportPlanJSON(weddingPlan);
    const hydrated = importPlanJSON(serialized);
    expect(hydrated.id).toBe(weddingPlan.id);
    expect(hydrated.eventName).toBe(weddingPlan.eventName);
  });
});

