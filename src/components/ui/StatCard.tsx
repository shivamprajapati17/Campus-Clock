'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = '#ffffff',
  className,
}: StatCardProps) {
  return (
    <Card
      color={color}
      className={cn('flex flex-col justify-between p-5 relative overflow-hidden', className)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-black uppercase tracking-wider text-black/70">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-xl border-2 border-black bg-white nb-shadow-sm text-black">
            {icon}
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl lg:text-4xl font-black text-black tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs font-bold text-black/60 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
}

