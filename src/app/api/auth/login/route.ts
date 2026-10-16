import { NextResponse, type NextRequest } from 'next/server';
import { MOCK_USERS } from '@/lib/data/mockData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json(
        { ok: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      data: {
        user,
        token: `jwt_token_${user.id}_${Date.now()}`,
      },
    });

    // Set demo auth cookie
    response.cookies.set(
      'campus_clock_demo_user',
      encodeURIComponent(JSON.stringify(user)),
      {
        path: '/',
        maxAge: 604800,
        sameSite: 'lax',
      }
    );

    return response;
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}

