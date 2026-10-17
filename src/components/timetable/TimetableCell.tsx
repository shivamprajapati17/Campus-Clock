'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { TimetableEntry, Clash } from '@/lib/types';
import { ClashIndicator } from './ClashIndicator';
import { Lock, MapPin, UserCheck, GripVertical } from 'lucide-react';

export interface TimetableCellProps {
  day: number;
  slot: number;
  entries?: TimetableEntry[];
  clash?: Clash;
  editable?: boolean;
  onDragStart?: (e: React.DragEvent, entry: TimetableEntry) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, day: number, slot: number) => void;
  onClick?: (entry?: TimetableEntry) => void;
}

/** Lecture = light leaf, lab = teal, tutorial = sunlit yellow. */
function entryTint(entry: TimetableEntry): string {
  if (entry.entry_type === 'practical') return 'var(--lab-tint)';
  if (entry.entry_type === 'tutorial') return 'var(--tutorial-tint)';
  return 'var(--lecture-tint)';
}

function EntryCard({
  entry,
  editable,
  onDragStart,
  onDragOver,
  onDrop,
  day,
  slot,
  onClick,
}: {
  entry: TimetableEntry;
  editable: boolean;
  day: number;
  slot: number;
  onDragStart?: TimetableCellProps['onDragStart'];
  onDragOver?: TimetableCellProps['onDragOver'];
  onDrop?: TimetableCellProps['onDrop'];
  onClick?: TimetableCellProps['onClick'];
}) {
  return (
    <div
      draggable={editable && !entry.is_locked}
      onDragStart={(e) => onDragStart?.(e, entry)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, day, slot)}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(entry);
      }}
      style={{ backgroundColor: entryTint(entry) }}
      className={cn(
        'relative h-full min-h-[52px] p-1.5 rounded-lg border-2 border-[var(--ink)] flex flex-col justify-between gap-1 transition-all select-none',
        editable && !entry.is_locked && 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5'
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-center gap-0.5 min-w-0">
          {editable && !entry.is_locked && (
            <GripVertical className="w-3 h-3 text-[var(--ink)]/60 -ml-0.5 shrink-0" />
          )}
          <span className="font-black text-[11px] text-[var(--ink)] tracking-tight leading-tight truncate">
            {entry.subject?.code || 'N/A'}
            {entry.batch ? ` · ${entry.batch}` : ''}
          </span>
        </div>
        {entry.is_locked && (
          <span title="Slot Locked" className="text-[var(--ink)] shrink-0">
            <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
          </span>
        )}
      </div>

      <p
        className="text-[10px] font-bold text-[var(--ink)]/85 line-clamp-1 leading-snug"
        title={entry.subject?.name}
      >
        {entry.subject?.name || 'Subject'}
      </p>

      <div className="flex items-center justify-between gap-1 text-[10px] font-black text-[var(--ink)] pt-0.5 border-t border-[var(--ink)]/20">
        <span
          className="inline-flex items-center gap-0.5 truncate"
          title={entry.faculty?.user?.name || 'Faculty'}
        >
          <UserCheck className="w-2.5 h-2.5 stroke-[2.5] shrink-0" />
          {entry.faculty?.initials || 'FAC'}
        </span>
        <span className="inline-flex items-center gap-0.5 shrink-0" title="Room">
          <MapPin className="w-2.5 h-2.5 stroke-[2.5]" />
          {entry.room?.number || 'RM'}
        </span>
      </div>
    </div>
  );
}

export function TimetableCell({
  day,
  slot,
  entries = [],
  clash,
  editable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onClick,
}: TimetableCellProps) {
  if (entries.length === 0) {
    return (
      <div
        onDragOver={onDragOver}
        onDrop={(e) => onDrop?.(e, day, slot)}
        onClick={() => onClick?.()}
        className={cn(
          'min-h-[88px] h-full p-2 rounded-lg border-2 border-dashed border-[var(--ink)]/25 flex flex-col items-center justify-center transition-all',
          editable && 'hover:bg-[var(--primary)]/5 hover:border-[var(--primary)]/60 cursor-pointer'
        )}
      >
        <span className="text-[10px] font-black uppercase text-[var(--ink)]/30 tracking-wider">
          Free
        </span>
      </div>
    );
  }

  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, day, slot)}
      className={cn(
        'min-h-[88px] h-full p-1 rounded-lg flex flex-col gap-1',
        clash && 'bg-[var(--danger-tint)] ring-2 ring-[var(--danger)]'
      )}
    >
      {clash && (
        <div className="flex items-center justify-between gap-1 px-1 pt-0.5">
          <span className="text-[9px] font-black uppercase text-[var(--danger)]">Clash</span>
          <ClashIndicator details={clash.details} />
        </div>
      )}
      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          editable={editable}
          day={day}
          slot={slot}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={onClick}
        />
      ))}
    </div>
  );
}

