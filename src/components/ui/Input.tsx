'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-xs font-black uppercase tracking-wider text-black">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-black/70">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'nb-input',
              icon && 'pl-11',
              error && 'border-red-600 focus:border-red-600',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs font-bold text-[#BF360C] mt-0.5">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

