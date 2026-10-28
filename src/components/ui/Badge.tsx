import React from 'react';

export interface BadgeProps {
  variant?: 'neutral' | 'success' | 'warning' | 'error' | 'accent';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', icon, children, className = '' }: BadgeProps) {
  const styles = {
    neutral: 'bg-surface text-ink-muted border-border',
    success: 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[#B7E4C7]',
    warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[#FCD34D]',
    error: 'bg-[var(--color-error-bg)] text-[var(--color-error)] border-[#FCA5A5]',
    accent: 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-[var(--color-accent)]/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

