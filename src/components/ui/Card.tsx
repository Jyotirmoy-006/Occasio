import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export function Card({ as: Component = 'div', className = '', children, ...props }: CardProps) {
  return (
    <Component
      className={`bg-[var(--color-card,#FFFDF8)] border border-[var(--color-border)] rounded-xl p-5 sm:p-6 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_4px_14px_rgba(28,25,23,0.03)] transition-shadow ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`mb-4 pb-3 border-b border-border/60 ${className}`}>{children}</div>;
}

export function CardTitle({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={`text-lg font-serif text-ink tracking-tight ${className}`}>{children}</h3>;
}

