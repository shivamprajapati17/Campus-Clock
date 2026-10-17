'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useMasterData } from '@/store/useMasterData';
import { useTimetableData } from '@/store/useTimetableData';
import { resolveDepartmentId } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Dropdown } from '@/components/ui/Dropdown';
import { Input } from '@/components/ui/Input';
import {
  Calendar,
  Sparkles,
  Eye,
  Edit3,
  FileDown,
  Plus,
  Trash2,
  AlertTriangle,
  CalendarPlus,
  Layers,
} from 'lucide-react';

const DEFAULT_YEAR = '2026-2027 (Even)';

export default function TimetableListPage() {
  const router = useRouter();
  const { user } = useStore();
  const role = user?.role || 'student';

  const departments = useMasterData((s) => s.departments);
  const divisions = useMasterData((s) => s.divisions);
  const timetables = useTimetableData((s) => s.timetables);
  const createTimetable = useTimetableData((s) => s.createTimetable);
  const deleteTimetable = useTimetableData((s) => s.deleteTimetable);

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createDeptId, setCreateDeptId] = useState('');
  const [createDivId, setCreateDivId] = useState('');
  const [createYear, setCreateYear] = useState(DEFAULT_YEAR);
  const [createError, setCreateError] = useState('');

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const scopeDeptId = resolveDepartmentId(
    departments,
    user?.department_id,
    user?.department_code
  );
  const userDivisionId = user?.division_id ?? null;

  const canManage = role === 'management' || role === 'hod';
  const canDelete = role === 'management';

  const assignableDepartments = useMemo(() => {
    if (role === 'management') return departments;
    if (role === 'hod') {
      return departments.filter((d) => d.id === scopeDeptId);
    }
    return departments;
  }, [departments, role, scopeDeptId]);

  // Management sees the whole campus, an HOD sees their branch, and teachers /
  // students only ever see published schedules for their own class.
  const visibleTimetables = useMemo(() => {
    if (role === 'management') return timetables;

    const byRole =
      role === 'hod'
        ? timetables.filter((t) => t.department_id === scopeDeptId)
        : timetables.filter((t) => t.status === 'published');

    if (role === 'teacher' || role === 'student') {
      if (userDivisionId) {
        const ownClass = byRole.filter((t) => t.division_id === userDivisionId);
        if (ownClass.length > 0) return ownClass;
      }
      if (scopeDeptId) {
        const ownDept = byRole.filter((t) => t.department_id === scopeDeptId);
        if (ownDept.length > 0) return ownDept;
      }
    }

    return byRole;
  }, [timetables, role, scopeDeptId, userDivisionId]);

  const filterTabs = [
    { id: 'all', label: 'All Timetables', count: visibleTimetables.length },
    {
      id: 'published',
      label: 'Published',
      count: visibleTimetables.filter((t) => t.status === 'published').length,
    },
    {
      id: 'draft',
      label: 'Drafts',
      count: visibleTimetables.filter((t) => t.status === 'draft').length,
    },
  ];

  const filteredTimetables = visibleTimetables.filter((tt) => {
    if (activeTab !== 'all' && tt.status !== activeTab) return false;
    if (!searchTerm) return true;
    const query = searchTerm.toLowerCase();
    const divName = tt.division?.name.toLowerCase() || '';
    const deptName = tt.department?.name.toLowerCase() || '';
    const deptCode = tt.department?.code.toLowerCase() || '';
    return (
      divName.includes(query) ||
      deptName.includes(query) ||
      deptCode.includes(query)
    );
  });

  const createDept =
    assignableDepartments.find((d) => d.id === createDeptId) ??
    assignableDepartments[0];

  const freeDivisions = useMemo(() => {
    if (!createDept) return [];
    return divisions.filter(
      (div) =>
        div.department_id === createDept.id &&
        !timetables.some((t) => t.division_id === div.id)
    );
  }, [divisions, createDept, timetables]);

  const openCreate = () => {
    const dept = assignableDepartments[0];
    const division = divisions.find(
      (d) =>
        d.department_id === dept?.id &&
        !timetables.some((t) => t.division_id === d.id)
    );
    setCreateDeptId(dept?.id ?? '');
    setCreateDivId(division?.id ?? '');
    setCreateYear(DEFAULT_YEAR);
    setCreateError('');
    setCreateOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const division = divisions.find((d) => d.id === createDivId);
    if (!createDept || !division) {
      setCreateError('Pick a department and a class to schedule.');
      return;
    }
    const created = createTimetable({
      department: createDept,
      division,
      academic_year: createYear,
      created_by: user?.id ?? 'user-mgmt-1',
    });
    setCreateOpen(false);
    router.push(`/dashboard/editor/${created.id}`);
  };

  const handleDelete = () => {
    if (pendingDeleteId) deleteTimetable(pendingDeleteId);
    setPendingDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-3 border-black">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-black/60">
              {role === 'management' ? 'Campus Wide' : 'My Department'}
            </span>
            <Badge color="secondary" size="sm">
              {visibleTimetables.length} Schedules
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
            Academic Timetables
          </h1>
          <p className="text-xs md:text-sm font-bold text-black/70">
            {role === 'management'
              ? 'Every branch, every class — open and edit any timetable directly.'
              : role === 'hod'
                ? 'Published and draft schedules for the classes in your branch.'
                : 'Your published class schedule, ready to view and export.'}
          </p>
        </div>

        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="accent"
              onClick={openCreate}
              icon={<CalendarPlus className="w-4 h-4 stroke-[2.5]" />}
            >
              New Timetable
            </Button>
            <Link href="/dashboard/generate">
              <Button
                variant="warning"
                icon={<Sparkles className="w-4 h-4 stroke-[2.5]" />}
              >
                Generate New
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <Tabs tabs={filterTabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search class or branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search timetables"
            className="nb-input py-2 pl-9 text-xs"
          />
          <Layers className="w-4 h-4 text-black/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Grid of Timetables */}
      {filteredTimetables.length === 0 ? (
        <Card className="p-10 bg-[#F7FBF3] text-center">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-black/35" />
          <h3 className="text-base font-black uppercase text-black">
            No timetables match this view
          </h3>
          <p className="text-xs font-bold text-black/60 mt-1 mb-5">
            {canManage
              ? 'Create a timetable for a class, or clear the search filters.'
              : 'Your timetable has not been published yet. Please check back later.'}
          </p>
          {canManage && (
            <Button
              variant="accent"
              size="sm"
              onClick={openCreate}
              icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            >
              New Timetable
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTimetables.map((tt) => {
            const isPublished = tt.status === 'published';
            const entriesCount = tt.entries?.length ?? 0;
            const canEdit =
              role === 'management' ||
              (role === 'hod' && tt.department_id === scopeDeptId);

            return (
              <Card
                key={tt.id}
                hoverable
                className="p-6 flex flex-col justify-between bg-white relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-black border-2 border-white text-[#FFD54F] flex items-center justify-center font-black">
                    <Calendar className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <Badge color={isPublished ? 'accent' : 'yellow'} size="sm">
                    {tt.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-xl font-black uppercase text-black tracking-tight leading-tight">
                    {tt.division?.name || 'Class Division'}
                  </h3>
                  <p className="text-xs font-bold text-black/70 mt-0.5">
                    {tt.department?.name}{' '}
                    {tt.department?.code ? `(${tt.department.code})` : ''}
                  </p>

                  <div className="mt-4 pt-4 border-t-2 border-black/10 grid grid-cols-2 gap-3 text-xs font-bold text-black/80">
                    <div>
                      <span className="block text-[10px] font-black uppercase text-black/50">
                        Term
                      </span>
                      <span>{tt.academic_year}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black uppercase text-black/50">
                        Weekly Sessions
                      </span>
                      <span>
                        {entriesCount === 0
                          ? 'Not scheduled'
                          : `${entriesCount} Slots Filled`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t-3 border-black flex items-center justify-between gap-2">
                  <Link href={`/dashboard/timetable/${tt.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      icon={<Eye className="w-4 h-4" />}
                    >
                      View Grid
                    </Button>
                  </Link>

                  {canEdit && (
                    <Link href={`/dashboard/editor/${tt.id}`}>
                      <Button
                        variant="warning"
                        size="sm"
                        icon={<Edit3 className="w-4 h-4" />}
                      >
                        Edit
                      </Button>
                    </Link>
                  )}

                  <Link
                    href={`/dashboard/exports?id=${tt.id}`}
                    aria-label={`Export ${tt.division?.name ?? 'timetable'}`}
                    className="p-2 rounded-xl border-2 border-black bg-white hover:bg-[#F1F8E9] nb-shadow-sm"
                    title="Export PDF / Excel"
                  >
                    <FileDown className="w-4 h-4 stroke-[2.2]" />
                  </Link>

                  {canDelete && (
                    <button
                      onClick={() => setPendingDeleteId(tt.id)}
                      aria-label={`Delete ${tt.division?.name ?? 'timetable'}`}
                      title="Delete timetable"
                      className="p-2 rounded-xl border-2 border-black bg-white hover:bg-[#BF360C] hover:text-white nb-shadow-sm cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2.2]" />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create timetable */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Timetable"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <p className="text-xs font-bold text-black/60">
            Pick any class that does not have a schedule yet. You can start from
            an empty grid or auto-fill it from the editor.
          </p>

          <Dropdown
            label="Department"
            value={createDept?.id ?? ''}
            onChange={(e) => {
              setCreateDeptId(e.target.value);
              setCreateDivId(
                divisions.find(
                  (d) =>
                    d.department_id === e.target.value &&
                    !timetables.some((t) => t.division_id === d.id)
                )?.id ?? ''
              );
            }}
            options={assignableDepartments.map((d) => ({
              label: `${d.name} (${d.code})`,
              value: d.id,
            }))}
          />

          <Dropdown
            label="Class Division"
            value={createDivId}
            onChange={(e) => setCreateDivId(e.target.value)}
            options={
              freeDivisions.length > 0
                ? freeDivisions.map((div) => ({
                    label: `${div.name} • Sem ${div.semester}`,
                    value: div.id,
                  }))
                : [{ label: 'Every class already has a timetable', value: '' }]
            }
          />

          <Input
            label="Academic Year / Term"
            value={createYear}
            onChange={(e) => setCreateYear(e.target.value)}
            placeholder="e.g. 2026-2027 (Even)"
          />

          {createError && (
            <div className="p-3 rounded-xl border-2 border-[#BF360C] bg-[#FFEBEE] text-xs font-black text-[#BF360C]">
              {createError}
            </div>
          )}

          <div className="pt-4 border-t-2 border-black/10 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={!createDivId}>
              Create & Open Editor
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        title="Delete Timetable"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#BF360C] border-2 border-black flex items-center justify-center text-white">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <p className="text-sm font-bold text-black/80">
              This removes the timetable and every slot inside it. This cannot
              be undone.
            </p>
          </div>
          <div className="pt-4 border-t-2 border-black/10 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setPendingDeleteId(null)}>
              Keep it
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
