import { NextResponse, type NextRequest } from 'next/server';
import { MOCK_MESSAGES } from '@/lib/data/mockData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const filtered = MOCK_MESSAGES.filter((m) => m.room_id === roomId);

  return NextResponse.json({
    ok: true,
    data: filtered,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { text, sender_name, sender_role } = body;

    const newMsg = {
      id: `msg-${Date.now()}`,
      room_id: roomId,
      sender_id: 'user-curr',
      text,
      created_at: new Date().toISOString(),
      sender: {
        name: sender_name || 'Anonymous',
        role: sender_role || 'student',
      },
    };

    return NextResponse.json({
      ok: true,
      data: newMsg,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
