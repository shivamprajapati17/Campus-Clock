import { NextResponse, type NextRequest } from 'next/server';
import { MOCK_NOTIFICATIONS } from '@/lib/data/mockData';

export async function GET() {
  return NextResponse.json({
    ok: true,
    data: MOCK_NOTIFICATIONS,
  });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      ok: true,
      message: 'Notification marked as read',
      data: body,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }
}

