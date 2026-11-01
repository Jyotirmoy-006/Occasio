'use client';

import React from 'react';
import type { EventType } from '@/domain/schemas/plan';
import { WeddingMotif, BirthdayMotif, CommunityMotif } from '@/components/icons/EventMotifs';

interface StepEventDetailsProps {
  eventType: EventType;
  setEventType: (t: EventType) => void;
  eventName: string;
  setEventName: (name: string) => void;
  error?: string;
  onBlur: () => void;
}

const EVENT_TYPE_OPTIONS = [
  { type: 'wedding' as const, label: 'Wedding', motif: <WeddingMotif className="w-6 h-6" /> },
  { type: 'birthday' as const, label: 'Birthday', motif: <BirthdayMotif className="w-6 h-6" /> },
  { type: 'community' as const, label: 'Community', motif: <CommunityMotif className="w-6 h-6" /> },
];

export function StepEventDetails({
  eventType,
  setEventType,
  eventName,
  setEventName,
  error,
  onBlur,
}: StepEventDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block font-serif text-lg font-bold text-ink mb-1">
          Select Event Type <span className="text-red-700">*</span>
        </label>
        <p className="text-xs text-ink-muted mb-4">
          Sets domain categories, milestone timelines, and tailored checklist guides.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {EVENT_TYPE_OPTIONS.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => setEventType(item.type)}
              className={`p-4 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[110px] ${
                eventType === item.type
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] shadow-xs'
                  : 'border-border bg-paper hover:bg-surface'
              }`}
            >
              <span className={eventType === item.type ? 'text-[var(--color-accent)]' : 'text-ink-subtle'}>
                {item.motif}
              </span>
              <span className="font-serif text-base font-semibold text-ink">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="field-event-name" className="block text-sm font-semibold text-ink mb-1">
          Event Title / Name <span className="text-red-700">*</span>
        </label>
        <input
          id="field-event-name"
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          onBlur={onBlur}
          placeholder="e.g. Maya’s 30th Birthday or Harvest Festival 2027"
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? 'err-event-name' : undefined}
          className={`w-full px-3.5 py-2.5 rounded-md border text-sm bg-paper text-ink transition-colors ${
            error ? 'border-red-600 focus:ring-red-600' : 'border-border focus:border-[var(--color-accent)]'
          }`}
        />
        {error && (
          <p id="err-event-name" className="text-xs text-red-700 mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

