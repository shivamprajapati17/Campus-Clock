'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps {
  /** Current on/off state. */
  checked: boolean;
  /** Called with the next value when the user toggles. */
  onChange: (checked: boolean) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/**
 * Neo-Brutalist toggle switch — thick black outline, hard offset shadow,
 * turquoise active track with a butter-yellow knob.
 */
export function Toggle({
  checked,
  onChange,
  label,
  hint,
  disabled = false,
  className,
  id,
}: ToggleProps) {
  const autoId = React.useId();
  const toggleId = id || autoId;

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {(label || hint) && (
        <div className="text-left">
          {label && (
            <label
              htmlFor={toggleId}
              className="block text-xs font-black uppercase tracking-wider text-black cursor-pointer"
            >
              {label}
            </label>
          )}
          {hint && (
            <span className="block text-[11px] font-semibold text-black/60">
              {hint}
            </span>
          )}
        </div>
      )}
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        data-on={checked}
        onClick={() => onChange(!checked)}
        className="nb-toggle"
      />
    </div>
  );
}

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

/** Neo-Brutalist checkbox — square, thick outline, yellow check fill. */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const autoId = React.useId();
    const boxId = id || autoId;

    const box = (
      <input
        id={boxId}
        ref={ref}
        type="checkbox"
        className={cn('nb-checkbox', className)}
        {...props}
      />
    );

    if (!label) return box;

    return (
      <label
        htmlFor={boxId}
        className="inline-flex items-center gap-2 cursor-pointer select-none"
      >
        {box}
        <span className="text-xs font-bold text-black/80">{label}</span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
