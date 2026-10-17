'use client';

import React, { useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useMasterData } from '@/store/useMasterData';
import { useTimetableData } from '@/store/useTimetableData';
import { resolveDepartmentId } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import {
  exportTimetablePdf,
  exportTimetableExcel,
  exportTimetableJson,
  timetableMatrix,
} from '@/lib/export/timetableExport';
import { DAYS } from '@/lib/types';
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  Printer,
  CheckCircle2,
  CalendarX,
} from 'lucide-react';

function ExportCenterContent() {
  const searchParams = useSearchParams();
  const { user } = useStore();
  const role = user?.role ?? 'student';
  const departments = useMasterData((s) => s.departments);
  const timetables = useTimetableData((s) => s.timetables);

  const scopeDeptId = resolveDepartmentId(
    departments,
    user?.department_id,
    user?.department_code
  );

  // Students and faculty only export published schedules; staff see drafts too.
  const available = useMemo(() => {
    if (role === 'management') return timetables;
    if (role === 'hod') {
      return timetables.filter((t) => t.department_id === scopeDeptId);
    }
    return timetables.filter(
      (t) =>
        t.status === 'published' &&
        (!scopeDeptId || t.department_id === scopeDeptId)
    );
  }, [timetables, role, scopeDeptId]);

  const requestedId = searchParams.get('id');
  const fallback = available[0];

  const [selectedId, setSelectedId] = useState(requestedId ?? fallback?.id ?? '');
  const [format, setFormat] = useState<'pdf' | 'excel' | 'json'>('pdf');
  const [downloaded, setDownloaded] = useState('');

  // Never fall back to a timetable the signed-in role is not allowed to see.
  const timetable = available.find((t) => t.id === selectedId) ?? available[0];

  const rows = useMemo(() => (timetable ? timetableMatrix(timetable) : []), [timetable]);

  const handleDownload = () => {
    if (!timetable) return;

    if (format === 'pdf') exportTimetablePdf(timetable);
    else if (format === 'excel') exportTimetableExcel(timetable);
    else exportTimetableJson(timetable);

    setDownloaded(format);
    setTimeout(() => setDownloaded(''), 3000);
  };

  if (!timetable) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
          Export & Publishing Center
        </h1>
        <Card className="p-10 bg-[#F7FBF3] text-center">
          <CalendarX className="w-10 h-10 mx-auto mb-3 text-black/35" />
          <p className="text-sm font-bold text-black/60">
            No timetable is available to export yet.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-3 border-black">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-black/60">
              Distribution Suite
            </span>
            <Badge color="accent" size="sm">
              PDF · XLSX · JSON
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
            Export & Publishing Center
          </h1>
          <p className="text-xs md:text-sm font-bold text-black/70">
            Download the exact schedule you see on screen — no sample rows.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 bg-white space-y-5">
            <Dropdown
              label="Select Target Timetable"
              value={timetable.id}
              onChange={(e) => setSelectedId(e.target.value)}
              options={available.map((t) => ({
                label: `${t.division?.name ?? 'Class'} (${t.department?.code ?? '—'}) • ${t.status}`,
                value: t.id,
              }))}
            />

            <div>
              <span className="text-xs font-black uppercase tracking-wider text-black block mb-2">
                Choose Export Format
              </span>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat('pdf')}
                  aria-pressed={format === 'pdf'}
                  className={`p-3.5 rounded-xl border-2 border-black flex flex-col items-center gap-1.5 transition-all cursor-pointer font-black text-xs uppercase ${
                    format === 'pdf'
                      ? 'bg-[#BF360C] text-white nb-shadow-sm -translate-y-0.5'
                      : 'bg-[#F1F8E9] text-black hover:bg-white'
                  }`}
                >
                  <FileText className="w-5 h-5 stroke-[2.2]" />
                  <span>PDF Doc</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('excel')}
                  aria-pressed={format === 'excel'}
                  className={`p-3.5 rounded-xl border-2 border-black flex flex-col items-center gap-1.5 transition-all cursor-pointer font-black text-xs uppercase ${
                    format === 'excel'
                      ? 'bg-[#4DB6AC] text-black nb-shadow-sm -translate-y-0.5'
                      : 'bg-[#F1F8E9] text-black hover:bg-white'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5 stroke-[2.2]" />
                  <span>Excel XLSX</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('json')}
                  aria-pressed={format === 'json'}
                  className={`p-3.5 rounded-xl border-2 border-black flex flex-col items-center gap-1.5 transition-all cursor-pointer font-black text-xs uppercase ${
                    format === 'json'
                      ? 'bg-[#FFD54F] text-black nb-shadow-sm -translate-y-0.5'
                      : 'bg-[#F1F8E9] text-black hover:bg-white'
                  }`}
                >
                  <FileDown className="w-5 h-5 stroke-[2.2]" />
                  <span>Raw JSON</span>
                </button>
              </div>
            </div>

            <Button
              variant="warning"
              size="lg"
              onClick={handleDownload}
              className="w-full mt-2"
              icon={
                downloaded ? (
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <FileDown className="w-5 h-5 stroke-[2.5]" />
                )
              }
            >
              {downloaded
                ? 'Downloaded Successfully!'
                : `Download ${format.toUpperCase()}`}
            </Button>

            <div className="pt-3 border-t-2 border-black/10 text-[11px] font-bold text-black/60 space-y-1">
              <p>
                Division: <span className="font-black text-black">{timetable.division?.name}</span>
              </p>
              <p>
                Term: <span className="font-black text-black">{timetable.academic_year}</span>
              </p>
              <p>
                Filled periods:{' '}
                <span className="font-black text-black">{timetable.entries?.length ?? 0} / 40</span>
              </p>
            </div>
          </Card>

          <Card className="p-5 bg-[#F7FBF3]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase text-black">
                  Send to Printer
                </h3>
                <p className="text-[11px] font-bold text-black/60">
                  Uses the browser print dialog.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                icon={<Printer className="w-4 h-4" />}
              >
                Print
              </Button>
            </div>
          </Card>
        </div>

        {/* Live preview of the real matrix */}
        <div className="lg:col-span-7">
          <Card className="p-5 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-black mb-4">
              <span className="text-xs font-black uppercase text-black">
                Document Preview ({format.toUpperCase()})
              </span>
              <span className="text-[11px] font-bold text-black/60">
                {timetable.division?.name} • {timetable.department?.code}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[10px] min-w-[520px]">
                <thead>
                  <tr>
                    <th className="p-1.5 border-2 border-black bg-[#FFD54F] font-black uppercase text-left">
                      Period
                    </th>
                    {Object.values(DAYS).map((day) => (
                      <th
                        key={day}
                        className="p-1.5 border-2 border-black bg-[#F1F8E9] font-black uppercase"
                      >
                        {day.slice(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={`p-1.5 border-2 border-black/70 align-top whitespace-pre-line ${
                            cellIndex === 0
                              ? 'bg-[#F7FBF3] font-black whitespace-nowrap'
                              : cell === '— Free —'
                                ? 'text-black/35'
                                : cell === '— Break —'
                                  ? 'bg-[#FFD54F] font-black'
                                  : 'font-bold'
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] font-bold text-black/50 mt-3">
              Preview reflects the saved timetable. Edits made in the Live Editor
              appear here after you save.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ExportCenterPage() {
  return (
    <Suspense
      fallback={<div className="font-black p-8">Loading Export Center...</div>}
    >
      <ExportCenterContent />
    </Suspense>
  );
}
