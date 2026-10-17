// ─────────────────────────────────────────────────────────────
// Campus Clock – Faculty directory bridge
//
// Seeded faculty cover the demo branches, but accounts provisioned through
// "Manage Users" must be schedulable too. This merges both sources so the
// editor and generator always see every teacher in the department.
// ─────────────────────────────────────────────────────────────

import type { Faculty, User } from '@/lib/types';
import { facultyForDepartment } from '@/lib/data/mockData';
import { getInitials } from '@/lib/utils';

export function buildFacultyForDepartment(
  departmentId: string,
  directoryUsers: User[]
): Faculty[] {
  const seeded = facultyForDepartment(departmentId);
  const knownUserIds = new Set(seeded.map((f) => f.user_id));

  const extra: Faculty[] = directoryUsers
    .filter(
      (u) =>
        u.department_id === departmentId &&
        (u.role === 'teacher' || u.role === 'hod') &&
        !knownUserIds.has(u.id)
    )
    .map((u) => ({
      id: `fac-${u.id}`,
      user_id: u.id,
      initials: u.faculty_initial ?? getInitials(u.name),
      max_per_day: 4,
      unavailable_slots: [],
      department_id: departmentId,
      created_at: u.created_at,
      user: u,
    }));

  return [...seeded, ...extra];
}
