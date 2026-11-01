'use client';

import type { Plan } from '@/domain/schemas/plan';
import type { VendorStatus } from '@/lib/constants';
import { parseInputToMinorUnits } from '@/domain/budget/format';
import { exportChecklistCsv } from '@/domain/export/csv';

export function useChecklistActions(
  plan: Plan,
  updatePlan: (updater: (prev: Plan) => Plan) => void,
) {
  const { checklist, currency } = plan;

  const handleStatusChange = (itemId: string, newStatus: VendorStatus) => {
    updatePlan((prev) => ({
      ...prev,
      checklist: {
        items: prev.checklist.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: newStatus,
                contactedAt: newStatus === 'contacted' ? new Date().toISOString() : item.contactedAt,
                bookedAt: newStatus === 'booked' ? new Date().toISOString() : item.bookedAt,
              }
            : item,
        ),
      },
    }));
  };

  const handleQuoteUpdate = (itemId: string, valueString: string) => {
    const parsed = parseInputToMinorUnits(valueString, currency);
    updatePlan((prev) => {
      const updatedItems = prev.checklist.items.map((i) =>
        i.id === itemId ? { ...i, quoteMinorUnits: parsed } : i,
      );

      const targetVendor = prev.checklist.items.find((i) => i.id === itemId);
      let updatedBudget = prev.budget;
      if (targetVendor && parsed !== null) {
        updatedBudget = {
          ...prev.budget,
          categories: prev.budget.categories.map((c) =>
            c.id === targetVendor.category || c.label.toLowerCase().includes(targetVendor.category.toLowerCase())
              ? { ...c, actualMinorUnits: parsed }
              : c,
          ),
        };
      }

      return {
        ...prev,
        checklist: { items: updatedItems },
        budget: updatedBudget,
      };
    });
  };

  const handleNotesUpdate = (itemId: string, notes: string) => {
    updatePlan((prev) => ({
      ...prev,
      checklist: {
        items: prev.checklist.items.map((item) =>
          item.id === itemId ? { ...item, notes } : item,
        ),
      },
    }));
  };

  const handleDownloadCsv = () => {
    const csv = exportChecklistCsv(checklist, currency);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.eventName.toLowerCase().replace(/\s+/g, '-')}-vendor-checklist.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    handleStatusChange,
    handleQuoteUpdate,
    handleNotesUpdate,
    handleDownloadCsv,
  };
}
