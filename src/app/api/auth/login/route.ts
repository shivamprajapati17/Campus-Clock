import { NextResponse, type NextRequest } from 'next/server';
import { MOCK_USERS } from '@/lib/data/mockData';

export async function POST(request: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Request body must be valid JSON' },
      { status: 400 }
    );
  }

  try {
    const { email, password } = body;

    if (typeof email !== 'string' || !email || typeof password !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Only the seeded demo identities have a known password in the bundled
    // fixture. Everything else is rejected, so this endpoint can never mint a
    // session for an arbitrary address.
    const DEMO_PASSWORDS: Record<string, string> = {
      'management@campus.edu': 'admin123',
      'hod.cmpn@campus.edu': 'hod123',
      'teacher.mj@campus.edu': 'teach123',
      'teacher.a1@campus.edu': 'teach123',
      'student.a1@campus.edu': 'stud123',
    };

    const cleanEmail = email.trim().toLowerCase();
    const expectedPassword = DEMO_PASSWORDS[cleanEmail];

    const user = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (!user || !expectedPassword || expectedPassword !== password) {
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

