'use client';

import React from 'react';
import { formatEventDate } from '@/lib/format';
import { AlertTriangle } from 'lucide-react';

interface StepDateLocationProps {
  eventDate: string;
  setEventDate: (date: string) => void;
  city: string;
  setCity: (city: string) => void;
  guestCount: number;
  setGuestCount: React.Dispatch<React.SetStateAction<number>>;
  isShortLeadTime: boolean;
  todayStr: string;
  errors: Record<string, string>;
  onBlurDate: () => void;
  onBlurCity: () => void;
}

export function StepDateLocation({
  eventDate,
  setEventDate,
  city,
  setCity,
  guestCount,
  setGuestCount,
  isShortLeadTime,
  todayStr,
  errors,
  onBlurDate,
  onBlurCity,
}: StepDateLocationProps) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="field-event-date" className="block text-sm font-semibold text-ink mb-1">
          Event Date <span className="text-red-700">*</span>
        </label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            id="field-event-date"
            type="date"
            min={todayStr}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            onBlur={onBlurDate}
            aria-required="true"
            aria-invalid={!!errors.eventDate}
            aria-describedby={errors.eventDate ? 'err-event-date' : undefined}
            className="px-3.5 py-2.5 rounded-md border border-border text-sm bg-paper text-ink focus:border-[var(--color-accent)]"
          />
          {eventDate && (
            <span className="text-sm text-ink font-medium">
              {formatEventDate(eventDate, { includeRelative: true })}
            </span>
          )}
        </div>

        {errors.eventDate && (
          <p id="err-event-date" className="text-xs text-red-700 mt-1" role="alert">
            {errors.eventDate}
          </p>
        )}

        {/* Short Lead Time Warning Notice */}
        {isShortLeadTime && (
          <div className="mt-3 p-3 rounded-md bg-[#FEF3E2] border border-[#8A4500]/30 flex items-start gap-2.5 text-xs text-[#8A4500]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Short lead time:</strong> we’ll compress the timeline and prioritize urgent vendor bookings.
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Guest Count Stepper */}
        <div>
          <label htmlFor="field-guest-count" className="block text-sm font-semibold text-ink mb-1">
            Estimated Guest Count <span className="text-red-700">*</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setGuestCount((g) => Math.max(1, g - 10))}
              className="w-10 h-10 rounded-md border border-border bg-surface text-ink font-bold hover:bg-surface-raised cursor-pointer flex items-center justify-center"
              aria-label="Decrease guest count by 10"
            >
              -
            </button>
            <input
              id="field-guest-count"
              aria-label="Estimated Guest Count"
              type="number"
              min="1"
              max="5000"
              value={guestCount}
              onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24 text-center py-2 rounded-md border border-border text-sm tabular-nums bg-paper text-ink font-semibold"
            />
            <button
              type="button"
              onClick={() => setGuestCount((g) => Math.min(5000, g + 10))}
              className="w-10 h-10 rounded-md border border-border bg-surface text-ink font-bold hover:bg-surface-raised cursor-pointer flex items-center justify-center"
              aria-label="Increase guest count by 10"
            >
              +
            </button>
          </div>
        </div>

        {/* City/Region */}
        <div>
          <label htmlFor="field-city" className="block text-sm font-semibold text-ink mb-1">
            City / Region <span className="text-red-700">*</span>
          </label>
          <input
            id="field-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onBlur={onBlurCity}
            placeholder="e.g. Seattle, WA or London, UK"
            aria-required="true"
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? 'err-city' : undefined}
            className="w-full px-3.5 py-2.5 rounded-md border border-border text-sm bg-paper text-ink focus:border-[var(--color-accent)]"
          />
          {errors.city && (
            <p id="err-city" className="text-xs text-red-700 mt-1" role="alert">
              {errors.city}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

