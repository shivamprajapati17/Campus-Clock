'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import {
  MOCK_DEPARTMENTS,
  MOCK_DIVISIONS,
  MOCK_TIMETABLES,
  MOCK_FACULTY,
} from '@/lib/data/mockData';
import {
  Layers,
  Building,
  CheckCircle2,
  Clock,
  Eye,
  Edit3,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function MasterViewPage() {
  const [selectedDeptId, setSelectedDeptId] = useState(MOCK_DEPARTMENTS[0].id);

  const deptTabs = MOCK_DEPARTMENTS.map((d) => ({
    id: d.id,
    label: `${d.code} Department`,
    count: MOCK_DIVISIONS.filter((div) => div.department_id === d.id).length,
  }));

  const activeDept =
    MOCK_DEPARTMENTS.find((d) => d.id === selectedDeptId) || MOCK_DEPARTMENTS[0];

  const deptDivisions = MOCK_DIVISIONS.filter(
    (div) => div.department_id === selectedDeptId
  );

  return (
    <ProtectedRoute roles={['management']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-3 border-black">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-black/60">
                Executive Portal
              </span>
              <Badge color="primary" size="sm">
                Management Exclusive
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
              Institutional Master Matrix
            </h1>
            <p className="text-xs md:text-sm font-bold text-black/70">
              Campus-wide timetable monitoring, department approvals, and clash compliance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard/generate">
              <Button variant="warning" icon={<Sparkles className="w-4 h-4 stroke-[2.5]" />}>
                Institution Generator
              </Button>
            </Link>
          </div>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-5 bg-white">
            <span className="text-xs font-black uppercase text-black/60">
              Total Departments
            </span>
            <div className="text-3xl font-black text-black mt-1">
              {MOCK_DEPARTMENTS.length} Branches
            </div>
            <p className="text-xs font-bold text-black/60 mt-1">
              CMPN, IT, EXTC Active
            </p>
          </Card>

          <Card className="p-5 bg-[#2DD4BF]">
            <span className="text-xs font-black uppercase text-black/80">
              Campus Divisions
            </span>
            <div className="text-3xl font-black text-black mt-1">
              {MOCK_DIVISIONS.length} Classes
            </div>
            <p className="text-xs font-bold text-black/80 mt-1">
              100% Conflict Free
            </p>
          </Card>

          <Card className="p-5 bg-[#FFD93D]">
            <span className="text-xs font-black uppercase text-black/80">
              Compliance Status
            </span>
            <div className="text-3xl font-black text-black mt-1">
              All Green
            </div>
            <p className="text-xs font-bold text-black/80 mt-1">
              Zero Room / Teacher Collisions
            </p>
          </Card>
        </div>

        {/* Department Switcher Tabs */}
        <Tabs tabs={deptTabs} activeTab={selectedDeptId} onChange={setSelectedDeptId} />

        {/* Active Department Divisions */}
        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between pb-4 border-b-2 border-black mb-5">
            <div>
              <h2 className="text-xl font-black uppercase text-black">
                {activeDept.name} ({activeDept.code})
              </h2>
              <p className="text-xs font-bold text-black/60">
                Reviewing scheduled divisions for term 2026-2027
              </p>
            </div>
            <Badge color="secondary" size="md">
              HOD Assigned: Prof. Rajesh Kulkarni
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {deptDivisions.map((div) => {
              const tt = MOCK_TIMETABLES.find((t) => t.division_id === div.id);
              const isPub = tt?.status === 'published';

              return (
                <div
                  key={div.id}
                  className="p-5 rounded-2xl border-3 border-black bg-[#FDF6EC] nb-shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-black uppercase text-black">
                        {div.name}
                      </h4>
                      <p className="text-xs font-bold text-black/60">
                        Semester {div.semester} • {div.strength} Students Enrolled
                      </p>
                    </div>
                    <Badge color={isPub ? 'accent' : 'yellow'} size="sm">
                      {isPub ? 'Published' : 'Draft'}
                    </Badge>
                  </div>

                  <div className="mt-2 space-y-1 text-xs font-bold text-black/80">
                    <div className="flex items-center justify-between py-1 border-b border-black/10">
                      <span>Weekly Lectures</span>
                      <span className="font-black">17 Slots</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-black/10">
                      <span>Practical Labs (2-slot)</span>
                      <span className="font-black">4 Slots</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-black/10">
                      <span>Clashes</span>
                      <span className="font-black text-green-700">0 (Clean)</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t-2 border-black/20 flex items-center gap-2">
                    <Link
                      href={`/dashboard/timetable/${tt?.id || 'tt-se-a-pub'}`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full" icon={<Eye className="w-4 h-4" />}>
                        View Timetable
                      </Button>
                    </Link>

                    <Link href={`/dashboard/editor/${tt?.id || 'tt-se-a-pub'}`}>
                      <Button variant="warning" size="sm" icon={<Edit3 className="w-4 h-4" />}>
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

