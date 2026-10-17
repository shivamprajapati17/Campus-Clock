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
  let body: { text?: unknown; sender_name?: string; sender_role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Request body must be valid JSON' },
      { status: 400 }
    );
  }

  try {
    const { roomId } = await params;
    const { text, sender_name, sender_role } = body;

    if (typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Message text is required' },
        { status: 400 }
      );
    }

    if (text.length > 2000) {
      return NextResponse.json(
        { ok: false, error: 'Message is too long (max 2000 characters)' },
        { status: 413 }
      );
    }

    const newMsg = {
      id: `msg-${Date.now()}`,
      room_id: roomId,
      sender_id: 'user-curr',
      text: text.trim(),
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
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Failed to post message',
      },
      { status: 500 }
    );
  }
}

