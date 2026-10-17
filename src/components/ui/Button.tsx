'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'warning' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'warning',
      size = 'md',
      loading = false,
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary: 'bg-[#2E7D32] text-white hover:bg-[#1B5E20]',
      secondary: 'bg-[#80CBC4] text-[#1B2E1F] hover:bg-[#4DB6AC]',
      accent: 'bg-[#4DB6AC] text-[#1B2E1F] hover:bg-[#26A69A]',
      warning: 'bg-[#FFD54F] text-[#1B2E1F] hover:bg-[#FBC02D]',
      outline: 'bg-white text-[#1B2E1F] hover:bg-[#F1F8E9]',
      ghost: 'bg-transparent text-[#1B2E1F] border-none shadow-none hover:bg-black/5',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs rounded-lg',
      md: 'px-4 py-2.5 text-sm rounded-xl',
      lg: 'px-6 py-3.5 text-base rounded-2xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'nb-btn flex items-center justify-center gap-2 font-black transition-all select-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          icon && <span className="inline-flex shrink-0">{icon}</span>
        )}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';

