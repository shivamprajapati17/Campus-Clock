'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Modal } from '@/components/ui/Modal';
import { useStore } from '@/store/useStore';
import { useMasterData } from '@/store/useMasterData';
import { useTimetableData } from '@/store/useTimetableData';
import { resolveDepartmentId } from '@/lib/utils';
import { MOCK_FACULTY } from '@/lib/data/mockData';
import { validateTimetable } from '@/lib/generator/validator';
import type { Department, Division } from '@/lib/types';
import {
  Building,
  Users,
  Eye,
  Edit3,
  Plus,
  Trash2,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

/** Empty form values, kept outside the component so they stay referentially stable. */
const EMPTY_DEPT_FORM = { name: '', code: '', hod_id: '' };
const EMPTY_DIV_FORM = {
  name: '',
  semester: '4',
  strength: '60',
  class_teacher_id: '',
};

type DeptForm = typeof EMPTY_DEPT_FORM;
type DivForm = typeof EMPTY_DIV_FORM;

export default function MasterViewPage() {
  const { user } = useStore();
  const role = user?.role;

  const departments = useMasterData((s) => s.departments);
  const divisions = useMasterData((s) => s.divisions);
  const directoryUsers = useMasterData((s) => s.directoryUsers);
  const timetables = useTimetableData((s) => s.timetables);
  const deleteTimetable = useTimetableData((s) => s.deleteTimetable);
  const addDepartment = useMasterData((s) => s.addDepartment);
  const updateDepartment = useMasterData((s) => s.updateDepartment);
  const deleteDepartment = useMasterData((s) => s.deleteDepartment);
  const addDivision = useMasterData((s) => s.addDivision);
  const updateDivision = useMasterData((s) => s.updateDivision);
  const deleteDivision = useMasterData((s) => s.deleteDivision);
  const resetToSeed = useMasterData((s) => s.resetToSeed);

  const canManageDepartments = role === 'management';
  const canManageDivisions = role === 'management' || role === 'hod';

  // Hoisted so the memo's dependency list matches what the callback actually
  // reads — the React Compiler needs an inferred dependency it can match.
  // Supabase accounts carry a database UUID, so this also matches on branch code.
  const userDepartmentId = resolveDepartmentId(
    departments,
    user?.department_id,
    user?.department_code
  );

  // An HOD only ever sees their own branch; Management sees the whole campus.
  const visibleDepartments = useMemo(() => {
    if (role === 'hod' && userDepartmentId) {
      return departments.filter((d) => d.id === userDepartmentId);
    }
    return departments;
  }, [departments, role, userDepartmentId]);

  const [selectedDeptId, setSelectedDeptId] = useState('');
  const activeDept =
    visibleDepartments.find((d) => d.id === selectedDeptId) ??
    visibleDepartments[0];

  const activeDeptId = activeDept?.id ?? '';

  const deptDivisions = useMemo(
    () => divisions.filter((div) => div.department_id === activeDeptId),
    [divisions, activeDeptId]
  );

  const deptTimetables = useMemo(
    () => timetables.filter((t) => t.department_id === activeDeptId),
    [timetables, activeDeptId]
  );

  // Live compliance figure instead of a hardcoded "All Green" badge.
  const deptClashes = useMemo(
    () =>
      deptTimetables.reduce(
        (total, t) => total + validateTimetable(t.entries ?? []).length,
        0
      ),
    [deptTimetables]
  );

  const campusClashes = useMemo(
    () =>
      timetables.reduce(
        (total, t) => total + validateTimetable(t.entries ?? []).length,
        0
      ),
    [timetables]
  );

  const hods = useMemo(
    () => directoryUsers.filter((u) => u.role === 'hod'),
    [directoryUsers]
  );
  const classTeachers = useMemo(
    () => directoryUsers.filter((u) => u.role === 'teacher'),
    [directoryUsers]
  );

  const userById = useMemo(() => {
    const map = new Map(directoryUsers.map((u) => [u.id, u]));
    return map;
  }, [directoryUsers]);

  // ── Department form ──────────────────────────────────────
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptForm, setDeptForm] = useState<DeptForm>(EMPTY_DEPT_FORM);

  // ── Division form ────────────────────────────────────────
  const [divModalOpen, setDivModalOpen] = useState(false);
  const [editingDivId, setEditingDivId] = useState<string | null>(null);
  const [divForm, setDivForm] = useState<DivForm>(EMPTY_DIV_FORM);

  const [formError, setFormError] = useState('');

  // ── Delete confirmation ──────────────────────────────────
  const [pendingDelete, setPendingDelete] = useState<{
    kind: 'department' | 'division';
    id: string;
    name: string;
  } | null>(null);

  const openCreateDept = () => {
    setEditingDeptId(null);
    setDeptForm(EMPTY_DEPT_FORM);
    setFormError('');
    setDeptModalOpen(true);
  };

  const openEditDept = (dept: Department) => {
    setEditingDeptId(dept.id);
    setDeptForm({
      name: dept.name,
      code: dept.code,
      hod_id: dept.hod_id ?? '',
    });
    setFormError('');
    setDeptModalOpen(true);
  };

  const handleSubmitDept = (e: React.FormEvent) => {
    e.preventDefault();

    const name = deptForm.name.trim();
    const code = deptForm.code.trim().toUpperCase();

    if (!name) return setFormError('Department name is required.');
    if (!code) return setFormError('Department code is required.');

    const duplicate = departments.some(
      (d) => d.code.toUpperCase() === code && d.id !== editingDeptId
    );
    if (duplicate) {
      return setFormError(`The code "${code}" is already used by another branch.`);
    }

    if (editingDeptId) {
      updateDepartment(editingDeptId, {
        name,
        code,
        hod_id: deptForm.hod_id || null,
      });
    } else {
      const created = addDepartment({
        name,
        code,
        hod_id: deptForm.hod_id || null,
      });
      setSelectedDeptId(created.id);
    }

    setDeptModalOpen(false);
    setFormError('');
  };

  const openCreateDiv = () => {
    setEditingDivId(null);
    setDivForm(EMPTY_DIV_FORM);
    setFormError('');
    setDivModalOpen(true);
  };

  const openEditDiv = (div: Division) => {
    setEditingDivId(div.id);
    setDivForm({
      name: div.name,
      semester: String(div.semester),
      strength: String(div.strength),
      class_teacher_id: div.class_teacher_id ?? '',
    });
    setFormError('');
    setDivModalOpen(true);
  };

  const handleSubmitDiv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDeptId) return;

    const name = divForm.name.trim();
    const semester = Number(divForm.semester);
    const strength = Number(divForm.strength);

    if (!name) return setFormError('Division name is required.');
    if (!SEMESTERS.includes(semester)) {
      return setFormError('Semester must be between 1 and 8.');
    }
    if (!Number.isFinite(strength) || strength < 1 || strength > 500) {
      return setFormError('Class strength must be between 1 and 500 students.');
    }

    const duplicate = divisions.some(
      (d) =>
        d.department_id === activeDeptId &&
        d.name.toLowerCase() === name.toLowerCase() &&
        d.id !== editingDivId
    );
    if (duplicate) {
      return setFormError(`"${name}" already exists in this department.`);
    }

    const payload = {
      name,
      department_id: activeDeptId,
      semester,
      strength,
      class_teacher_id: divForm.class_teacher_id || null,
    };

    if (editingDivId) {
      updateDivision(editingDivId, payload);
    } else {
      addDivision(payload);
    }

    setDivModalOpen(false);
    setFormError('');
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === 'department') {
      // A branch cannot leave orphan schedules behind, so its classes and
      // their timetables go with it.
      divisions
        .filter((d) => d.department_id === pendingDelete.id)
        .forEach((division) => {
          timetables
            .filter((t) => t.division_id === division.id)
            .forEach((t) => deleteTimetable(t.id));
        });
      deleteDepartment(pendingDelete.id);
      if (selectedDeptId === pendingDelete.id) setSelectedDeptId('');
    } else {
      timetables
        .filter((t) => t.division_id === pendingDelete.id)
        .forEach((t) => deleteTimetable(t.id));
      deleteDivision(pendingDelete.id);
    }
    setPendingDelete(null);
  };

  const deptTabs = visibleDepartments.map((d) => ({
    id: d.id,
    label: d.code,
    count: divisions.filter((div) => div.department_id === d.id).length,
    icon: <Building className="w-4 h-4 stroke-[2.4]" />,
  }));

  const pendingDeleteDivisionCount = pendingDelete
    ? divisions.filter((d) => d.department_id === pendingDelete.id).length
    : 0;

  return (
    <ProtectedRoute roles={['management', 'hod']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-3 border-black">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-black/60">
                Executive Portal
              </span>
              <Badge color="primary" size="sm">
                {canManageDepartments ? 'Management Access' : 'HOD Access'}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
              Institutional Master Matrix
            </h1>
            <p className="text-xs md:text-sm font-bold text-black/70">
              {canManageDepartments
                ? 'Create branches and classes, assign department heads, and monitor clash compliance.'
                : 'Manage the classes in your department and keep faculty assignments current.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canManageDepartments && (
              <Button
                variant="secondary"
                onClick={openCreateDept}
                icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
              >
                Add Department
              </Button>
            )}

            <Link href="/dashboard/generate">
              <Button
                variant="warning"
                icon={<Sparkles className="w-4 h-4 stroke-[2.5]" />}
              >
                Institution Generator
              </Button>
            </Link>
          </div>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5 bg-white">
            <span className="text-xs font-black uppercase text-black/60">
              Departments
            </span>
            <div className="text-3xl font-black text-black mt-1">
              {departments.length} Branches
            </div>
            <p className="text-xs font-bold text-black/60 mt-1">
              {departments.filter((d) => d.hod_id).length} with an assigned HOD
            </p>
          </Card>

          <Card className="p-5 bg-[#4DB6AC]">
            <span className="text-xs font-black uppercase text-black/80">
              Campus Divisions
            </span>
            <div className="text-3xl font-black text-black mt-1">
              {divisions.length} Classes
            </div>
            <p className="text-xs font-bold text-black/80 mt-1">
              {divisions.reduce((sum, d) => sum + d.strength, 0)} students enrolled
            </p>
          </Card>

          <Card className="p-5 bg-[#80CBC4]">
            <span className="text-xs font-black uppercase text-black/80">
              Active Faculty
            </span>
            <div className="text-3xl font-black text-black mt-1">
              {MOCK_FACULTY.length} Members
            </div>
            <p className="text-xs font-bold text-black/80 mt-1">
              {directoryUsers.length} accounts in the directory
            </p>
          </Card>

          <Card className="p-5 bg-[#FFD54F]">
            <span className="text-xs font-black uppercase text-black/80">
              Compliance Status
            </span>
            <div className="text-3xl font-black text-black mt-1">
              {campusClashes === 0 ? 'All Green' : `${campusClashes} Open`}
            </div>
            <p className="text-xs font-bold text-black/80 mt-1">
              {campusClashes === 0
                ? 'Zero room / teacher collisions'
                : 'Conflicts to resolve in the editor'}
            </p>
          </Card>
        </div>

        {/* Department Switcher Tabs */}
        {visibleDepartments.length > 0 ? (
          <Tabs
            tabs={deptTabs}
            activeTab={activeDeptId}
            onChange={setSelectedDeptId}
          />
        ) : (
          <Card className="p-6 bg-[#F7FBF3] text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-[#BF360C]" />
            <h3 className="font-black uppercase text-black">
              No departments available
            </h3>
            <p className="text-xs font-bold text-black/60 mb-4">
              {canManageDepartments
                ? 'Add your first branch to start building the institutional matrix.'
                : 'Your account is not linked to a department yet.'}
            </p>
            {canManageDepartments && (
              <Button
                variant="warning"
                onClick={openCreateDept}
                icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
              >
                Add Department
              </Button>
            )}
          </Card>
        )}

        {/* Active Department */}
        {activeDept && (
          <Card className="p-6 bg-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b-2 border-black mb-5">
              <div>
                <h2 className="text-xl font-black uppercase text-black">
                  {activeDept.name} ({activeDept.code})
                </h2>
                <p className="text-xs font-bold text-black/60">
                  {deptDivisions.length} division
                  {deptDivisions.length === 1 ? '' : 's'} •{' '}
                  {deptClashes === 0
                    ? '0 clashes'
                    : `${deptClashes} clash${deptClashes === 1 ? '' : 'es'}`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge color="secondary" size="md">
                  HOD:{' '}
                  {activeDept.hod_id
                    ? userById.get(activeDept.hod_id)?.name ?? 'Unassigned'
                    : 'Unassigned'}
                </Badge>

                {canManageDepartments && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDept(activeDept)}
                      icon={<Edit3 className="w-4 h-4" />}
                    >
                      Edit Branch
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        setPendingDelete({
                          kind: 'department',
                          id: activeDept.id,
                          name: activeDept.name,
                        })
                      }
                      icon={<Trash2 className="w-4 h-4" />}
                    >
                      Delete
                    </Button>
                  </>
                )}

                {canManageDivisions && (
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={openCreateDiv}
                    icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
                  >
                    Add Division
                  </Button>
                )}
              </div>
            </div>

            {deptDivisions.length === 0 ? (
              <div className="p-8 rounded-2xl border-3 border-dashed border-black/30 bg-[#F7FBF3] text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-black/40" />
                <h4 className="font-black uppercase text-black text-sm">
                  No divisions yet
                </h4>
                <p className="text-xs font-bold text-black/60 mb-4">
                  Create the first class for {activeDept.code} to schedule it.
                </p>
                {canManageDivisions && (
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={openCreateDiv}
                    icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
                  >
                    Add Division
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {deptDivisions.map((div) => {
                  const tt = timetables.find((t) => t.division_id === div.id);
                  const isPub = tt?.status === 'published';
                  const entryCount = tt?.entries?.length ?? 0;
                  const labCount =
                    tt?.entries?.filter((e) => e.entry_type === 'practical')
                      .length ?? 0;
                  const teacher = div.class_teacher_id
                    ? userById.get(div.class_teacher_id)
                    : undefined;

                  return (
                    <div
                      key={div.id}
                      className="p-5 rounded-2xl border-3 border-black bg-[#F1F8E9] nb-shadow-sm flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div>
                          <h4 className="text-lg font-black uppercase text-black">
                            {div.name}
                          </h4>
                          <p className="text-xs font-bold text-black/60">
                            Semester {div.semester} • {div.strength} students
                          </p>
                          <p className="text-[11px] font-bold text-black/50 mt-0.5">
                            Class teacher: {teacher?.name ?? 'Not assigned'}
                          </p>
                        </div>
                        <Badge color={!tt ? 'outline' : isPub ? 'accent' : 'yellow'} size="sm">
                          {!tt ? 'No schedule' : isPub ? 'Published' : 'Draft'}
                        </Badge>
                      </div>

                      <div className="mt-2 space-y-1 text-xs font-bold text-black/80">
                        <div className="flex items-center justify-between py-1 border-b border-black/10">
                          <span>Weekly Sessions</span>
                          <span className="font-black">{entryCount} Slots</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-black/10">
                          <span>Practical Labs (2-slot)</span>
                          <span className="font-black">{labCount} Slots</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-black/10">
                          <span>Clashes</span>
                          <span
                            className={
                              validateTimetable(tt?.entries ?? []).length === 0
                                ? 'font-black text-green-700'
                                : 'font-black text-[#BF360C]'
                            }
                          >
                            {validateTimetable(tt?.entries ?? []).length === 0
                              ? '0 (Clean)'
                              : `${validateTimetable(tt?.entries ?? []).length} found`}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t-2 border-black/20 flex flex-wrap items-center gap-2">
                        {tt ? (
                          <>
                            <Link
                              href={`/dashboard/timetable/${tt.id}`}
                              className="flex-1 min-w-[120px]"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                icon={<Eye className="w-4 h-4" />}
                              >
                                View
                              </Button>
                            </Link>

                            <Link href={`/dashboard/editor/${tt.id}`}>
                              <Button
                                variant="warning"
                                size="sm"
                                icon={<Edit3 className="w-4 h-4" />}
                              >
                                Edit
                              </Button>
                            </Link>
                          </>
                        ) : (
                          <Link
                            href="/dashboard/timetable"
                            className="flex-1 min-w-[140px]"
                          >
                            <Button
                              variant="warning"
                              size="sm"
                              className="w-full"
                              icon={<Plus className="w-4 h-4" />}
                            >
                              Create Timetable
                            </Button>
                          </Link>
                        )}

                        {canManageDivisions && (
                          <>
                            <button
                              onClick={() => openEditDiv(div)}
                              title="Edit division"
                              aria-label={`Edit ${div.name}`}
                              className="p-2 rounded-lg border-2 border-black bg-white hover:bg-[#F1F8E9] nb-shadow-sm cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4 stroke-[2.2]" />
                            </button>
                            <button
                              onClick={() =>
                                setPendingDelete({
                                  kind: 'division',
                                  id: div.id,
                                  name: div.name,
                                })
                              }
                              title="Delete division"
                              aria-label={`Delete ${div.name}`}
                              className="p-2 rounded-lg border-2 border-black bg-white hover:bg-[#BF360C] hover:text-white nb-shadow-sm cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 stroke-[2.2]" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* Branch compliance strip */}
        <Card className="p-5 bg-[#F7FBF3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-green-700" />
            <div>
              <h3 className="text-sm font-black uppercase text-black">
                Master data controls
              </h3>
              <p className="text-xs font-bold text-black/60">
                {canManageDepartments
                  ? 'Edits are stored on this device and applied across the portal immediately.'
                  : 'Divisions you add are stored on this device and applied across the portal.'}
              </p>
            </div>
          </div>

          {canManageDepartments && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetToSeed();
                setSelectedDeptId('');
              }}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Restore Seeded Data
            </Button>
          )}
        </Card>

        {/* ── Department Modal ── */}
        <Modal
          isOpen={deptModalOpen}
          onClose={() => setDeptModalOpen(false)}
          title={editingDeptId ? 'Edit Department' : 'Add Department'}
        >
          <form onSubmit={handleSubmitDept} className="space-y-4">
            <Input
              label="Department Name"
              required
              value={deptForm.name}
              onChange={(e) =>
                setDeptForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="e.g. Robotics & Automation"
            />

            <Input
              label="Branch Code"
              required
              value={deptForm.code}
              onChange={(e) =>
                setDeptForm((f) => ({ ...f, code: e.target.value }))
              }
              placeholder="e.g. ROB"
              maxLength={8}
            />

            <Dropdown
              label="Head of Department"
              value={deptForm.hod_id}
              onChange={(e) =>
                setDeptForm((f) => ({ ...f, hod_id: e.target.value }))
              }
              options={[
                { label: 'Unassigned', value: '' },
                ...hods.map((h) => ({
                  label: `${h.name} (${h.faculty_initial ?? 'HOD'})`,
                  value: h.id,
                })),
              ]}
            />

            {formError && (
              <div className="p-3 rounded-xl border-2 border-[#BF360C] bg-[#FFEBEE] text-xs font-black text-[#BF360C]">
                {formError}
              </div>
            )}

            <div className="pt-4 border-t-2 border-black/10 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeptModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="warning">
                {editingDeptId ? 'Save Changes' : 'Create Department'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* ── Division Modal ── */}
        <Modal
          isOpen={divModalOpen}
          onClose={() => setDivModalOpen(false)}
          title={editingDivId ? 'Edit Division' : 'Add Division'}
        >
          <form onSubmit={handleSubmitDiv} className="space-y-4">
            <Input
              label="Division Name"
              required
              value={divForm.name}
              onChange={(e) =>
                setDivForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="e.g. TE-A (CMPN)"
            />

            <div className="grid grid-cols-2 gap-4">
              <Dropdown
                label="Semester"
                value={divForm.semester}
                onChange={(e) =>
                  setDivForm((f) => ({ ...f, semester: e.target.value }))
                }
                options={SEMESTERS.map((s) => ({
                  label: `Semester ${s}`,
                  value: String(s),
                }))}
              />

              <Input
                label="Class Strength"
                type="number"
                min={1}
                max={500}
                required
                value={divForm.strength}
                onChange={(e) =>
                  setDivForm((f) => ({ ...f, strength: e.target.value }))
                }
              />
            </div>

            <Dropdown
              label="Class Teacher"
              value={divForm.class_teacher_id}
              onChange={(e) =>
                setDivForm((f) => ({ ...f, class_teacher_id: e.target.value }))
              }
              options={[
                { label: 'Not assigned', value: '' },
                ...classTeachers.map((t) => ({
                  label: `${t.name} (${t.faculty_initial ?? 'FAC'})`,
                  value: t.id,
                })),
              ]}
            />

            {activeDept && (
              <p className="text-[11px] font-bold text-black/60">
                This division will be created under{' '}
                <span className="font-black text-black">
                  {activeDept.name} ({activeDept.code})
                </span>
                .
              </p>
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
                onClick={() => setDivModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="accent">
                {editingDivId ? 'Save Changes' : 'Create Division'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* ── Delete Confirmation ── */}
        <Modal
          isOpen={pendingDelete !== null}
          onClose={() => setPendingDelete(null)}
          title={
            pendingDelete?.kind === 'department'
              ? 'Delete Department'
              : 'Delete Division'
          }
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-[#BF360C] border-2 border-black flex items-center justify-center text-white">
                <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <p className="text-sm font-bold text-black/80">
                Delete <span className="font-black">{pendingDelete?.name}</span>?
                {pendingDelete?.kind === 'department' &&
                  pendingDeleteDivisionCount > 0 && (
                    <>
                      {' '}
                      Its{' '}
                      <span className="font-black">
                        {pendingDeleteDivisionCount} division
                        {pendingDeleteDivisionCount === 1 ? '' : 's'}
                      </span>{' '}
                      and their timetables will be removed as well.
                    </>
                  )}{' '}
                This cannot be undone.
              </p>
            </div>

            <div className="pt-4 border-t-2 border-black/10 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPendingDelete(null)}>
                Keep it
              </Button>
              <Button
                variant="primary"
                onClick={confirmDelete}
                icon={<Trash2 className="w-4 h-4" />}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
