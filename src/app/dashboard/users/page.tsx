'use client';

import React, { useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useStore } from '@/store/useStore';
import { useMasterData } from '@/store/useMasterData';
import { resolveDepartmentId } from '@/lib/utils';
import type { User, UserRole } from '@/lib/types';
import {
  UserPlus,
  Trash2,
  Edit3,
  Search,
  AlertTriangle,
} from 'lucide-react';

/** Roles Management may hand out. */
const MANAGEMENT_ROLE_OPTIONS = [
  { label: 'HOD (Head of Department)', value: 'hod' },
  { label: 'Class Teacher / Faculty', value: 'teacher' },
  { label: 'Student (Read-Only)', value: 'student' },
  { label: 'Management (Dean / Admin)', value: 'management' },
];

/** HODs may only provision staff and students inside their own branch. */
const HOD_ROLE_OPTIONS = [
  { label: 'Class Teacher / Faculty', value: 'teacher' },
  { label: 'Student (Read-Only)', value: 'student' },
];

const EMPTY_FORM = {
  name: '',
  email: '',
  role: 'teacher' as UserRole,
  deptId: '',
  divisionId: '',
  initials: '',
};

export default function UserManagementPage() {
  const { user } = useStore();
  const role = user?.role;
  const isManagement = role === 'management';

  const directoryUsers = useMasterData((s) => s.directoryUsers);
  const departments = useMasterData((s) => s.departments);
  const divisions = useMasterData((s) => s.divisions);
  const addDirectoryUser = useMasterData((s) => s.addDirectoryUser);
  const updateDirectoryUser = useMasterData((s) => s.updateDirectoryUser);
  const deleteDirectoryUser = useMasterData((s) => s.deleteDirectoryUser);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);

  const roleOptions = isManagement ? MANAGEMENT_ROLE_OPTIONS : HOD_ROLE_OPTIONS;

  const scopeDepartmentId = isManagement
    ? null
    : resolveDepartmentId(
        departments,
        user?.department_id,
        user?.department_code
      );

  // Departments an operator may assign from.
  const assignableDepartments = useMemo(
    () =>
      scopeDepartmentId
        ? departments.filter((d) => d.id === scopeDepartmentId)
        : departments,
    [departments, scopeDepartmentId]
  );

  // The visible directory: HODs only see their own branch.
  const scopedUsers = useMemo(() => {
    if (!scopeDepartmentId) return directoryUsers;
    return directoryUsers.filter((u) => u.department_id === scopeDepartmentId);
  }, [directoryUsers, scopeDepartmentId]);

  const divisionsForDept = useMemo(() => {
    const deptId = form.deptId || assignableDepartments[0]?.id || '';
    return divisions.filter((d) => d.department_id === deptId);
  }, [divisions, form.deptId, assignableDepartments]);

  const openCreate = () => {
    setEditingId(null);
    setFormError('');
    setForm({
      ...EMPTY_FORM,
      role: isManagement ? 'teacher' : 'teacher',
      deptId: assignableDepartments[0]?.id ?? '',
      divisionId:
        divisions.find((d) => d.department_id === assignableDepartments[0]?.id)
          ?.id ?? '',
    });
    setIsModalOpen(true);
  };

  const openEdit = (target: User) => {
    setEditingId(target.id);
    setFormError('');
    setForm({
      name: target.name,
      email: target.email,
      role: target.role,
      deptId: target.department_id ?? '',
      divisionId: target.division_id ?? '',
      initials: target.faculty_initial ?? '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name) return setFormError('Full name is required.');
    if (!email) return setFormError('Institutional email is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setFormError('Enter a valid email address.');
    }

    const duplicate = directoryUsers.some(
      (u) => u.email.toLowerCase() === email && u.id !== editingId
    );
    if (duplicate) return setFormError('That email is already in the directory.');

    if (!isManagement && !scopeDepartmentId) {
      return setFormError(
        'Your account is not linked to a department, so you cannot provision users.'
      );
    }
    if (!isManagement && form.role === 'management') {
      return setFormError('Only Management can grant Management access.');
    }

    const needsDepartment = form.role !== 'management';
    const needsDivision =
      form.role === 'teacher' || form.role === 'student';

    const departmentId = needsDepartment
      ? form.deptId || assignableDepartments[0]?.id || null
      : null;

    if (needsDepartment && !departmentId) {
      return setFormError('Select a department for this user.');
    }

    const payload = {
      name,
      email,
      role: form.role,
      department_id: departmentId,
      division_id: needsDivision ? form.divisionId || null : null,
      faculty_initial:
        form.role === 'teacher' || form.role === 'hod'
          ? (form.initials.trim() || name.slice(0, 2)).toUpperCase()
          : null,
    };

    if (editingId) {
      updateDirectoryUser(editingId, payload);
    } else {
      addDirectoryUser({
        id: `user-${Date.now().toString(36)}`,
        ...payload,
        must_change_password: true,
        created_at: new Date().toISOString(),
      });
    }

    setIsModalOpen(false);
    setFormError('');
  };

  const filteredUsers = scopedUsers.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const deptNameOf = (deptId: string | null) => {
    const dept = departments.find((d) => d.id === deptId);
    return dept ? `${dept.name} (${dept.code})` : 'All Departments';
  };

  const divNameOf = (divId: string | null) =>
    divisions.find((d) => d.id === divId)?.name ?? null;

  return (
    <ProtectedRoute roles={['management', 'hod']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-3 border-black">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-black/60">
                Institutional Directory
              </span>
              <Badge color="primary" size="sm">
                Role Governance
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
              User & Permissions Management
            </h1>
            <p className="text-xs md:text-sm font-bold text-black/70">
              {isManagement
                ? 'Provision accounts for HODs, faculty members and students with role-level access control.'
                : 'Manage the faculty and students enrolled in your department.'}
            </p>
          </div>

          <Button
            variant="warning"
            onClick={openCreate}
            icon={<UserPlus className="w-5 h-5 stroke-[2.5]" />}
          >
            Provision User
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search user by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="nb-input py-2.5 pl-9 text-xs"
            />
            <Search className="w-4 h-4 text-black/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <span className="text-xs font-black uppercase text-black/60">
            {isManagement ? 'Total Enrolled' : 'In Your Department'}:{' '}
            {filteredUsers.length} Users
          </span>
        </div>

        {/* Users Table */}
        <Card className="p-0 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b-3 border-black bg-[#FFD54F]">
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black">
                    Name & Email
                  </th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black">
                    Assigned Role
                  </th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black">
                    Department
                  </th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black">
                    Division
                  </th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black">
                    Initials
                  </th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-xs font-bold text-black/50"
                    >
                      No users match this search.
                    </td>
                  </tr>
                )}

                {filteredUsers.map((u) => {
                  const divName = divNameOf(u.division_id);

                  return (
                    <tr key={u.id} className="hover:bg-[#F7FBF3] transition-colors">
                      <td className="p-3.5">
                        <span className="font-black text-sm text-black block">
                          {u.name}
                        </span>
                        <span className="text-xs font-bold text-black/60">
                          {u.email}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <Badge color={u.role} size="sm">
                          {u.role}
                        </Badge>
                      </td>

                      <td className="p-3.5 text-xs font-bold text-black/80">
                        {deptNameOf(u.department_id)}
                      </td>

                      <td className="p-3.5 text-xs font-bold text-black/80">
                        {divName ?? '—'}
                      </td>

                      <td className="p-3.5">
                        {u.faculty_initial ? (
                          <span className="px-2 py-0.5 rounded-md border border-black bg-[#4DB6AC] text-xs font-black text-black">
                            {u.faculty_initial}
                          </span>
                        ) : (
                          <span className="text-xs text-black/40">—</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(u)}
                            className="p-1.5 rounded-lg border-2 border-black bg-white hover:bg-[#FFD54F] transition-colors cursor-pointer"
                            title="Edit user"
                            aria-label={`Edit ${u.name}`}
                          >
                            <Edit3 className="w-4 h-4 stroke-[2.2]" />
                          </button>

                          <button
                            onClick={() => setPendingDelete(u)}
                            className="p-1.5 rounded-lg border-2 border-black bg-white hover:bg-[#BF360C] hover:text-white transition-colors cursor-pointer"
                            title="Delete user"
                            aria-label={`Delete ${u.name}`}
                          >
                            <Trash2 className="w-4 h-4 stroke-[2.2]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Provision / Edit User Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? 'Edit Campus User' : 'Provision New Campus User'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="p-3 rounded-xl border-2 border-black/15 bg-[#F7FBF3] text-[11px] font-bold text-black/65">
              This adds the person to the campus directory so they appear in
              timetables, class lists and this portal. Sign-in credentials are
              issued separately by your IT administrator.
            </p>

            <Input
              label="Full Name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Dr. Priya Sharma"
            />

            <Input
              label="Institutional Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="e.g. priya.sharma@campus.edu"
            />

            <Dropdown
              label="System Role"
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({ ...f, role: e.target.value as UserRole }))
              }
              options={roleOptions}
            />

            {form.role !== 'management' && (
              <Dropdown
                label="Department Assignment"
                value={form.deptId || assignableDepartments[0]?.id || ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    deptId: e.target.value,
                    divisionId: '',
                  }))
                }
                options={assignableDepartments.map((d) => ({
                  label: `${d.name} (${d.code})`,
                  value: d.id,
                }))}
              />
            )}

            {(form.role === 'teacher' || form.role === 'hod') && (
              <Input
                label="Faculty Code / Initials"
                value={form.initials}
                onChange={(e) =>
                  setForm((f) => ({ ...f, initials: e.target.value }))
                }
                placeholder="e.g. PS"
                maxLength={4}
              />
            )}

            {(form.role === 'student' || form.role === 'teacher') && (
              <Dropdown
                label="Class Division"
                value={form.divisionId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, divisionId: e.target.value }))
                }
                options={[
                  { label: 'Not assigned', value: '' },
                  ...divisionsForDept.map((div) => ({
                    label: `${div.name} • Sem ${div.semester}`,
                    value: div.id,
                  })),
                ]}
              />
            )}

            {formError && (
              <div className="p-3 rounded-xl border-2 border-[#BF360C] bg-[#FFEBEE] text-xs font-black text-[#BF360C]">
                {formError}
              </div>
            )}

            <div className="pt-4 border-t-2 border-black/10 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="warning">
                {editingId ? 'Save Changes' : 'Save User'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <Modal
          isOpen={pendingDelete !== null}
          onClose={() => setPendingDelete(null)}
          title="Remove Campus User"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-[#BF360C] border-2 border-black flex items-center justify-center text-white">
                <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <p className="text-sm font-bold text-black/80">
                Remove{' '}
                <span className="font-black">{pendingDelete?.name}</span> from
                the campus directory? Existing timetable assignments keep their
                record, but the person will no longer be listed here.
              </p>
            </div>

            <div className="pt-4 border-t-2 border-black/10 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPendingDelete(null)}>
                Keep user
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (pendingDelete) deleteDirectoryUser(pendingDelete.id);
                  setPendingDelete(null);
                }}
                icon={<Trash2 className="w-4 h-4" />}
              >
                Remove
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
