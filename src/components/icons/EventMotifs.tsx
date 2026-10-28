import React from 'react';
import type { EventType } from '@/domain/schemas/plan';

/** Hand-crafted editorial SVGs for event type motifs and decorative dividers. */

export function WeddingMotif({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Intertwined elegant botanical rings */}
      <circle cx="20" cy="24" r="11" />
      <circle cx="28" cy="24" r="11" />
      {/* Delicate botanical sprig */}
      <path d="M12 36C14 33 16 31 20 30" />
      <path d="M14 31C15 29 17 29 18 31" />
      <path d="M36 12C34 15 32 17 28 18" />
      <path d="M34 17C33 19 31 19 30 17" />
    </svg>
  );
}

export function BirthdayMotif({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Refined celebration geometric motif & candle flame */}
      <path d="M24 8C24 8 26 12 26 14C26 15.1 25.1 16 24 16C22.9 16 22 15.1 22 14C22 12 24 8 24 8Z" />
      <path d="M24 16V22" />
      <rect x="14" y="22" width="20" height="18" rx="2" />
      <path d="M14 30H34" />
      <path d="M24 22V40" />
      {/* Starburst rays */}
      <line x1="8" y1="14" x2="12" y2="16" />
      <line x1="40" y1="14" x2="36" y2="16" />
      <line x1="10" y1="26" x2="6" y2="28" />
      <line x1="38" y1="26" x2="42" y2="28" />
    </svg>
  );
}

export function CommunityMotif({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Interlinked community circles unity motif */}
      <circle cx="24" cy="16" r="6" />
      <circle cx="16" cy="30" r="6" />
      <circle cx="32" cy="30" r="6" />
      <path d="M20 20L18 25" />
      <path d="M28 20L30 25" />
      <path d="M22 30H26" />
    </svg>
  );
}

/**
 * Editorial SVG hairline ornament per event type.
 * Replaces the stray "-o-" divider with genuine typographic flourishes.
 */
export function OrnamentalDivider({
  eventType = 'wedding',
  className = 'w-full my-6',
}: {
  eventType?: EventType;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-4 text-ink-muted/40 ${className}`}
      aria-hidden="true"
    >
      <div className="h-px bg-border flex-1 max-w-[140px]" />

      {eventType === 'wedding' && (
        <svg width="40" height="14" viewBox="0 0 40 14" fill="none" stroke="currentColor" strokeWidth="1">
          {/* Delicate botanical sprig flourish */}
          <path d="M20 12C20 8 16 4 12 3C15 6 16 9 16 12" />
          <path d="M20 12C20 8 24 4 28 3C25 6 24 9 24 12" />
          <circle cx="20" cy="4" r="1.5" fill="currentColor" />
        </svg>
      )}

      {eventType === 'birthday' && (
        <svg width="40" height="14" viewBox="0 0 40 14" fill="none" stroke="currentColor" strokeWidth="1">
          {/* Festive geometric diamond flourish */}
          <polygon points="20,1 23,7 20,13 17,7" strokeWidth="1" />
          <line x1="8" y1="7" x2="14" y2="7" />
          <line x1="26" y1="7" x2="32" y2="7" />
          <circle cx="11" cy="7" r="1" fill="currentColor" />
          <circle cx="29" cy="7" r="1" fill="currentColor" />
        </svg>
      )}

      {eventType === 'community' && (
        <svg width="40" height="14" viewBox="0 0 40 14" fill="none" stroke="currentColor" strokeWidth="1">
          {/* Linked civic nodes flourish */}
          <circle cx="15" cy="7" r="3" />
          <circle cx="25" cy="7" r="3" />
          <path d="M18 7H22" strokeWidth="1.2" />
          <path d="M7 7H12" strokeWidth="1" />
          <path d="M28 7H33" strokeWidth="1" />
        </svg>
      )}

      <div className="h-px bg-border flex-1 max-w-[140px]" />
    </div>
  );
}
