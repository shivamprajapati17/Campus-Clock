'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import {
  MOCK_SUBJECTS,
  MOCK_FACULTY,
  MOCK_ROOMS,
  subjectsForDepartment,
} from '@/lib/data/mockData';
import { buildFacultyForDepartment } from '@/lib/faculty';
import { useMasterData } from '@/store/useMasterData';
import { useTimetableData } from '@/store/useTimetableData';
import { generateTimetable } from '@/lib/generator/engine';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Save,
  Send,
  Zap,
  ArrowRight,
} from 'lucide-react';
import type { TimetableEntry, Clash } from '@/lib/types';
import confetti from 'canvas-confetti';

/**
 * Reading the clock is an event-time concern, not a render-time one. Keeping it
 * at module scope means the component body stays free of impure calls.
 */
function nowMs(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

export default function GeneratePage() {
  const router = useRouter();

  const departments = useMasterData((s) => s.departments);
  const divisions = useMasterData((s) => s.divisions);
  const directoryUsers = useMasterData((s) => s.directoryUsers);
  const timetables = useTimetableData((s) => s.timetables);
  const createTimetable = useTimetableData((s) => s.createTimetable);
  const saveEntries = useTimetableData((s) => s.saveEntries);
  const setStatus = useTimetableData((s) => s.setStatus);

  const [departmentId, setDepartmentId] = useState('');
  const [divisionId, setDivisionId] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-2027 (Even)');

  const activeDept =
    departments.find((d) => d.id === departmentId) ?? departments[0];
  const deptDivisions = divisions.filter(
    (d) => d.department_id === activeDept?.id
  );
  const activeDivision =
    deptDivisions.find((d) => d.id === divisionId) ?? deptDivisions[0];

  const subjects = useMemo(() => {
    if (!activeDept) return MOCK_SUBJECTS;
    const own = subjectsForDepartment(activeDept.id);
    return own.length > 0 ? own : MOCK_SUBJECTS;
  }, [activeDept]);

  const faculty = useMemo(() => {
    if (!activeDept) return MOCK_FACULTY;
    const own = buildFacultyForDepartment(activeDept.id, directoryUsers);
    return own.length > 0 ? own : MOCK_FACULTY;
  }, [activeDept, directoryUsers]);

  const [generating, setGenerating] = useState(false);
  const [generatedEntries, setGeneratedEntries] = useState<TimetableEntry[] | null>(null);
  const [clashes, setClashes] = useState<Clash[]>([]);
  const [genTime, setGenTime] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  const handleGenerate = () => {
    setGenerating(true);
    setError('');
    setSaved('');

    const startTime = nowMs();

    setTimeout(() => {
      const division = activeDivision;
      if (!division) {
        setGenerating(false);
        setError('Add a class division before generating.');
        return;
      }

      // Round-robin the branch's own teaching staff across its subjects, so the
      // generated grid never mixes another department's faculty in.
      const assignments = subjects.map((subject, index) => ({
        subject,
        faculty: faculty[index % faculty.length],
      }));

      const result = generateTimetable({
        division,
        assignments,
        rooms: MOCK_ROOMS,
      });

      const elapsed = Math.round(nowMs() - startTime);

      if (result.entries.length === 0) {
        setGenerating(false);
        setGeneratedEntries(null);
        setClashes(result.clashes);
        setGenTime(elapsed);
        setError(
          result.message ||
            'The scheduler could not place any period. Add faculty or rooms and try again.'
        );
        return;
      }

      const entriesWithJoins: TimetableEntry[] = result.entries.map((entry, index) => ({
        ...entry,
        id: `gen-entry-${division.id}-${index}-${Date.now()}`,
        timetable_id: `tt-${division.id}-draft`,
        is_locked: false,
        subject: subjects.find((s) => s.id === entry.subject_id),
        faculty: faculty.find((f) => f.id === entry.faculty_id),
        room: MOCK_ROOMS.find((r) => r.id === entry.room_id),
      }));

      setGeneratedEntries(entriesWithJoins);
      setClashes(result.clashes);
      setGenTime(elapsed);

      if (result.clashes.length === 0) {
        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        } catch {
          // Confetti is decorative only.
        }
      }

      setGenerating(false);
    }, 600);
  };

  const persist = (status: 'draft' | 'published') => {
    if (!generatedEntries || !activeDivision || !activeDept) return;

    const existing = timetables.find(
      (t) => t.division_id === activeDivision.id
    );
    const timetable =
      existing ??
      createTimetable({
        department: activeDept,
        division: activeDivision,
        academic_year: academicYear,
        created_by: 'user-mgmt-1',
      });

    saveEntries(
      timetable.id,
      generatedEntries.map((entry) => ({ ...entry, timetable_id: timetable.id }))
    );
    setStatus(timetable.id, status);

    setSaved(
      status === 'published'
        ? 'Published! Redirecting to the timetable…'
        : 'Draft saved. Opening the editor…'
    );

    setTimeout(() => {
      router.push(
        status === 'published'
          ? `/dashboard/timetable/${timetable.id}`
          : `/dashboard/editor/${timetable.id}`
      );
    }, 700);
  };

  return (
    <ProtectedRoute roles={['hod', 'management']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b-3 border-black">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-black/60">
                Scheduling Suite
              </span>
              <Badge color="primary" size="sm">
                0-Clash Engine
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
              Automated Timetable Generator
            </h1>
            <p className="text-xs md:text-sm font-bold text-black/70">
              Build a conflict-free week from the selected branch&apos;s subjects,
              faculty and lab rooms.
            </p>
          </div>
        </div>

        {/* Configuration */}
        <Card className="p-6 bg-white">
          <h2 className="text-base font-black uppercase text-black mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#BF360C]" />
            <span>Generation Parameters</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Dropdown
              label="Academic Department"
              value={activeDept?.id ?? ''}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setDivisionId('');
                setGeneratedEntries(null);
              }}
              options={departments.map((d) => ({
                label: `${d.name} (${d.code})`,
                value: d.id,
              }))}
            />

            <Dropdown
              label="Target Class Division"
              value={activeDivision?.id ?? ''}
              onChange={(e) => {
                setDivisionId(e.target.value);
                setGeneratedEntries(null);
              }}
              options={deptDivisions.map((div) => ({
                label: `${div.name} • Sem ${div.semester} (${div.strength} Students)`,
                value: div.id,
              }))}
            />

            <Input
              label="Academic Year / Term"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="e.g. 2026-2027 (Even)"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-bold">
            <div className="p-2.5 rounded-xl border-2 border-black/15 bg-[#F7FBF3]">
              Subjects: <span className="font-black text-black">{subjects.length}</span>
            </div>
            <div className="p-2.5 rounded-xl border-2 border-black/15 bg-[#F7FBF3]">
              Faculty: <span className="font-black text-black">{faculty.length}</span>
            </div>
            <div className="p-2.5 rounded-xl border-2 border-black/15 bg-[#F7FBF3]">
              Rooms: <span className="font-black text-black">{MOCK_ROOMS.length}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-bold text-black/70">
              <span>Constraints: </span>
              <span className="font-black text-black">
                7 Slots • 2-Slot Labs • Max Faculty/Day • No Lunch Clash
              </span>
            </div>

            <Button
              variant="warning"
              size="lg"
              loading={generating}
              disabled={!activeDivision}
              onClick={handleGenerate}
              icon={<Sparkles className="w-5 h-5 stroke-[2.5]" />}
            >
              {generating
                ? 'Optimizing Schedule...'
                : activeDivision
                  ? 'Generate 0-Clash Timetable'
                  : 'Add a division first'}
            </Button>
          </div>
        </Card>

        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl border-3 border-black bg-[#FFEBEE] text-xs font-black text-[#BF360C] flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {saved && (
          <div
            role="status"
            className="p-4 rounded-xl border-3 border-black bg-[#4DB6AC] text-xs font-black text-black flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {saved}
          </div>
        )}

        {generatedEntries && (
          <div className="space-y-6">
            <Card
              className={`p-5 ${
                clashes.length === 0 ? 'bg-[#4DB6AC]/20 border-green-700' : 'bg-red-50'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl border-3 border-black nb-shadow flex items-center justify-center ${
                      clashes.length === 0
                        ? 'bg-[#4DB6AC] text-black'
                        : 'bg-[#BF360C] text-white'
                    }`}
                  >
                    {clashes.length === 0 ? (
                      <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                    ) : (
                      <AlertTriangle className="w-7 h-7 stroke-[2.5]" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black uppercase text-black">
                        {clashes.length === 0
                          ? 'Zero Clashes Detected!'
                          : `${clashes.length} Scheduling Conflicts`}
                      </h3>
                      <Badge
                        color={clashes.length === 0 ? 'accent' : 'primary'}
                        size="sm"
                      >
                        {clashes.length === 0 ? 'Verified' : 'Attention'}
                      </Badge>
                    </div>
                    <p className="text-xs font-bold text-black/75 mt-0.5">
                      Solved in{' '}
                      <span className="font-black text-black">{genTime}ms</span> •{' '}
                      {generatedEntries.length} periods placed for{' '}
                      <span className="font-black text-black">
                        {activeDivision?.name}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    icon={<Save className="w-4 h-4" />}
                    onClick={() => persist('draft')}
                  >
                    Save Draft
                  </Button>
                  <Button
                    variant="primary"
                    icon={
                      saved.startsWith('Published') ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )
                    }
                    disabled={clashes.length > 0}
                    onClick={() => persist('published')}
                  >
                    Publish to Students
                  </Button>
                </div>
              </div>

              {clashes.length > 0 && (
                <div className="mt-4 pt-3 border-t-2 border-black/20 space-y-2">
                  {clashes.map((c, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-white border-2 border-black text-xs font-bold text-red-700 flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{c.details}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <TimetableGrid
              entries={generatedEntries}
              clashes={clashes}
              breaks={[1, 2, 3, 4, 5].map((day) => ({ day, slot: 4 }))}
              title={`Generated Preview: ${activeDivision?.name || 'Division'}`}
              subtitle={`${academicYear} • Mon to Fri schedule`}
            />

            <div className="flex items-center justify-between gap-3 p-4 rounded-xl border-2 border-black/15 bg-[#F7FBF3] text-[11px] font-bold text-black/60">
              <span>
                Review the grid, then save it as a draft to fine-tune every cell
                in the editor.
              </span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
