import { NextResponse, type NextRequest } from 'next/server';
import { MOCK_USERS } from '@/lib/data/mockData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, department_id, division_id, faculty_initial } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        { ok: false, error: 'Name, email, and role are required' },
        { status: 400 }
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
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}

