'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import {
  MOCK_TIMETABLES,
  MOCK_ENTRIES_SE_A,
} from '@/lib/data/mockData';
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  Printer,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

function ExportCenterContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || MOCK_TIMETABLES[0].id;

  const [selectedTimetableId, setSelectedTimetableId] = useState(initialId);
  const [format, setFormat] = useState<'pdf' | 'excel' | 'json'>('pdf');
  const [downloaded, setDownloaded] = useState(false);

  const timetable =
    MOCK_TIMETABLES.find((t) => t.id === selectedTimetableId) || MOCK_TIMETABLES[0];

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);

    if (format === 'pdf') {
      const doc = new jsPDF('landscape');
      doc.setFontSize(18);
      doc.text('CAMPUS CLOCK • OFFICIAL ACADEMIC TIMETABLE', 14, 18);
      doc.setFontSize(11);
      doc.text(
        `Division: ${timetable.division?.name} | Term: ${timetable.academic_year} | Dept: ${timetable.department?.name}`,
        14,
        26
      );

      const headers = [['Slot / Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']];
      const rows = [
        ['Slot 1 (09:00 - 10:00)', 'CSC401 (RK) [LH-301]', 'CSC403 (VP) [LH-301]', 'CSC404 (SM) [LH-301]', 'CSC402 (AS) [LH-301]', 'CSC403 (VP) [LH-301]'],
        ['Slot 2 (10:00 - 11:00)', 'CSC402 (AS) [LH-301]', 'CSC401 (RK) [LH-301]', 'CSC401 (RK) [LH-301]', 'CSC401 (RK) [LH-301]', 'CSC404 (SM) [LH-301]'],
        ['Slot 3 (11:00 - 12:00)', 'CSC403 (VP) [LH-301]', 'CSC402 (AS) [LH-301]', 'CSC402 (AS) [LH-301]', 'CSM405 (SM) [LH-301]', 'CSC402 (AS) [LH-301]'],
        ['Slot 4 (12:00 - 01:00)', 'CSC404 (SM) [LH-301]', 'CSC404 (SM) [LH-301]', 'CSC403 (VP) [LH-301]', 'Free', 'Free'],
        ['LUNCH BREAK', '--- LUNCH ---', '--- LUNCH ---', '--- LUNCH ---', '--- LUNCH ---', '--- LUNCH ---'],
        ['Slot 5 (01:30 - 02:30)', 'CSL401 Lab (RK) [L-101]', 'CSL402 Lab (AS) [L-102]', 'Free', 'Free', 'Free'],
        ['Slot 6 (02:30 - 03:30)', 'CSL401 Lab (RK) [L-101]', 'CSL402 Lab (AS) [L-102]', 'Free', 'Free', 'Free'],
        ['Slot 7 (03:30 - 04:30)', 'CSM405 (SM) [LH-301]', 'Free', 'Free', 'Free', 'Free'],
      ];

      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 32,
        theme: 'grid',
        headStyles: { fillColor: [255, 217, 61], textColor: [0, 0, 0], fontStyle: 'bold' },
      });

      doc.save(`CampusClock_${timetable.division?.name}.pdf`);
    } else if (format === 'excel') {
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
      XLSX.writeFile(wb, `CampusClock_${timetable.division?.name}.xlsx`);
    } else {
      // JSON Export
      const blob = new Blob([JSON.stringify(timetable, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CampusClock_${timetable.division?.name}.json`;
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-3 border-black">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-black/60">
              Distribution Suite
            </span>
            <Badge color="accent" size="sm">
              Universal Formats
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
            Export & Publishing Center
          </h1>
          <p className="text-xs md:text-sm font-bold text-black/70">
            Export high-resolution PDFs with college letterheads, Excel sheets, and JSON schemas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Formats & Setup */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 bg-white space-y-5">
            <Dropdown
              label="Select Target Timetable"
              value={selectedTimetableId}
              onChange={(e) => setSelectedTimetableId(e.target.value)}
              options={MOCK_TIMETABLES.map((t) => ({
                label: `${t.division?.name} (${t.department?.code}) • ${t.status}`,
                value: t.id,
              }))}
            />

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-black block mb-2">
                Choose Export Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat('pdf')}
                  className={`p-3.5 rounded-xl border-2 border-black flex flex-col items-center gap-1.5 transition-all cursor-pointer font-black text-xs uppercase ${
                    format === 'pdf'
                      ? 'bg-[#FF5D5D] text-white nb-shadow-sm -translate-y-0.5'
                      : 'bg-[#FDF6EC] text-black hover:bg-white'
                  }`}
                >
                  <FileText className="w-5 h-5 stroke-[2.2]" />
                  <span>PDF Doc</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('excel')}
                  className={`p-3.5 rounded-xl border-2 border-black flex flex-col items-center gap-1.5 transition-all cursor-pointer font-black text-xs uppercase ${
                    format === 'excel'
                      ? 'bg-[#2DD4BF] text-black nb-shadow-sm -translate-y-0.5'
                      : 'bg-[#FDF6EC] text-black hover:bg-white'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5 stroke-[2.2]" />
                  <span>Excel XLSX</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('json')}
                  className={`p-3.5 rounded-xl border-2 border-black flex flex-col items-center gap-1.5 transition-all cursor-pointer font-black text-xs uppercase ${
                    format === 'json'
                      ? 'bg-[#FFD93D] text-black nb-shadow-sm -translate-y-0.5'
                      : 'bg-[#FDF6EC] text-black hover:bg-white'
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
              className="w-full mt-4"
              icon={<FileDown className="w-5 h-5 stroke-[2.5]" />}
            >
              {downloaded ? 'Downloaded Successfully!' : `Download ${format.toUpperCase()}`}
            </Button>
          </Card>
        </div>

        {/* Right Column: Live Document Preview */}
        <div className="lg:col-span-7">
          <Card className="p-6 bg-white border-3 border-black">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
              <span className="text-xs font-black uppercase text-black">
                Document Preview ({format.toUpperCase()})
              </span>
              <span className="text-xs font-bold text-black/60">
                Ready for Print / Distribution
              </span>
            </div>

            <div className="p-6 rounded-xl border-2 border-dashed border-black/30 bg-[#FFFBEB] text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#FFD93D] border-2 border-black nb-shadow flex items-center justify-center mx-auto text-black">
                {format === 'pdf' ? (
                  <FileText className="w-8 h-8" />
                ) : format === 'excel' ? (
                  <FileSpreadsheet className="w-8 h-8" />
                ) : (
                  <FileDown className="w-8 h-8" />
                )}
              </div>

              <h4 className="text-base font-black uppercase text-black">
                {timetable.division?.name} Timetable
              </h4>
              <p className="text-xs font-bold text-black/70 max-w-sm mx-auto">
                Includes full Mon–Fri 7 slot matrix, practical lab assignments, room numbers, and faculty codes.
              </p>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  icon={<Printer className="w-4 h-4" />}
                >
                  Send to Printer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ExportCenterPage() {
  return (
    <Suspense fallback={<div className="font-black p-8">Loading Export Center...</div>}>
      <ExportCenterContent />
    </Suspense>
  );
}
