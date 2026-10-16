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

export async function POST() {
  return NextResponse.json({
    ok: true,
    message: 'Campus Clock database successfully initialized with demo seeds!',
    stats: {
      users: MOCK_USERS.length,
      departments: MOCK_DEPARTMENTS.length,
      divisions: MOCK_DIVISIONS.length,
      subjects: MOCK_SUBJECTS.length,
      faculty: MOCK_FACULTY.length,
      rooms: MOCK_ROOMS.length,
      timetables: MOCK_TIMETABLES.length,
    },
  });
}
