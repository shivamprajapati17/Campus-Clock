// ─────────────────────────────────────────────────────────────
// Campus Clock – Timetable Exports
//
// One source of truth for the PDF, Excel and JSON exports, so the file an
// operator downloads always matches the grid they are looking at — including
// per-day breaks and parallel batch sessions.
// ─────────────────────────────────────────────────────────────

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { DAYS, SLOTS, type Timetable, type TimetableEntry } from '@/lib/types';

/** Human label for one entry, e.g. "CSC401 · RK · LH-301 · B1". */
function entryLabel(entry: TimetableEntry): string {
  const code = entry.subject?.code ?? 'Subject';
  const initials = entry.faculty?.initials ?? 'FAC';
  const room = entry.room?.number ?? 'Room';
  const batch = entry.batch ? ` · ${entry.batch}` : '';
  return `${code} · ${initials} · ${room}${batch}`;
}

function cellLabel(timetable: Timetable, day: number, slot: number): string {
  const isBreak = (timetable.breaks ?? []).some(
    (b) => b.day === day && b.slot === slot
  );
  if (isBreak) return '— Break —';

  const entries = (timetable.entries ?? []).filter(
    (e) => e.day === day && e.slot === slot
  );
  if (entries.length === 0) return '— Free —';
  return entries.map(entryLabel).join('\n');
}

/** The full Mon–Fri × 8-period matrix. */
export function timetableMatrix(timetable: Timetable): string[][] {
  const rows: string[][] = [];

  for (let slot = 1; slot <= 8; slot += 1) {
    const info = SLOTS[slot];
    rows.push([
      `P${slot} (${info.start} - ${info.end})`,
      ...[1, 2, 3, 4, 5].map((day) => cellLabel(timetable, day, slot)),
    ]);
  }

  return rows;
}

function fileStem(timetable: Timetable): string {
  const division = (timetable.division?.name ?? 'Timetable')
    .replace(/[^\w-]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const dept = timetable.department?.code ?? 'CAMPUS';
  return `CampusClock_${dept}_${division}`;
}

export function exportTimetablePdf(timetable: Timetable): void {
  const doc = new jsPDF('landscape');

  doc.setFontSize(17);
  doc.setTextColor(27, 46, 31);
  doc.text('CAMPUS CLOCK • GROW YOUR PERFECT SCHEDULE 🌱', 14, 16);

  doc.setFontSize(10);
  doc.setTextColor(46, 125, 50);
  doc.text(
    [
      `Division: ${timetable.division?.name ?? '—'}`,
      `Department: ${timetable.department?.name ?? '—'} (${timetable.department?.code ?? '—'})`,
      `Term: ${timetable.academic_year}`,
      `Status: ${timetable.status.toUpperCase()}`,
    ].join('   |   '),
    14,
    24
  );

  autoTable(doc, {
    head: [['Period / Time', ...Object.values(DAYS)]],
    body: timetableMatrix(timetable),
    startY: 30,
    theme: 'grid',
    headStyles: {
      fillColor: [46, 125, 50],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    bodyStyles: { textColor: [27, 46, 31] },
    alternateRowStyles: { fillColor: [241, 248, 233] },
    styles: { fontSize: 8, cellPadding: 3.2, overflow: 'linebreak' },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 42 } },
  });

  doc.save(`${fileStem(timetable)}.pdf`);
}

export function exportTimetableExcel(timetable: Timetable): void {
  const wsData: (string | number)[][] = [
    ['CAMPUS CLOCK - OFFICIAL TIMETABLE'],
    [`Division: ${timetable.division?.name ?? '—'}`],
    [`Department: ${timetable.department?.name ?? '—'} (${timetable.department?.code ?? '—'})`],
    [`Term: ${timetable.academic_year}`],
    [`Status: ${timetable.status}`],
    [],
    ['Period', 'Time', ...Object.values(DAYS)],
  ];

  for (let slot = 1; slot <= 8; slot += 1) {
    const info = SLOTS[slot];
    wsData.push([
      `P${slot}`,
      `${info.start} - ${info.end}`,
      ...[1, 2, 3, 4, 5].map((day) => cellLabel(timetable, day, slot)),
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 8 },
    { wch: 16 },
    ...Array.from({ length: 5 }, () => ({ wch: 34 })),
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Timetable');
  XLSX.writeFile(wb, `${fileStem(timetable)}.xlsx`);
}

export function exportTimetableJson(timetable: Timetable): void {
  const blob = new Blob([JSON.stringify(timetable, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${fileStem(timetable)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
