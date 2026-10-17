'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useMasterData } from '@/store/useMasterData';
import { useTimetableData } from '@/store/useTimetableData';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { resolveDepartmentId } from '@/lib/utils';
import { validateTimetable } from '@/lib/generator/validator';
import {
  exportTimetablePdf,
  exportTimetableExcel,
} from '@/lib/export/timetableExport';
import {
  Edit3,
  FileDown,
  FileSpreadsheet,
  Printer,
  ArrowLeft,
  Send,
  CalendarX,
  Users,
  DoorOpen,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export default function TimetableDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);

  const { user } = useStore();
  const role = user?.role || 'student';
  const departments = useMasterData((s) => s.departments);
  const timetables = useTimetableData((s) => s.timetables);
  const setStatus = useTimetableData((s) => s.setStatus);

  const [publishOpen, setPublishOpen] = useState(false);
  const [publishError, setPublishError] = useState('');

  const timetable = timetables.find((t) => t.id === resolvedParams.id);

  if (!timetable) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-md text-center p-8 bg-white">
          <CalendarX className="w-12 h-12 mx-auto mb-3 text-[#BF360C]" />
          <h2 className="text-xl font-black uppercase text-black mb-2">
            Timetable not found
          </h2>
          <p className="text-sm font-bold text-black/60 mb-5">
            This schedule may have been deleted or replaced.
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

  const entries = timetable.entries ?? [];
  const clashes = validateTimetable(entries);
  const published = timetable.status === 'published';

  const userDeptId = resolveDepartmentId(
    departments,
    user?.department_id,
    user?.department_code
  );
  const canEdit =
    role === 'management' || (role === 'hod' && timetable.department_id === userDeptId);

  const facultyCount = new Set(entries.map((e) => e.faculty_id)).size;
  const roomCount = new Set(entries.map((e) => e.room_id)).size;
  const freeSlots = 40 - entries.length;

  const handlePublish = () => {
    if (entries.length === 0) {
      setPublishError('Add at least one period before publishing.');
      return;
    }
    if (clashes.length > 0) {
      setPublishError(
        `Resolve the ${clashes.length} conflict${clashes.length === 1 ? '' : 's'} in the editor first.`
      );
      return;
    }
    setStatus(timetable.id, 'published');
    setPublishOpen(false);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & actions */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-4 border-b-3 border-black">
        <div className="flex items-start gap-3">
          <Link
            href="/dashboard/timetable"
            aria-label="Back to timetables"
            className="p-2 rounded-xl border-2 border-black bg-white hover:bg-[#F1F8E9] nb-shadow-sm text-black shrink-0"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
                {timetable.division?.name || 'Division Timetable'}
              </h1>
              <Badge color={published ? 'accent' : 'yellow'} size="sm">
                {timetable.status}
              </Badge>
            </div>
            <p className="text-xs md:text-sm font-bold text-black/70">
              {timetable.department?.name} • {timetable.academic_year}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportTimetablePdf(timetable)}
            icon={<FileDown className="w-4 h-4 stroke-[2.2]" />}
          >
            PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => exportTimetableExcel(timetable)}
            icon={<FileSpreadsheet className="w-4 h-4 stroke-[2.2]" />}
          >
            Excel
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            icon={<Printer className="w-4 h-4 stroke-[2.2]" />}
          >
            Print
          </Button>

          {canEdit && (
            <Link href={`/dashboard/editor/${timetable.id}`}>
              <Button variant="warning" size="sm" icon={<Edit3 className="w-4 h-4" />}>
                Edit Grid
              </Button>
            </Link>
          )}

          {canEdit && !published && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setPublishError('');
                setPublishOpen(true);
              }}
              icon={<Send className="w-4 h-4" />}
            >
              Publish Now
            </Button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white">
          <span className="text-[10px] font-black uppercase text-black/50 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Filled Periods
          </span>
          <p className="text-2xl font-black text-black mt-1">
            {entries.length}
            <span className="text-sm text-black/40"> / 40</span>
          </p>
        </Card>
        <Card className="p-4 bg-[#4DB6AC]">
          <span className="text-[10px] font-black uppercase text-black/70 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Faculty Assigned
          </span>
          <p className="text-2xl font-black text-black mt-1">{facultyCount}</p>
        </Card>
        <Card className="p-4 bg-[#80CBC4]">
          <span className="text-[10px] font-black uppercase text-black/70 flex items-center gap-1">
            <DoorOpen className="w-3.5 h-3.5" /> Rooms Used
          </span>
          <p className="text-2xl font-black text-black mt-1">{roomCount}</p>
        </Card>
        <Card className={`p-4 ${clashes.length === 0 ? 'bg-[#FFD54F]' : 'bg-[#BF360C] text-white'}`}>
          <span className="text-[10px] font-black uppercase opacity-80 flex items-center gap-1">
            {clashes.length === 0 ? <Clock className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            Conflicts
          </span>
          <p className="text-2xl font-black mt-1">
            {clashes.length === 0 ? 'None' : clashes.length}
          </p>
        </Card>
      </div>

      {entries.length === 0 ? (
        <Card className="p-10 bg-[#F7FBF3] text-center">
          <CalendarX className="w-10 h-10 mx-auto mb-3 text-black/35" />
          <h3 className="text-base font-black uppercase text-black">
            This schedule is still empty
          </h3>
          <p className="text-xs font-bold text-black/60 mt-1 mb-5">
            Auto-fill the week, or add periods one by one in the editor.
          </p>
          {canEdit && (
            <Link href={`/dashboard/editor/${timetable.id}`}>
              <Button variant="warning" icon={<Edit3 className="w-4 h-4" />}>
                Open Editor
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <TimetableGrid
          entries={entries}
          clashes={clashes}
          breaks={
            timetable.breaks ??
            [1, 2, 3, 4, 5].map((day) => ({ day, slot: 4 }))
          }
          title={`${timetable.division?.name || 'Class'} • Weekly Teaching Schedule`}
          subtitle={`Mon to Fri • 8 periods • ${freeSlots} free period${freeSlots === 1 ? '' : 's'} • lunch shown per day`}
        />
      )}

      <Modal
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        title="Publish Timetable"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm font-bold text-black/80">
            Publish <span className="font-black">{timetable.division?.name}</span>{' '}
            to students and faculty? They will see it immediately on their
            dashboards.
          </p>

          {publishError && (
            <div
              role="alert"
              className="p-3 rounded-xl border-2 border-[#BF360C] bg-[#FFEBEE] text-xs font-black text-[#BF360C]"
            >
              {publishError}
            </div>
          )}

          <div className="pt-4 border-t-2 border-black/10 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setPublishOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePublish}
              icon={<Send className="w-4 h-4" />}
            >
              Publish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
