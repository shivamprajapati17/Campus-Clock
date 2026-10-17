'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps {
  /** Percentage 0–100. */
  value: number;
  label?: string;
  showValue?: boolean;
  color?: string;
  className?: string;
}

/**
 * Neo-Brutalist progress bar — pill shaped, thick outline and a hard-shadowed
 * track with a solid colour fill.
 */
export function Progress({
  value,
  label,
  showValue = false,
  color = '#BF360C',
  className,
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs font-black uppercase tracking-wider text-black">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-[11px] font-black text-black/70">
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
      <div
        className="nb-progress"
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <span style={{ width: `${clamped}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
