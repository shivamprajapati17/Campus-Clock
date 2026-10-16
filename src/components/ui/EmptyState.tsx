'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';
import { Button } from './Button';
import { CalendarX } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionText,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn('flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-8', className)}>
      <div className="w-16 h-16 rounded-2xl bg-[#FFD93D] border-3 border-black nb-shadow flex items-center justify-center mb-4 text-black">
        {icon || <CalendarX className="w-8 h-8 stroke-[2.5]" />}
      </div>
      <h4 className="text-lg font-black uppercase tracking-tight text-black mb-1">
        {title}
      </h4>
      <p className="text-sm font-semibold text-black/70 mb-5">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="warning" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Card>
  );
}

