'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2 pb-1 border-b-3 border-black', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-4 py-2 font-black text-sm rounded-t-xl border-3 border-black border-b-0 transition-all cursor-pointer flex items-center gap-2 select-none -mb-[3px]',
              isActive
                ? 'bg-[#FFD54F] text-black shadow-[3px_-3px_0_#000] translate-y-[-2px]'
                : 'bg-white text-black/70 hover:bg-[#F1F8E9] hover:text-black'
            )}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={cn(
                  'px-1.5 py-0.2 text-xs rounded-full border border-black font-extrabold',
                  isActive ? 'bg-white text-black' : 'bg-black text-white'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

