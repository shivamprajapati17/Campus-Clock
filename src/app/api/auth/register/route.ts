import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  let body: {
    name?: unknown;
    email?: unknown;
    role?: unknown;
    department_id?: string | null;
    division_id?: string | null;
    faculty_initial?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Request body must be valid JSON' },
      { status: 400 }
    );
  }

  try {
    const { name, email, role, department_id, division_id, faculty_initial } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        { ok: false, error: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    // Self-service registration never grants elevated roles. HOD and
    // Management accounts are provisioned by the college.
    if (role === 'management' || role === 'hod') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Management and HOD accounts must be provisioned by the college.',
        },
        { status: 403 }
      );
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      department_id: department_id || null,
      division_id: division_id || null,
      faculty_initial: faculty_initial || null,
      must_change_password: true,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      ok: true,
      data: newUser,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}

