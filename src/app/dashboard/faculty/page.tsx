'use client';

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { useStore } from '@/store/useStore';
import { useMasterData } from '@/store/useMasterData';
import { useTimetableData } from '@/store/useTimetableData';
import { resolveDepartmentId } from '@/lib/utils';
import { buildFacultyForDepartment } from '@/lib/faculty';
import { MOCK_FACULTY, MOCK_ENTRIES_SE_A } from '@/lib/data/mockData';
import { DAYS, SLOTS, type Faculty } from '@/lib/types';
import {
  UserCheck,
  Search,
  Mail,
  AlertTriangle,
} from 'lucide-react';

export default function FreeFacultyPage() {
  const { user } = useStore();
  const role = user?.role ?? 'student';
  const departments = useMasterData((s) => s.departments);
  const directoryUsers = useMasterData((s) => s.directoryUsers);
  const timetables = useTimetableData((s) => s.timetables);

  const [selectedDay, setSelectedDay] = useState('1');
  const [selectedSlot, setSelectedSlot] = useState('3');
  const [searchTerm, setSearchTerm] = useState('');

  const dayNum = parseInt(selectedDay, 10);
  const slotNum = parseInt(selectedSlot, 10);

  const scopeDeptId = resolveDepartmentId(
    departments,
    user?.department_id,
    user?.department_code
  );

  const scopedFaculty: Faculty[] = useMemo(() => {
    if (role === 'management') return MOCK_FACULTY;
    if (scopeDeptId) {
      const own = buildFacultyForDepartment(scopeDeptId, directoryUsers);
      if (own.length > 0) return own;
    }
    return MOCK_FACULTY;
  }, [role, scopeDeptId, directoryUsers]);

  // Busy = teaching in any saved timetable at this day/slot.
  const busyFacultyIds = useMemo(() => {
    const allEntries = timetables.flatMap((t) => t.entries ?? []);
    const source = allEntries.length > 0 ? allEntries : MOCK_ENTRIES_SE_A;
    return new Set(
      source
        .filter((e) => e.day === dayNum && e.slot === slotNum)
        .map((e) => e.faculty_id)
    );
  }, [timetables, dayNum, slotNum]);

  const visible = scopedFaculty.filter((f) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (f.user?.name ?? '').toLowerCase().includes(q) ||
      f.initials.toLowerCase().includes(q)
    );
  });

  const freeFaculty = visible.filter((f) => !busyFacultyIds.has(f.id));
  const busyFaculty = visible.filter((f) => busyFacultyIds.has(f.id));

  const departmentOf = (f: Faculty) =>
    departments.find((d) => d.id === f.department_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-3 border-black">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-black/60">
              Substitution & Proxy Suite
            </span>
            <Badge color="accent" size="sm">
              Live Availability
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
            Free Faculty Finder
          </h1>
          <p className="text-xs md:text-sm font-bold text-black/70">
            Check who is teaching in any period and who can cover it.
          </p>
        </div>
      </div>

      {/* Selector */}
      <Card className="p-6 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
          <Dropdown
            label="Weekday"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            options={Object.entries(DAYS).map(([value, label]) => ({
              label,
              value,
            }))}
          />

          <Dropdown
            label="Time Slot"
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            options={Object.entries(SLOTS).map(([value, s]) => ({
              label: `${s.label} (${s.start} - ${s.end})`,
              value,
            }))}
          />

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search faculty..."
              aria-label="Search faculty"
              className="nb-input py-2 pl-9 text-xs"
            />
            <Search className="w-4 h-4 text-black/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div
            className={`p-3 rounded-xl border-2 border-black nb-shadow-sm flex items-center justify-between ${
              freeFaculty.length > 0 ? 'bg-[#FFD54F]' : 'bg-[#BF360C] text-white'
            }`}
          >
            <span className="text-xs font-black uppercase">Available:</span>
            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-white border border-black text-black">
              {freeFaculty.length} / {visible.length}
            </span>
          </div>
        </div>
      </Card>

      {/* Free faculty */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-black uppercase text-black">
            Available for Substitution
          </h3>
          <Badge color="accent" size="sm">
            {DAYS[dayNum]} • Slot {slotNum} ({SLOTS[slotNum]?.start} – {SLOTS[slotNum]?.end})
          </Badge>
        </div>

        {freeFaculty.length === 0 ? (
          <Card className="p-8 bg-[#F7FBF3] text-center">
            <AlertTriangle className="w-9 h-9 mx-auto mb-2 text-[#BF360C]" />
            <h4 className="font-black uppercase text-black text-sm">
              No free faculty for this slot
            </h4>
            <p className="text-xs font-bold text-black/60 mt-1">
              Every teacher in scope is already scheduled. Try another period.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {freeFaculty.map((fac) => {
              const dept = departmentOf(fac);
              const mailSubject = encodeURIComponent(
                `Substitution request — ${DAYS[dayNum]}, Slot ${slotNum}`
              );
              const mailBody = encodeURIComponent(
                `Hello ${fac.user?.name ?? fac.initials},\n\nCould you cover a lecture on ${DAYS[dayNum]} at ${SLOTS[slotNum]?.start}–${SLOTS[slotNum]?.end}?\n\nThank you.`
              );

              return (
                <Card
                  key={fac.id}
                  hoverable
                  className="p-5 bg-white flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-[#4DB6AC] border-2 border-black text-black font-black text-base flex items-center justify-center nb-shadow-sm">
                        {fac.initials}
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-green-100 text-green-800 border border-green-600">
                        Free Slot
                      </span>
                    </div>

                    <h4 className="text-base font-black text-black">
                      {fac.user?.name ?? `Prof. ${fac.initials}`}
                    </h4>
                    <p className="text-xs font-bold text-black/60 mt-0.5">
                      {dept ? `${dept.name} (${dept.code})` : 'Department faculty'}
                    </p>

                    <div className="mt-3 pt-3 border-t-2 border-black/10 text-xs font-bold text-black/70 flex items-center justify-between">
                      <span>Daily Cap:</span>
                      <span className="font-black text-black">
                        {fac.max_per_day} Lectures / Day
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t-2 border-black/20">
                    {fac.user?.email ? (
                      <a
                        href={`mailto:${fac.user.email}?subject=${mailSubject}&body=${mailBody}`}
                        className="nb-btn w-full bg-[#FFD54F] text-black text-xs uppercase tracking-wider font-black inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-black"
                      >
                        <Mail className="w-4 h-4 shrink-0" />
                        Request Substitution
                      </a>
                    ) : (
                      <span className="block text-center text-[11px] font-bold text-black/45 border-2 border-dashed border-black/20 rounded-xl py-2.5">
                        No email on file
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {busyFaculty.length > 0 && (
          <div className="mt-8 pt-6 border-t-3 border-black">
            <h4 className="text-sm font-black uppercase text-black/60 mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Currently Engaged ({busyFaculty.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {busyFaculty.map((bf) => (
                <div
                  key={bf.id}
                  className="p-3 rounded-xl border-2 border-black/30 bg-[#F1F8E9] flex items-center gap-2 text-xs"
                >
                  <span className="w-7 h-7 rounded-md bg-black/10 font-black flex items-center justify-center text-[10px] shrink-0">
                    {bf.initials}
                  </span>
                  <span className="font-bold text-black/80 truncate">
                    {bf.user?.name ?? bf.initials}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
