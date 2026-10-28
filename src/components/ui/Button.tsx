import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, className = '', children, disabled, ...props }, ref) => {
    const baseStyle =
      'inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 min-h-[36px] rounded',
      md: 'text-sm px-4 py-2 min-h-[44px] rounded-md', // touch target 44px
      lg: 'text-base px-6 py-3 min-h-[48px] rounded-md',
    };

    const variantStyles = {
      primary: 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[#FAF7F2] shadow-sm',
      secondary: 'bg-transparent border border-border hover:bg-surface text-ink',
      ghost: 'bg-transparent hover:bg-surface text-ink',
      danger: 'bg-error hover:bg-red-800 text-white shadow-sm',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

