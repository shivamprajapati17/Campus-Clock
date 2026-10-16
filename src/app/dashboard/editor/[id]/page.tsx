'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  MOCK_TIMETABLES,
  MOCK_ENTRIES_SE_A,
  MOCK_SUBJECTS,
  MOCK_FACULTY,
  MOCK_ROOMS,
} from '@/lib/data/mockData';
import { validateTimetable } from '@/lib/generator/validator';
import type { TimetableEntry, Clash } from '@/lib/types';
import {
  Save,
  Send,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const timetableId = resolvedParams.id;

  const timetable =
    MOCK_TIMETABLES.find((t) => t.id === timetableId) || MOCK_TIMETABLES[0];

  const [entries, setEntries] = useState<TimetableEntry[]>(() => {
    return timetable.entries?.length ? [...timetable.entries] : [...MOCK_ENTRIES_SE_A];
  });

  const [clashes, setClashes] = useState<Clash[]>([]);
  const [history, setHistory] = useState<TimetableEntry[][]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Validate on entry change
  const handleEntrySwap = (fromEntryId: string, toDay: number, toSlot: number) => {
    setEntries((prev) => {
      // Record undo history
      setHistory((h) => [...h, prev]);

      const sourceIndex = prev.findIndex((e) => e.id === fromEntryId);
      if (sourceIndex === -1) return prev;

      const sourceEntry = prev[sourceIndex];
      const targetIndex = prev.findIndex((e) => e.day === toDay && e.slot === toSlot);

      const next = [...prev];

      if (targetIndex !== -1) {
        // Swap slots between source and target
        const targetEntry = prev[targetIndex];
        if (targetEntry.is_locked) return prev; // Cannot move locked target

        next[sourceIndex] = {
          ...sourceEntry,
          day: toDay as 1 | 2 | 3 | 4 | 5,
          slot: toSlot as 1 | 2 | 3 | 4 | 5 | 6 | 7,
        };
        next[targetIndex] = {
          ...targetEntry,
          day: sourceEntry.day,
          slot: sourceEntry.slot,
        };
      } else {
        // Move source to empty slot
        next[sourceIndex] = {
          ...sourceEntry,
          day: toDay as 1 | 2 | 3 | 4 | 5,
          slot: toSlot as 1 | 2 | 3 | 4 | 5 | 6 | 7,
        };
      }

      // Check clashes
      const detectedClashes = validateTimetable(next);
      setClashes(detectedClashes);
      return next;
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((h) => h.slice(0, h.length - 1));
    setEntries(previous);
    setClashes(validateTimetable(previous));
  };

  const handleToggleLock = (entryId: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, is_locked: !e.is_locked } : e))
    );
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handlePublish = () => {
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    router.push(`/dashboard/timetable/${timetable.id}`);
  };

  return (
    <ProtectedRoute roles={['hod', 'management']}>
      <div className="space-y-6">
        {/* Editor Top Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b-3 border-black">
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/timetable/${timetable.id}`}
              className="p-2 rounded-xl border-2 border-black bg-white hover:bg-[#FDF6EC] nb-shadow-sm text-black"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
                  Drag & Drop Timetable Editor
                </h1>
                <Badge color="warning" size="sm">
                  Live Mode
                </Badge>
              </div>
              <p className="text-xs md:text-sm font-bold text-black/70">
                {timetable.division?.name} • Drag any period cell to swap with another slot
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              disabled={history.length === 0}
              onClick={handleUndo}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Undo
            </Button>

            <Button
              variant="warning"
              size="sm"
              onClick={handleSave}
              icon={<Save className="w-4 h-4" />}
            >
              {saveSuccess ? 'Saved Draft!' : 'Save Changes'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handlePublish}
              icon={<Send className="w-4 h-4" />}
            >
              Publish
            </Button>
          </div>
        </div>

        {/* Clash Status Banner */}
        <div
          className={`p-4 rounded-2xl border-3 border-black nb-shadow flex items-center justify-between gap-4 ${
            clashes.length === 0 ? 'bg-[#2DD4BF]' : 'bg-[#FF5D5D] text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center text-black">
              {clashes.length === 0 ? (
                <CheckCircle2 className="w-6 h-6 text-green-700" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-[#FF5D5D]" />
              )}
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide">
                {clashes.length === 0
                  ? 'Zero Conflicts Detected • Ready to Publish'
                  : `${clashes.length} Active Scheduling Conflicts`}
              </h3>
              <p className="text-xs font-bold opacity-90">
                {clashes.length === 0
                  ? 'All faculty schedules and room allocations are verified.'
                  : 'Double-booked period detected. Please drag conflicting cell to another time.'}
              </p>
            </div>
          </div>
        </div>

        {/* Timetable Grid in Editable Mode */}
        <TimetableGrid
          entries={entries}
          clashes={clashes}
          editable={true}
          onEntrySwap={handleEntrySwap}
          title="Interactive Schedule Grid"
          subtitle="Grab and move any slot to optimize your faculty distribution"
        />
      </div>
    </ProtectedRoute>
  );
}
