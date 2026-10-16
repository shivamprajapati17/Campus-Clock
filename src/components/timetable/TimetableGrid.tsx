'use client';

import React, { useState } from 'react';
import { DAYS, SLOTS, type TimetableEntry, type Clash } from '@/lib/types';
import { TimetableCell } from './TimetableCell';
import { Coffee } from 'lucide-react';

export interface TimetableGridProps {
  entries: TimetableEntry[];
  clashes?: Clash[];
  editable?: boolean;
  onEntrySwap?: (fromEntryId: string, toDay: number, toSlot: number) => void;
  onCellClick?: (entry?: TimetableEntry, day?: number, slot?: number) => void;
  title?: string;
  subtitle?: string;
}

export function TimetableGrid({
  entries,
  clashes = [],
  editable = false,
  onEntrySwap,
  onCellClick,
  title,
  subtitle,
}: TimetableGridProps) {
  const [draggedEntry, setDraggedEntry] = useState<TimetableEntry | null>(null);

  // Map entries for quick lookup: [day][slot] => TimetableEntry
  const entryMap: Record<number, Record<number, TimetableEntry>> = {};
  for (let d = 1; d <= 5; d++) entryMap[d] = {};

  // Build subject color index map for consistent coloring
  const subjectColorMap: Record<string, number> = {};
  let colorCounter = 0;

  entries.forEach((e) => {
    if (e.day >= 1 && e.day <= 5 && e.slot >= 1 && e.slot <= 7) {
      entryMap[e.day][e.slot] = e;
      if (e.subject_id && subjectColorMap[e.subject_id] === undefined) {
        subjectColorMap[e.subject_id] = colorCounter++;
      }
    }
  });

  // Map clashes for quick lookup: [day][slot] => Clash
  const clashMap: Record<number, Record<number, Clash>> = {};
  for (let d = 1; d <= 5; d++) clashMap[d] = {};
  clashes.forEach((c) => {
    if (c.day >= 1 && c.day <= 5 && c.slot >= 1 && c.slot <= 7) {
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
  const slotNumbers = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="w-full bg-white rounded-2xl border-3 border-black nb-shadow p-4 md:p-6 overflow-hidden">
      {/* Header section */}
      {(title || subtitle) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 pb-4 border-b-3 border-black">
          <div>
            {title && (
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-black">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs md:text-sm font-bold text-black/70 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {editable && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 border-black bg-[#FFD93D] text-xs font-black nb-shadow-sm">
              <span>⚡ Drag cells to swap slots</span>
            </div>
          )}
        </div>
      )}

      {/* Grid container with horizontal scroll for responsiveness */}
      <div className="overflow-x-auto pb-3">
        <table className="w-full border-collapse min-w-[760px] table-fixed">
          <thead>
            <tr>
              <th className="w-24 p-2 text-center bg-[#FFD93D] border-3 border-black text-xs font-black uppercase tracking-wider text-black rounded-tl-xl">
                Time / Slot
              </th>
              {dayNumbers.map((d, idx) => (
                <th
                  key={d}
                  className={`p-3 text-center border-3 border-black text-xs md:text-sm font-black uppercase tracking-wider text-black ${
                    idx === dayNumbers.length - 1 ? 'rounded-tr-xl' : ''
                  }`}
                  style={{
                    backgroundColor:
                      d === 1
                        ? '#5CB8FF'
                        : d === 2
                        ? '#A78BFA'
                        : d === 3
                        ? '#2DD4BF'
                        : d === 4
                        ? '#FF8A5C'
                        : '#FFD93D',
                  }}
                >
                  {DAYS[d]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slotNumbers.map((slotNum) => {
              const slotInfo = SLOTS[slotNum];
              const isBreakAfter = slotNum === 4; // Lunch break between slot 4 and 5

              return (
                <React.Fragment key={slotNum}>
                  <tr className="border-b-2 border-black">
                    {/* Time Slot column */}
                    <td className="p-2 border-3 border-black bg-[#FFFBEB] text-center align-middle">
                      <div className="font-black text-xs text-black uppercase">
                        Slot {slotNum}
                      </div>
                      <div className="text-[10px] font-bold text-black/60 mt-0.5 whitespace-nowrap">
                        {slotInfo?.start} - {slotInfo?.end}
                      </div>
                    </td>

                    {/* 5 Day Cells */}
                    {dayNumbers.map((dayNum) => {
                      const entry = entryMap[dayNum]?.[slotNum];
                      const clash = clashMap[dayNum]?.[slotNum];
                      const colorIdx = entry?.subject_id
                        ? subjectColorMap[entry.subject_id] ?? 0
                        : 0;

                      return (
                        <td
                          key={`${dayNum}-${slotNum}`}
                          className="p-1.5 border-3 border-black align-top bg-white"
                        >
                          <TimetableCell
                            day={dayNum}
                            slot={slotNum}
                            entry={entry}
                            clash={clash}
                            colorIndex={colorIdx}
                            editable={editable}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => onCellClick?.(entry, dayNum, slotNum)}
                          />
                        </td>
                      );
                    })}
                  </tr>

                  {/* Lunch Break Row */}
                  {isBreakAfter && (
                    <tr key={`break-${slotNum}`} className="border-3 border-black">
                      <td
                        colSpan={6}
                        className="p-2.5 break-pattern text-center border-3 border-black select-none"
                      >
                        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-xl bg-black text-[#FFD93D] font-black text-xs tracking-widest uppercase border-2 border-white shadow-md">
                          <Coffee className="w-4 h-4 stroke-[2.5]" />
                          <span>LUNCH BREAK • 01:00 PM – 01:30 PM (FREE PERIOD)</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

