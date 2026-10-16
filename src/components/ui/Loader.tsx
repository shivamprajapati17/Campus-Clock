'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

export interface LoaderProps {
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export function Loader({ text = 'Loading Campus Clock...', className, fullScreen = false }: LoaderProps) {
  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-6 text-center', className)}>
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-[#FFE66D] border-3 border-black nb-shadow flex items-center justify-center animate-bounce">
          <Clock className="w-8 h-8 text-black stroke-[2.5]" />
        </div>
      </div>
      <p className="text-sm font-black uppercase tracking-wider text-black">
        {text}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream/90">
        {content}
      </div>
    );
  }

  return content;
}

