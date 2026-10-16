'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  MOCK_TIMETABLES,
  MOCK_ENTRIES_SE_A,
} from '@/lib/data/mockData';
import {
  Calendar,
  Edit3,
  FileDown,
  Printer,
  Share2,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Send,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function TimetableDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user } = useStore();
  const role = user?.role || 'student';

  const resolvedParams = use(params);
  const timetableId = resolvedParams.id;

  const timetable =
    MOCK_TIMETABLES.find((t) => t.id === timetableId) || MOCK_TIMETABLES[0];

  const entries = timetable.entries?.length ? timetable.entries : MOCK_ENTRIES_SE_A;

  const [published, setPublished] = useState(timetable.status === 'published');

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape');

    // Header
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('CAMPUS CLOCK • ACADEMIC TIMETABLE', 14, 18);

    doc.setFontSize(12);
    doc.text(
      `Division: ${timetable.division?.name || 'SE-A'} | Term: ${timetable.academic_year} | Dept: ${timetable.department?.name || 'CMPN'}`,
      14,
      26
    );

    const headers = [['Slot / Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']];

    // Build row data
    const rows = [
      ['Slot 1 (09:00 - 10:00)', 'CSC401 (RK) [LH-301]', 'CSC403 (VP) [LH-301]', 'CSC404 (SM) [LH-301]', 'CSC402 (AS) [LH-301]', 'CSC403 (VP) [LH-301]'],
      ['Slot 2 (10:00 - 11:00)', 'CSC402 (AS) [LH-301]', 'CSC401 (RK) [LH-301]', 'CSC401 (RK) [LH-301]', 'CSC401 (RK) [LH-301]', 'CSC404 (SM) [LH-301]'],
      ['Slot 3 (11:00 - 12:00)', 'CSC403 (VP) [LH-301]', 'CSC402 (AS) [LH-301]', 'CSC402 (AS) [LH-301]', 'CSM405 (SM) [LH-301]', 'CSC402 (AS) [LH-301]'],
      ['Slot 4 (12:00 - 01:00)', 'CSC404 (SM) [LH-301]', 'CSC404 (SM) [LH-301]', 'CSC403 (VP) [LH-301]', 'Free Period', 'Free Period'],
      ['LUNCH BREAK (01:00 - 01:30)', '--- BREAK ---', '--- BREAK ---', '--- BREAK ---', '--- BREAK ---', '--- BREAK ---'],
      ['Slot 5 (01:30 - 02:30)', 'CSL401 Lab (RK) [L-101]', 'CSL402 Lab (AS) [L-102]', 'Free Period', 'Free Period', 'Free Period'],
      ['Slot 6 (02:30 - 03:30)', 'CSL401 Lab (RK) [L-101]', 'CSL402 Lab (AS) [L-102]', 'Free Period', 'Free Period', 'Free Period'],
      ['Slot 7 (03:30 - 04:30)', 'CSM405 (SM) [LH-301]', 'Free Period', 'Free Period', 'Free Period', 'Free Period'],
    ];

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 32,
      theme: 'grid',
      headStyles: { fillColor: [255, 217, 61], textColor: [0, 0, 0], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    doc.save(`CampusClock_${timetable.division?.name || 'Timetable'}.pdf`);
  };

  const handleExportExcel = () => {
    const wsData = [
      ['CAMPUS CLOCK - TIMETABLE REPORT'],
      [`Division: ${timetable.division?.name}`, `Term: ${timetable.academic_year}`],
      [],
      ['Slot', 'Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      ['1', '09:00 - 10:00', 'CSC401 (RK)', 'CSC403 (VP)', 'CSC404 (SM)', 'CSC402 (AS)', 'CSC403 (VP)'],
      ['2', '10:00 - 11:00', 'CSC402 (AS)', 'CSC401 (RK)', 'CSC401 (RK)', 'CSC401 (RK)', 'CSC404 (SM)'],
      ['3', '11:00 - 12:00', 'CSC403 (VP)', 'CSC402 (AS)', 'CSC402 (AS)', 'CSM405 (SM)', 'CSC402 (AS)'],
      ['4', '12:00 - 01:00', 'CSC404 (SM)', 'CSC404 (SM)', 'CSC403 (VP)', '-', '-'],
      ['Break', '01:00 - 01:30', 'LUNCH', 'LUNCH', 'LUNCH', 'LUNCH', 'LUNCH'],
      ['5', '01:30 - 02:30', 'CSL401 Lab (RK)', 'CSL402 Lab (AS)', '-', '-', '-'],
      ['6', '02:30 - 03:30', 'CSL401 Lab (RK)', 'CSL402 Lab (AS)', '-', '-', '-'],
      ['7', '03:30 - 04:30', 'CSM405 Tut (SM)', '-', '-', '-', '-'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timetable');
    XLSX.writeFile(wb, `CampusClock_${timetable.division?.name || 'Schedule'}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-3 border-black">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/timetable"
            className="p-2 rounded-xl border-2 border-black bg-white hover:bg-[#FFF5EB] nb-shadow-sm text-black"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
                {timetable.division?.name || 'Division Timetable'}
              </h1>
              <Badge color={published ? 'accent' : 'yellow'} size="sm">
                {published ? 'Published' : 'Draft'}
              </Badge>
            </div>
            <p className="text-xs md:text-sm font-bold text-black/70">
              Department of {timetable.department?.name} • Session {timetable.academic_year}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            icon={<FileDown className="w-4 h-4 stroke-[2.2]" />}
          >
            PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            icon={<FileDown className="w-4 h-4 stroke-[2.2]" />}
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

          {(role === 'hod' || role === 'management') && (
            <>
              <Link href={`/dashboard/editor/${timetable.id}`}>
                <Button variant="warning" size="sm" icon={<Edit3 className="w-4 h-4" />}>
                  Edit Grid
                </Button>
              </Link>

              {!published && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setPublished(true)}
                  icon={<Send className="w-4 h-4" />}
                >
                  Publish Now
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Timetable Grid */}
      <TimetableGrid
        entries={entries}
        title={`${timetable.division?.name || 'Class'} • Weekly Teaching Schedule`}
        subtitle="Mon to Fri • 7 Teaching Slots + Fixed Lunch Break"
      />
    </div>
  );
}

