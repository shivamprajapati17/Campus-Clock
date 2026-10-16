'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface InstitutionLogosProps {
  /** Plaque scale. */
  size?: 'sm' | 'md' | 'lg';
  /** Draw the neo-brutalist border + hard shadow. */
  framed?: boolean;
  className?: string;
}

const SIZE_STYLES = {
  sm: { box: 'w-9 h-9 p-0.5 rounded-lg', px: 36 },
  md: { box: 'w-12 h-12 p-1 rounded-xl', px: 48 },
  lg: { box: 'w-24 h-24 p-2 rounded-2xl', px: 96 },
} as const;

const LOGOS = [
  { src: '/rahul.png', alt: 'Rahul Education logo' },
  { src: '/lr.jpg', alt: 'Engineered for Excellence — institution emblem' },
] as const;

/**
 * The two institution marks rendered as consistent neo-brutalist plaques.
 * Used in the landing header/footer, the login screen and the dashboard shell.
 */
export function InstitutionLogos({
  size = 'md',
  framed = true,
  className,
}: InstitutionLogosProps) {
  const s = SIZE_STYLES[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {LOGOS.map((logo) => (
        <span
          key={logo.src}
          className={cn(
            'inline-flex items-center justify-center bg-white shrink-0',
            framed ? 'border-2 border-black nb-shadow-sm' : '',
            s.box
          )}
        >
          <Image
            src={logo.src}
            alt={logo.alt}
            width={s.px}
            height={s.px}
            unoptimized
            className="w-full h-full object-contain"
          />
        </span>
      ))}
    </div>
  );
}
