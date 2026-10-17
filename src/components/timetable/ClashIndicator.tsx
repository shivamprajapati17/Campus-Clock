'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ClashIndicatorProps {
  details: string;
}

export function ClashIndicator({ details }: ClashIndicatorProps) {
  return (
    <div className="relative group inline-block">
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#BF360C] border-2 border-black text-white text-xs font-black animate-pulse cursor-help">
        !
      </span>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-50 pointer-events-none w-48">
        <div className="bg-black text-white text-xs font-bold rounded-lg px-2.5 py-1.5 border-2 border-white shadow-lg text-center leading-tight">
          <div className="flex items-center justify-center gap-1 text-[#FFD54F] font-black text-[11px] mb-0.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>CLASH DETECTED</span>
          </div>
          {details}
        </div>
        <div className="w-2 h-2 bg-black border-r-2 border-b-2 border-white rotate-45 -mt-1"></div>
      </div>
    </div>
  );
}

