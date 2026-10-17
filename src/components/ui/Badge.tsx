'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'warning'
    | 'yellow'
    | 'blue'
    | 'orange'
    | 'outline'
    | UserRole;
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  color = 'yellow',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const colorMap: Record<string, string> = {
    primary: 'bg-[#2E7D32] text-white',
    secondary: 'bg-[#80CBC4] text-[#1B2E1F]',
    accent: 'bg-[#4DB6AC] text-[#1B2E1F]',
    warning: 'bg-[#FFD54F] text-[#1B2E1F]',
    yellow: 'bg-[#FFD54F] text-[#1B2E1F]',
    blue: 'bg-[#4DB6AC] text-[#1B2E1F]',
    orange: 'bg-[#A5D6A7] text-[#1B2E1F]',
    outline: 'bg-white text-[#1B2E1F]',
    // Role badges — Management deep green, HOD teal, Teacher lime, Student yellow.
    management: 'bg-[#1B5E20] text-white',
    hod: 'bg-[#00796B] text-white',
    teacher: 'bg-[#7CB342] text-[#1B2E1F]',
    student: 'bg-[#FBC02D] text-[#1B2E1F]',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 rounded-md',
    md: 'text-xs px-2.5 py-1 rounded-lg',
  };

  return (
    <span
      className={cn(
        'nb-badge inline-flex items-center gap-1 font-black uppercase tracking-wider',
        colorMap[color] || 'bg-[#FFD54F] text-black',
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

