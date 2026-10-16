'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  color?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, color, style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{ backgroundColor: color, ...style }}
        className={cn(
          'nb-card',
          hoverable && 'nb-card-hover cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

