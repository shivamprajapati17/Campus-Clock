import { NextResponse, type NextRequest } from 'next/server';
import { MOCK_FACULTY, MOCK_ENTRIES_SE_A } from '@/lib/data/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const day = parseInt(searchParams.get('day') || '1', 10);
  const slot = parseInt(searchParams.get('slot') || '1', 10);

  if (!Number.isInteger(day) || day < 1 || day > 5) {
    return NextResponse.json(
      { ok: false, error: 'day must be an integer from 1 to 5' },
      { status: 400 }
    );
  }

  if (!Number.isInteger(slot) || slot < 1 || slot > 7) {
    return NextResponse.json(
      { ok: false, error: 'slot must be an integer from 1 to 7' },
      { status: 400 }
    );
  }

  const busyIds = new Set<string>();
  MOCK_ENTRIES_SE_A.forEach((e) => {
    if (e.day === day && e.slot === slot) {
      busyIds.add(e.faculty_id);
    }
  });

  const freeFaculty = MOCK_FACULTY.filter((f) => !busyIds.has(f.id));

  return NextResponse.json({
    ok: true,
    data: {
      day,
      slot,
      freeFaculty,
      totalFree: freeFaculty.length,
    },
  });
}

