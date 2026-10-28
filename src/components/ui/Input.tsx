import React, { forwardRef, useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-ink">
          {label} {props.required && <span className="text-error" aria-hidden="true">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`w-full min-h-[44px] px-3.5 py-2 bg-paper border ${
            error ? 'border-error focus:ring-error' : 'border-border focus:border-[var(--color-accent)]'
          } rounded-md text-ink text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] disabled:bg-surface disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-xs text-ink-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs text-error font-medium flex items-center gap-1" role="alert">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0" aria-hidden="true">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
              <line x1="6" y1="3.5" x2="6" y2="6.5" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="6" cy="8.5" r="0.75" fill="currentColor" />
            </svg>
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

