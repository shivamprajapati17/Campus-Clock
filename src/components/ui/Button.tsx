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
      primary: 'bg-[#FF6B70] text-white hover:bg-[#FF5459]',
      secondary: 'bg-[#A78BFA] text-black hover:bg-[#9370F2]',
      accent: 'bg-[#42D1C3] text-black hover:bg-[#2FBFB2]',
      warning: 'bg-[#FFE66D] text-black hover:bg-[#F2D94A]',
      outline: 'bg-white text-black hover:bg-[#FFF5EB]',
      ghost: 'bg-transparent text-black border-none shadow-none hover:bg-black/5',
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

