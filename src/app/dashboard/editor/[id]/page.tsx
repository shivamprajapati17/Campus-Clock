'use client';

import React, { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Dropdown } from '@/components/ui/Dropdown';
import { Toggle } from '@/components/ui/Toggle';
import { useStore } from '@/store/useStore';
import { useMasterData } from '@/store/useMasterData';
import { useTimetableData } from '@/store/useTimetableData';
import { resolveDepartmentId } from '@/lib/utils';
import {
  MOCK_ROOMS,
  MOCK_SUBJECTS,
  MOCK_FACULTY,
  subjectsForDepartment,
} from '@/lib/data/mockData';
import { buildFacultyForDepartment } from '@/lib/faculty';
import { generateTimetable } from '@/lib/generator/engine';
import { validateTimetable } from '@/lib/generator/validator';
import type { Timetable, TimetableEntry, Clash } from '@/lib/types';
import {
  Save,
  Send,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Sparkles,
  Wand2,
  Lock,
  CalendarX,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const SLOT_TIMES = [
  '09:15–10:15',
  '10:15–11:15',
  '11:15–12:15',
  '12:15–01:15',
  '01:15–02:15',
  '02:15–03:15',
  '03:15–04:15',
  '04:15–05:15',
];

/** Fallback lunch period when a timetable predates per-day breaks. */
const DEFAULT_BREAKS = [1, 2, 3, 4, 5].map((day) => ({ day, slot: 4 }));

function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const timetableId = resolvedParams.id;

  const timetables = useTimetableData((s) => s.timetables);
  const timetable = timetables.find((t) => t.id === timetableId);

  if (!timetable) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-md text-center p-8 bg-white">
          <CalendarX className="w-12 h-12 mx-auto mb-3 text-[#BF360C]" />
          <h2 className="text-xl font-black uppercase text-black mb-2">
            Timetable not found
          </h2>
          <p className="text-sm font-bold text-black/60 mb-5">
            It may have been deleted. Pick another schedule from the directory.
          </p>
          <Link href="/dashboard/timetable">
            <Button variant="warning" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Timetables
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Keying on the id guarantees fresh local state when switching schedules.
  return <EditorWorkbench key={timetable.id} timetable={timetable} />;
}

function EditorWorkbench({ timetable }: { timetable: Timetable }) {
  const router = useRouter();
  const { user } = useStore();
  const departments = useMasterData((s) => s.departments);
  const directoryUsers = useMasterData((s) => s.directoryUsers);
  const saveEntriesToStore = useTimetableData((s) => s.saveEntries);
  const setStatus = useTimetableData((s) => s.setStatus);
  const updateAcademicYear = useTimetableData((s) => s.updateAcademicYear);

  const departmentId = timetable.department_id;
  const department = departments.find((d) => d.id === departmentId);

  // Subjects and faculty are scoped to the timetable's own branch. A branch
  // with no seeded subject set falls back to everything available, so the grid
  // is still editable instead of becoming a dead end.
  const departmentSubjects = useMemo(
    () => subjectsForDepartment(departmentId),
    [departmentId]
  );
  const departmentFaculty = useMemo(
    () => buildFacultyForDepartment(departmentId, directoryUsers),
    [departmentId, directoryUsers]
  );
  const subjects = departmentSubjects.length > 0 ? departmentSubjects : MOCK_SUBJECTS;
  const faculty = departmentFaculty.length > 0 ? departmentFaculty : MOCK_FACULTY;

  const [entries, setEntries] = useState<TimetableEntry[]>(() =>
    timetable.entries ? [...timetable.entries] : []
  );
  const [clashes, setClashes] = useState<Clash[]>(() =>
    validateTimetable(timetable.entries ?? [])
  );
  const [history, setHistory] = useState<TimetableEntry[][]>([]);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState('');
  const [publishError, setPublishError] = useState('');

  // ── Cell editor ──────────────────────────────────────────
  const [cell, setCell] = useState<{ day: number; slot: number } | null>(null);
  const [cellSubjectId, setCellSubjectId] = useState('');
  const [cellFacultyId, setCellFacultyId] = useState('');
  const [cellRoomId, setCellRoomId] = useState('');
  const [cellLocked, setCellLocked] = useState(false);

  const editingEntry = cell
    ? entries.find((e) => e.day === cell.day && e.slot === cell.slot)
    : undefined;

  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 2600);
  };

  const openCell = (entry?: TimetableEntry, day?: number, slot?: number) => {
    const target = entry
      ? { day: entry.day as number, slot: entry.slot as number }
      : { day: day ?? 1, slot: slot ?? 1 };

    setPublishError('');
    setCell(target);

    if (entry) {
      setCellSubjectId(entry.subject_id);
      setCellFacultyId(entry.faculty_id);
      setCellRoomId(entry.room_id);
      setCellLocked(entry.is_locked);
    } else {
      const subject = subjects[0];
      const teacher =
        faculty.find((f) => f.department_id === departmentId) ?? faculty[0];
      const room =
        subject?.needs_lab || subject?.type === 'practical'
          ? MOCK_ROOMS.find((r) => r.type === 'lab') ?? MOCK_ROOMS[0]
          : MOCK_ROOMS.find((r) => r.type === 'classroom') ?? MOCK_ROOMS[0];
      setCellSubjectId(subject?.id ?? '');
      setCellFacultyId(teacher?.id ?? '');
      setCellRoomId(room?.id ?? '');
      setCellLocked(false);
    }
  };

  const applyEntries = (next: TimetableEntry[]) => {
    setEntries(next);
    setClashes(validateTimetable(next));
    setDirty(true);
    setPublishError('');
  };

  const handleSaveCell = () => {
    if (!cell) return;
    if (!cellSubjectId || !cellFacultyId || !cellRoomId) {
      setPublishError('Pick a subject, faculty member and room first.');
      return;
    }

    const subject = subjects.find((s) => s.id === cellSubjectId);
    const teacher = faculty.find((f) => f.id === cellFacultyId);
    const room = MOCK_ROOMS.find((r) => r.id === cellRoomId);

    const newEntry: TimetableEntry = {
      id: editingEntry?.id ?? `entry-${timetable.id}-${cell.day}-${cell.slot}`,
      timetable_id: timetable.id,
      day: cell.day as TimetableEntry['day'],
      slot: cell.slot as TimetableEntry['slot'],
      subject_id: cellSubjectId,
      faculty_id: cellFacultyId,
      room_id: cellRoomId,
      entry_type: subject?.type ?? 'lecture',
      is_locked: cellLocked,
      subject,
      faculty: teacher,
      room,
    };

    setHistory((h) => [...h, entries]);
    // Keep any parallel batch entry that shares this period; only replace the
    // one being edited (or append when this period was empty).
    applyEntries([
      ...entries.filter((e) =>
        editingEntry ? e.id !== editingEntry.id : !(e.day === cell.day && e.slot === cell.slot)
      ),
      newEntry,
    ]);
    setCell(null);
    flash('Slot updated — remember to save.');
  };

  const handleDeleteCell = () => {
    if (!cell) return;
    setHistory((h) => [...h, entries]);
    applyEntries(
      entries.filter((e) =>
        editingEntry ? e.id !== editingEntry.id : !(e.day === cell.day && e.slot === cell.slot)
      )
    );
    setCell(null);
    flash('Slot cleared — remember to save.');
  };

  const handleEntrySwap = (fromEntryId: string, toDay: number, toSlot: number) => {
    const sourceIndex = entries.findIndex((e) => e.id === fromEntryId);
    if (sourceIndex === -1) return;

    const sourceEntry = entries[sourceIndex];
    if (sourceEntry.is_locked) {
      setPublishError('That slot is locked. Unlock it before moving it.');
      return;
    }

    const targetIndex = entries.findIndex(
      (e) => e.day === toDay && e.slot === toSlot
    );

    if (targetIndex !== -1 && entries[targetIndex].is_locked) {
      setPublishError('The destination slot is locked.');
      return;
    }

    const next = [...entries];

    if (targetIndex !== -1) {
      const targetEntry = next[targetIndex];
      next[sourceIndex] = {
        ...sourceEntry,
        day: toDay as TimetableEntry['day'],
        slot: toSlot as TimetableEntry['slot'],
      };
      next[targetIndex] = {
        ...targetEntry,
        day: sourceEntry.day,
        slot: sourceEntry.slot,
      };
    } else {
      next[sourceIndex] = {
        ...sourceEntry,
        day: toDay as TimetableEntry['day'],
        slot: toSlot as TimetableEntry['slot'],
      };
    }

    setHistory((h) => [...h, entries]);
    applyEntries(next);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((h) => h.slice(0, h.length - 1));
    setEntries(previous);
    setClashes(validateTimetable(previous));
    setDirty(true);
    setPublishError('');
  };

  const handleSave = () => {
    saveEntriesToStore(timetable.id, entries);
    setDirty(false);
    flash('Draft saved.');
  };

  const handlePublish = () => {
    if (entries.length === 0) {
      setPublishError('Add at least one period before publishing.');
      return;
    }
    if (clashes.length > 0) {
      setPublishError(
        `Fix the ${clashes.length} conflict${clashes.length === 1 ? '' : 's'} before publishing.`
      );
      return;
    }

    saveEntriesToStore(timetable.id, entries);
    setStatus(timetable.id, 'published');
    setDirty(false);
    setPublishError('');
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {
      // Confetti is decorative only.
    }
    flash('Published to students.');
    setTimeout(() => router.push(`/dashboard/timetable/${timetable.id}`), 700);
  };

  const handleAutoFill = () => {
    if (!timetable.division) return;

    const assignments = subjects.map((subject, index) => ({
      subject,
      faculty: faculty[index % faculty.length],
    }));

    const result = generateTimetable({
      division: timetable.division,
      assignments,
      rooms: MOCK_ROOMS,
    });

    if (result.entries.length === 0) {
      setPublishError(
        result.message ||
          'The scheduler could not place any period. Add faculty or rooms and try again.'
      );
      return;
    }

    const generated: TimetableEntry[] = result.entries.map((entry, index) => ({
      ...entry,
      id: `entry-${timetable.id}-${entry.day}-${entry.slot}-${index}`,
      timetable_id: timetable.id,
      is_locked: false,
      subject: subjects.find((s) => s.id === entry.subject_id),
      faculty: faculty.find((f) => f.id === entry.faculty_id),
      room: MOCK_ROOMS.find((r) => r.id === entry.room_id),
    }));

    setHistory((h) => [...h, entries]);
    applyEntries(generated);
    flash(
      result.clashes.length === 0
        ? `Auto-filled ${generated.length} slots with zero conflicts.`
        : `Auto-filled ${generated.length} slots — review the ${result.clashes.length} conflict(s).`
    );
  };

  const canEdit =
    user?.role === 'management' ||
    (user?.role === 'hod' &&
      resolveDepartmentId(
        departments,
        user?.department_id,
        user?.department_code
      ) === departmentId);

  if (!canEdit) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-md text-center p-8 bg-[#FFEBEE]">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-[#BF360C]" />
          <h2 className="text-xl font-black uppercase text-black mb-2">
            Read-only access
          </h2>
          <p className="text-sm font-bold text-black/60 mb-5">
            Only Management and this department&apos;s HOD can edit this
            timetable.
          </p>
          <Link href={`/dashboard/timetable/${timetable.id}`}>
            <Button variant="outline">View the Grid</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Editor Top Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b-3 border-black">
        <div className="flex items-start gap-3">
          <Link
            href={`/dashboard/timetable/${timetable.id}`}
            className="p-2 rounded-xl border-2 border-black bg-white hover:bg-[#F1F8E9] nb-shadow-sm text-black shrink-0"
            aria-label="Back to timetable"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight text-black">
                {timetable.division?.name || 'Timetable'} Editor
              </h1>
              <Badge color={timetable.status === 'published' ? 'accent' : 'yellow'} size="sm">
                {timetable.status}
              </Badge>
              {dirty && (
                <Badge color="warning" size="sm">
                  Unsaved
                </Badge>
              )}
            </div>
            <p className="text-xs md:text-sm font-bold text-black/70">
              {department?.name || timetable.department?.name} • {timetable.academic_year} • click any
              cell to edit
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            variant="accent"
            size="sm"
            onClick={handleAutoFill}
            icon={<Wand2 className="w-4 h-4" />}
          >
            Auto-fill
          </Button>

          <Button
            variant="warning"
            size="sm"
            onClick={handleSave}
            icon={<Save className="w-4 h-4" />}
          >
            Save Draft
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

      {notice && (
        <div
          role="status"
          className="p-3 rounded-xl border-2 border-green-700 bg-green-50 text-xs font-black text-green-800 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {notice}
        </div>
      )}

      {publishError && (
        <div
          role="alert"
          className="p-3 rounded-xl border-2 border-[#BF360C] bg-[#FFEBEE] text-xs font-black text-[#BF360C] flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {publishError}
        </div>
      )}

      {/* Clash Status Banner */}
      <div
        className={`p-4 rounded-2xl border-3 border-black nb-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          clashes.length === 0 ? 'bg-[#4DB6AC]' : 'bg-[#BF360C] text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center text-black shrink-0">
            {clashes.length === 0 ? (
              <CheckCircle2 className="w-6 h-6 text-green-700" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-[#BF360C]" />
            )}
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-wide">
              {clashes.length === 0
                ? 'Zero Conflicts Detected'
                : `${clashes.length} Active Scheduling Conflict${clashes.length === 1 ? '' : 's'}`}
            </h3>
            <p className="text-xs font-bold opacity-90">
              {clashes.length === 0
                ? 'Faculty, rooms and the class calendar are all clear.'
                : clashes[0].details}
            </p>
          </div>
        </div>

        <div className="text-xs font-black uppercase bg-white/80 text-black px-3 py-1.5 rounded-xl border-2 border-black">
          {entries.length} / 40 Slots Filled
        </div>
      </div>

      <TimetableGrid
        entries={entries}
        clashes={clashes}
        breaks={timetable.breaks ?? DEFAULT_BREAKS}
        editable={true}
        onEntrySwap={handleEntrySwap}
        onCellClick={openCell}
        title="Interactive Schedule Grid"
        subtitle="Drag a cell to swap it, or click a period to assign subject, faculty and room"
      />

      {/* Cell Editor */}
      <Modal
        isOpen={cell !== null}
        onClose={() => setCell(null)}
        title={
          editingEntry
            ? `Edit ${DAY_LABELS[(cell?.day ?? 1) - 1]} · Slot ${cell?.slot}`
            : `Add Period · ${DAY_LABELS[(cell?.day ?? 1) - 1]} · Slot ${cell?.slot}`
        }
      >
        <div className="space-y-4">
          <p className="text-xs font-bold text-black/60">
            {DAY_LABELS[(cell?.day ?? 1) - 1]} at{' '}
            {SLOT_TIMES[(cell?.slot ?? 1) - 1]}
          </p>

          {departmentSubjects.length === 0 && (
            <div className="p-3 rounded-xl border-2 border-black/20 bg-[#F7FBF3] text-[11px] font-bold text-black/70">
              No subject set is configured for this branch, so all available
              subjects are listed.
            </div>
          )}

          <Dropdown
            label="Subject"
            value={cellSubjectId}
            onChange={(e) => {
              const nextSubject = subjects.find((s) => s.id === e.target.value);
              setCellSubjectId(e.target.value);
              if (nextSubject?.needs_lab || nextSubject?.type === 'practical') {
                const lab = MOCK_ROOMS.find((r) => r.type === 'lab');
                if (lab) setCellRoomId(lab.id);
              } else {
                const hall = MOCK_ROOMS.find((r) => r.type === 'classroom');
                if (hall) setCellRoomId(hall.id);
              }
            }}
            options={subjects.map((s) => ({
              label: `${s.code} • ${s.name}`,
              value: s.id,
            }))}
          />

          <Dropdown
            label="Faculty"
            value={cellFacultyId}
            onChange={(e) => setCellFacultyId(e.target.value)}
            options={faculty.map((f) => ({
              label: `${f.initials} • ${f.user?.name ?? 'Faculty'} (max ${f.max_per_day}/day)`,
              value: f.id,
            }))}
          />

          <Dropdown
            label="Room"
            value={cellRoomId}
            onChange={(e) => setCellRoomId(e.target.value)}
            options={MOCK_ROOMS.map((r) => ({
              label: `${r.number} • ${r.type} • ${r.capacity} seats`,
              value: r.id,
            }))}
          />

          <Toggle
            label="Lock this slot"
            hint="Locked slots cannot be dragged or overwritten by a swap"
            checked={cellLocked}
            onChange={setCellLocked}
          />

          <div className="pt-4 border-t-2 border-black/10 flex flex-wrap items-center justify-between gap-3">
            {editingEntry ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleDeleteCell}
                icon={<Trash2 className="w-4 h-4" />}
              >
                Clear Slot
              </Button>
            ) : (
              <span className="text-[11px] font-bold text-black/50 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Empty period
              </span>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => setCell(null)}>
                Cancel
              </Button>
              <Button variant="warning" size="sm" onClick={handleSaveCell}>
                {editingEntry ? 'Update Slot' : 'Add Period'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Academic year is editable, so a reused schedule can be re-dated. */}
      <Card className="p-4 bg-[#F7FBF3]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-black uppercase text-black">
              Academic Year
            </h3>
            <p className="text-[11px] font-bold text-black/60">
              Printed on the exported PDF and shown to students.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={timetable.academic_year}
              onChange={(e) =>
                updateAcademicYear(timetable.id, e.target.value)
              }
              aria-label="Academic year"
              className="nb-input py-1.5 text-xs w-44"
            />
            <Sparkles className="w-4 h-4 text-[#BF360C]" />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ProtectedRoute roles={['hod', 'management']}>
      <EditorPage params={params} />
    </ProtectedRoute>
  );
}
