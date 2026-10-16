'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'primary' | 'secondary' | 'accent' | 'yellow' | 'blue' | 'orange' | 'outline' | UserRole;
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
    primary: 'bg-[#FF5D5D] text-white',
    secondary: 'bg-[#A78BFA] text-black',
    accent: 'bg-[#2DD4BF] text-black',
    yellow: 'bg-[#FFD93D] text-black',
    blue: 'bg-[#5CB8FF] text-black',
    orange: 'bg-[#FF8A5C] text-black',
    outline: 'bg-white text-black',
    // Roles
    management: 'bg-[#FF5D5D] text-white',
    hod: 'bg-[#A78BFA] text-black',
    teacher: 'bg-[#2DD4BF] text-black',
    student: 'bg-[#FFD93D] text-black',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 rounded-md',
    md: 'text-xs px-2.5 py-1 rounded-lg',
  };

  return (
    <span
      className={cn(
        'nb-badge inline-flex items-center gap-1 font-black uppercase tracking-wider',
        colorMap[color] || 'bg-[#FFD93D] text-black',
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

