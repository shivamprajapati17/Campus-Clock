'use client';

import React from 'react';
import { cn, getInitials } from '@/lib/utils';
import type { UserRole } from '@/lib/types';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  role?: UserRole;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({
  className,
  name,
  role = 'student',
  size = 'md',
  ...props
}: AvatarProps) {
  const roleBg: Record<UserRole, string> = {
    management: 'bg-[#FF6B70] text-white',
    hod: 'bg-[#A78BFA] text-black',
    teacher: 'bg-[#42D1C3] text-black',
    student: 'bg-[#FFE66D] text-black',
  };

  const sizeStyles = {
    sm: 'w-7 h-7 text-xs border-2',
    md: 'w-10 h-10 text-sm border-2.5',
    lg: 'w-14 h-14 text-base border-3',
    xl: 'w-20 h-20 text-xl border-3',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center font-black rounded-full border-black nb-shadow-sm select-none shrink-0',
        roleBg[role] || 'bg-[#FFE66D] text-black',
        sizeStyles[size],
        className
      )}
      title={`${name} (${role})`}
      {...props}
    >
      {getInitials(name)}
    </div>
  );
}

