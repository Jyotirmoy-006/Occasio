import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export function Card({ as: Component = 'div', className = '', children, ...props }: CardProps) {
  return (
    <Component
      className={`bg-paper border border-border rounded-lg p-5 sm:p-6 transition-shadow ${className}`}
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

