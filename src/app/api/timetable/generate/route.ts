import { NextResponse, type NextRequest } from 'next/server';
import {
  MOCK_DIVISIONS,
  MOCK_SUBJECTS,
  MOCK_FACULTY,
  MOCK_ROOMS,
} from '@/lib/data/mockData';
import { generateTimetable } from '@/lib/generator/engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { division_id } = body;

    const division =
      MOCK_DIVISIONS.find((d) => d.id === division_id) || MOCK_DIVISIONS[0];

    const assignments = [
      { subject: MOCK_SUBJECTS[0], faculty: MOCK_FACULTY[1] },
      { subject: MOCK_SUBJECTS[1], faculty: MOCK_FACULTY[0] },
      { subject: MOCK_SUBJECTS[2], faculty: MOCK_FACULTY[2] },
      { subject: MOCK_SUBJECTS[3], faculty: MOCK_FACULTY[3] },
      { subject: MOCK_SUBJECTS[4], faculty: MOCK_FACULTY[1] },
      { subject: MOCK_SUBJECTS[5], faculty: MOCK_FACULTY[0] },
      { subject: MOCK_SUBJECTS[6], faculty: MOCK_FACULTY[3] },
    ];

    const result = generateTimetable({
      division,
      assignments,
      rooms: MOCK_ROOMS,
    });

    return NextResponse.json({
      ok: true,
      data: result,
    });
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

