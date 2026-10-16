'use client';

import React from 'react';
import { cn, getSubjectColor } from '@/lib/utils';
import type { TimetableEntry, Clash } from '@/lib/types';
import { ClashIndicator } from './ClashIndicator';
import { Lock, MapPin, UserCheck, GripVertical } from 'lucide-react';

export interface TimetableCellProps {
  day: number;
  slot: number;
  entry?: TimetableEntry;
  clash?: Clash;
  colorIndex?: number;
  editable?: boolean;
  onDragStart?: (e: React.DragEvent, entry: TimetableEntry) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, day: number, slot: number) => void;
  onClick?: (entry?: TimetableEntry) => void;
}

export function TimetableCell({
  day,
  slot,
  entry,
  clash,
  colorIndex = 0,
  editable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onClick,
}: TimetableCellProps) {
  const isClash = !!clash;
  const isPractical = entry?.entry_type === 'practical';

  if (!entry) {
    return (
      <div
        onDragOver={onDragOver}
        onDrop={(e) => onDrop?.(e, day, slot)}
        onClick={() => onClick?.()}
        className={cn(
          'min-h-[96px] h-full p-2 border-2 border-dashed border-black/30 rounded-xl flex flex-col items-center justify-center transition-all',
          editable && 'hover:bg-black/5 hover:border-black/60 cursor-pointer'
        )}
      >
        <span className="text-[11px] font-black uppercase text-black/30 tracking-wider">
          Empty Slot
        </span>
      </div>
    );
  }

  const bgColor = getSubjectColor(colorIndex);

  return (
    <div
      draggable={editable && !entry.is_locked}
      onDragStart={(e) => onDragStart?.(e, entry)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, day, slot)}
      onClick={() => onClick?.(entry)}
      style={{ backgroundColor: bgColor }}
      className={cn(
        'relative min-h-[96px] h-full p-2.5 rounded-xl border-3 border-black nb-shadow-sm flex flex-col justify-between transition-all select-none',
        editable && !entry.is_locked && 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md',
        isClash && 'border-4 border-[#FF5D5D] animate-pulse bg-red-100 shadow-[0_0_12px_rgba(255,93,93,0.7)]'
      )}
    >
      {/* Top Bar: Subject code + Clash/Lock */}
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-center gap-1">
          {editable && !entry.is_locked && (
            <GripVertical className="w-3.5 h-3.5 text-black/60 -ml-1 shrink-0" />
          )}
          <span className="font-black text-sm text-black tracking-tight leading-tight">
            {entry.subject?.code || 'N/A'}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {entry.is_locked && (
            <span title="Slot Locked" className="text-black">
              <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
            </span>
          )}
          {isClash && <ClashIndicator details={clash.details} />}
        </div>
      </div>

      {/* Middle: Subject Name */}
      <div className="my-1">
        <p className="text-[11px] font-bold text-black/85 line-clamp-1 leading-snug">
          {entry.subject?.name || 'Subject'}
        </p>
        {isPractical && (
          <span className="inline-block mt-0.5 text-[9px] font-black uppercase px-1.5 py-0.2 bg-black text-white rounded-md border border-white">
            Lab Practical
          </span>
        )}
      </div>

      {/* Bottom Bar: Faculty Initial & Room */}
      <div className="flex items-center justify-between text-[11px] font-black text-black pt-1 border-t-2 border-black/20">
        <div className="flex items-center gap-1" title={entry.faculty?.user?.name || 'Faculty'}>
          <UserCheck className="w-3 h-3 text-black/70 stroke-[2.5]" />
          <span>{entry.faculty?.initials || 'FAC'}</span>
        </div>
        <div className="flex items-center gap-1" title="Room">
          <MapPin className="w-3 h-3 text-black/70 stroke-[2.5]" />
          <span>{entry.room?.number || 'RM'}</span>
        </div>
      </div>
    </div>
  );
}

