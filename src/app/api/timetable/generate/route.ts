import { NextResponse, type NextRequest } from 'next/server';
import {
  MOCK_DIVISIONS,
  MOCK_ROOMS,
  subjectsForDepartment,
  facultyForDepartment,
} from '@/lib/data/mockData';
import { generateTimetable } from '@/lib/generator/engine';

export async function POST(request: NextRequest) {
  let body: { division_id?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Request body must be valid JSON' },
      { status: 400 }
    );
  }

  try {
    const { division_id } = body;

    if (typeof division_id !== 'string' || !division_id) {
      return NextResponse.json(
        { ok: false, error: 'division_id is required' },
        { status: 400 }
      );
    }

    const division = MOCK_DIVISIONS.find((d) => d.id === division_id);
    if (!division) {
      return NextResponse.json(
        { ok: false, error: 'Division not found' },
        { status: 404 }
      );
    }

    const subjects = subjectsForDepartment(division.department_id);
    const faculty = facultyForDepartment(division.department_id);

    if (subjects.length === 0 || faculty.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'This branch has no subjects or faculty configured, so a timetable cannot be generated.',
        },
        { status: 422 }
      );
    }

    const assignments = subjects.map((subject, index) => ({
      subject,
      faculty: faculty[index % faculty.length],
    }));

    const result = generateTimetable({
      division,
      assignments,
      rooms: MOCK_ROOMS,
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Generation failed',
      },
      { status: 500 }
    );
  }
}
