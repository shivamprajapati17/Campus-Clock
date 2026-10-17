'use client';

import React, { useState } from 'react';
import {
  DAYS,
  SLOTS,
  type TimetableBreak,
  type TimetableEntry,
  type Clash,
} from '@/lib/types';
import { TimetableCell } from './TimetableCell';
import { Coffee } from 'lucide-react';

export interface TimetableGridProps {
  entries: TimetableEntry[];
  clashes?: Clash[];
  breaks?: TimetableBreak[];
  editable?: boolean;
  onEntrySwap?: (fromEntryId: string, toDay: number, toSlot: number) => void;
  onCellClick?: (entry?: TimetableEntry, day?: number, slot?: number) => void;
  title?: string;
  subtitle?: string;
}

const DAY_TINTS = ['#C8E6C9', '#B2DFDB', '#DCEDC8', '#A5D6A7', '#FFD54F'];

export function TimetableGrid({
  entries,
  clashes = [],
  breaks = [],
  editable = false,
  onEntrySwap,
  onCellClick,
  title,
  subtitle,
}: TimetableGridProps) {
  const [draggedEntry, setDraggedEntry] = useState<TimetableEntry | null>(null);

  // Map entries for quick lookup: [day][slot] => TimetableEntry[]. Two batches
  // can share a period, so a cell is a list, never a single entry.
  const entryMap: Record<number, Record<number, TimetableEntry[]>> = {};
  for (let d = 1; d <= 5; d += 1) entryMap[d] = {};

  entries.forEach((e) => {
    if (e.day >= 1 && e.day <= 5 && e.slot >= 1 && e.slot <= 8) {
      (entryMap[e.day][e.slot] ??= []).push(e);
    }
  });

  const breakMap: Record<number, Record<number, boolean>> = {};
  for (let d = 1; d <= 5; d += 1) breakMap[d] = {};
  breaks.forEach((b) => {
    if (b.day >= 1 && b.day <= 5 && b.slot >= 1 && b.slot <= 8) {
      breakMap[b.day][b.slot] = true;
    }
  });

  // Map clashes for quick lookup: [day][slot] => Clash
  const clashMap: Record<number, Record<number, Clash>> = {};
  for (let d = 1; d <= 5; d += 1) clashMap[d] = {};
  clashes.forEach((c) => {
    if (c.day >= 1 && c.day <= 5 && c.slot >= 1 && c.slot <= 8) {
      clashMap[c.day][c.slot] = c;
    }
  });

  const handleDragStart = (e: React.DragEvent, entry: TimetableEntry) => {
    if (!editable || entry.is_locked) return;
    setDraggedEntry(entry);
    e.dataTransfer.setData('text/plain', entry.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!editable) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, day: number, slot: number) => {
    if (!editable) return;
    e.preventDefault();
    if (draggedEntry && onEntrySwap) {
      onEntrySwap(draggedEntry.id, day, slot);
    }
    setDraggedEntry(null);
  };

  const dayNumbers = [1, 2, 3, 4, 5];
  const slotNumbers = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="w-full bg-[var(--surface)] rounded-2xl border-3 border-[var(--ink)] nb-shadow p-3 md:p-6 overflow-hidden">
      {(title || subtitle) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-5 pb-4 border-b-3 border-[var(--ink)]">
          <div>
            {title && (
              <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight text-[var(--ink)]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs md:text-sm font-bold text-[var(--ink)]/70 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {editable && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 border-[var(--ink)] bg-[var(--accent-2)] text-[11px] font-black nb-shadow-sm">
              <span>🌱 Click a cell to plant a class · drag to swap</span>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto pb-3">
        <table className="w-full border-collapse min-w-[980px] table-fixed">
          <thead>
            <tr>
              <th className="w-24 p-2 text-center bg-[var(--accent-2)] border-3 border-[var(--ink)] text-[11px] font-black uppercase tracking-wider text-[var(--ink)] rounded-tl-xl">
                Time
              </th>
              {dayNumbers.map((d, idx) => (
                <th
                  key={d}
                  className={`p-2.5 text-center border-3 border-[var(--ink)] text-[11px] md:text-sm font-black uppercase tracking-wider text-[var(--ink)] ${
                    idx === dayNumbers.length - 1 ? 'rounded-tr-xl' : ''
                  }`}
                  style={{ backgroundColor: DAY_TINTS[idx] }}
                >
                  {DAYS[d]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slotNumbers.map((slotNum) => {
              const slotInfo = SLOTS[slotNum];

              return (
                <tr key={slotNum} className="border-b-2 border-[var(--ink)]">
                  <td className="p-1.5 border-3 border-[var(--ink)] bg-[var(--bg-soft)] text-center align-middle">
                    <div className="font-black text-[11px] text-[var(--ink)] uppercase">
                      P{slotNum}
                    </div>
                    <div className="text-[10px] font-bold text-[var(--ink)]/60 mt-0.5 whitespace-nowrap">
                      {slotInfo?.start}–{slotInfo?.end}
                    </div>
                  </td>

                  {dayNumbers.map((dayNum) => {
                    const isBreak = breakMap[dayNum]?.[slotNum];
                    const cellEntries = entryMap[dayNum]?.[slotNum] ?? [];

                    if (isBreak) {
                      return (
                        <td
                          key={`${dayNum}-${slotNum}`}
                          className="p-1.5 border-3 border-[var(--ink)] align-middle bg-[var(--accent-2)]/55"
                        >
                          <div className="min-h-[88px] h-full rounded-lg border-2 border-dashed border-[var(--ink)]/35 bg-[var(--accent-2)]/70 flex flex-col items-center justify-center gap-1 select-none">
                            <Coffee className="w-4 h-4 text-[var(--ink)]/70" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--ink)]">
                              Break
                            </span>
                            <span className="text-[9px] font-bold text-[var(--ink)]/60">
                              {slotInfo?.start}–{slotInfo?.end}
                            </span>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={`${dayNum}-${slotNum}`}
                        className="p-1 border-3 border-[var(--ink)] align-top bg-[var(--surface)]"
                      >
                        <TimetableCell
                          day={dayNum}
                          slot={slotNum}
                          entries={cellEntries}
                          clash={clashMap[dayNum]?.[slotNum]}
                          editable={editable}
                          onDragStart={handleDragStart}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={() => {
                            const first = cellEntries[0];
                            onCellClick?.(first, dayNum, slotNum);
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
