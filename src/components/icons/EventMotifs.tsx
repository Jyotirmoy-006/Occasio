import React from 'react';

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

export function OrnamentalDivider({ className = 'w-full my-6' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-ink-muted/30 ${className}`} aria-hidden="true">
      <div className="h-px bg-border flex-1 max-w-[120px]" />
      <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="12" cy="6" r="3" />
        <path d="M4 6H9" />
        <path d="M15 6H20" />
      </svg>
      <div className="h-px bg-border flex-1 max-w-[120px]" />
    </div>
  );
}
