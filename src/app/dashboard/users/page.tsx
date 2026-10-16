'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  MOCK_USERS,
  MOCK_DEPARTMENTS,
  MOCK_DIVISIONS,
} from '@/lib/data/mockData';
import type { User, UserRole } from '@/lib/types';
import {
  UserPlus,
  Trash2,
  Edit,
  Shield,
  Search,
  CheckCircle2,
} from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [deptId, setDeptId] = useState(MOCK_DEPARTMENTS[0].id);
  const [divId, setDivId] = useState(MOCK_DIVISIONS[0].id);
  const [initials, setInitials] = useState('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      department_id: role === 'management' ? null : deptId,
      division_id: role === 'student' || role === 'teacher' ? divId : null,
      faculty_initial: role === 'teacher' || role === 'hod' ? initials || name.slice(0, 2).toUpperCase() : null,
      must_change_password: true,
      created_at: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setIsModalOpen(false);

    // Reset fields
    setName('');
    setEmail('');
    setInitials('');
  };

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <ProtectedRoute roles={['management']}>
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
              Provision accounts for HODs, faculty members, and students with role-level access control.
            </p>
          </div>

          <Button
            variant="warning"
            onClick={() => setIsModalOpen(true)}
            icon={<UserPlus className="w-5 h-5 stroke-[2.5]" />}
          >
            Provision User
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
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
            Total Enrolled: {filteredUsers.length} Users
          </span>
        </div>

        {/* Users Table */}
        <Card className="p-0 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b-3 border-black bg-[#FFD93D]">
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
                    Faculty Initials
                  </th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {filteredUsers.map((u) => {
                  const dept = MOCK_DEPARTMENTS.find(
                    (d) => d.id === u.department_id
                  );

                  return (
                    <tr key={u.id} className="hover:bg-[#FFFBEB] transition-colors">
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
                        {dept ? `${dept.name} (${dept.code})` : 'All Departments'}
                      </td>

                      <td className="p-3.5">
                        {u.faculty_initial ? (
                          <span className="px-2 py-0.5 rounded-md border border-black bg-[#2DD4BF] text-xs font-black text-black">
                            {u.faculty_initial}
                          </span>
                        ) : (
                          <span className="text-xs text-black/40">—</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg border-2 border-black bg-white hover:bg-[#FF5D5D] hover:text-white transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2.2]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Provision User Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Provision New Campus User"
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            <Input
              label="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Priya Sharma"
            />

            <Input
              label="Institutional Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. priya.sharma@campus.edu"
            />

            <Dropdown
              label="System Role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={[
                { label: 'HOD (Head of Department)', value: 'hod' },
                { label: 'Class Teacher / Faculty', value: 'teacher' },
                { label: 'Student (Read-Only)', value: 'student' },
                { label: 'Management (Dean / Admin)', value: 'management' },
              ]}
            />

            {role !== 'management' && (
              <Dropdown
                label="Department Assignment"
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
                options={MOCK_DEPARTMENTS.map((d) => ({
                  label: `${d.name} (${d.code})`,
                  value: d.id,
                }))}
              />
            )}

            {(role === 'teacher' || role === 'hod') && (
              <Input
                label="Faculty Code / Initials"
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
                placeholder="e.g. PS"
                maxLength={4}
              />
            )}

            {(role === 'student' || role === 'teacher') && (
              <Dropdown
                label="Class Division"
                value={divId}
                onChange={(e) => setDivId(e.target.value)}
                options={MOCK_DIVISIONS.map((div) => ({
                  label: div.name,
                  value: div.id,
                }))}
              />
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
                Save & Grant Access
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
