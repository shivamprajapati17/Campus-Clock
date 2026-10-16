import { NextResponse, type NextRequest } from 'next/server';
import { MOCK_TIMETABLES } from '@/lib/data/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deptId = searchParams.get('department_id');
  const divId = searchParams.get('division_id');
  const status = searchParams.get('status');

  let list = [...MOCK_TIMETABLES];

  if (deptId) list = list.filter((t) => t.department_id === deptId);
  if (divId) list = list.filter((t) => t.division_id === divId);
  if (status) list = list.filter((t) => t.status === status);

  return NextResponse.json({
    ok: true,
    data: list,
  });
}
