import { NextResponse } from 'next/server';
import {
  MOCK_USERS,
  MOCK_DEPARTMENTS,
  MOCK_DIVISIONS,
  MOCK_SUBJECTS,
  MOCK_FACULTY,
  MOCK_ROOMS,
  MOCK_TIMETABLES,
} from '@/lib/data/mockData';
import { validateTimetable } from '@/lib/generator/validator';

export async function POST() {
  // The demo dataset ships with the app; this endpoint reports what is loaded
  // rather than pretending to write to a database.
  return NextResponse.json({
    ok: true,
    message: 'Campus Clock demo dataset is loaded in memory.',
    stats: {
      users: MOCK_USERS.length,
      departments: MOCK_DEPARTMENTS.length,
      divisions: MOCK_DIVISIONS.length,
      subjects: MOCK_SUBJECTS.length,
      faculty: MOCK_FACULTY.length,
      rooms: MOCK_ROOMS.length,
      timetables: MOCK_TIMETABLES.length,
    },
    timetables: MOCK_TIMETABLES.map((t) => ({
      id: t.id,
      division: t.division?.name ?? t.division_id,
      status: t.status,
      entries: t.entries?.length ?? 0,
      clashes: validateTimetable(t.entries ?? []).length,
    })),
  });
}

