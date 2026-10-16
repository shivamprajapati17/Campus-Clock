'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  MOCK_TIMETABLES,
  MOCK_DEPARTMENTS,
  MOCK_DIVISIONS,
  MOCK_FACULTY,
  MOCK_NOTIFICATIONS,
} from '@/lib/data/mockData';
import {
  Sparkles,
  Calendar,
  Layers,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  FileDown,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useStore();
  const role = user?.role || 'management';

  const publishedCount = MOCK_TIMETABLES.filter((t) => t.status === 'published').length;
  const draftCount = MOCK_TIMETABLES.filter((t) => t.status === 'draft').length;

  return (
    <div className="space-y-8">
      {/* ── Welcome Banner ── */}
      <div className="nb-card bg-[#FFD93D] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black uppercase tracking-widest text-black/75">
              Portal Overview
            </span>
            <Badge color={role} size="sm">
              {role}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-black leading-tight">
            Welcome back, {user?.name || 'Administrator'}!
          </h1>
          <p className="text-xs md:text-sm font-bold text-black/80 mt-1">
            {role === 'management' && 'Executive overview across all academic departments and faculty schedules.'}
            {role === 'hod' && 'Manage your department courses, faculty constraints, and 0-clash generator.'}
            {role === 'teacher' && 'View your daily lecture schedule, student divisions, and find substitute faculty.'}
            {role === 'student' && 'Check your weekly class timetable, room numbers, and division updates.'}
          </p>
        </div>

        {/* Action button based on role */}
        <div className="shrink-0 flex items-center gap-2">
          {role === 'management' && (
            <Link href="/dashboard/master">
              <Button variant="outline" icon={<Layers className="w-4 h-4" />}>
                Master Matrix
              </Button>
            </Link>
          )}

          {(role === 'hod' || role === 'management') && (
            <Link href="/dashboard/generate">
              <Button variant="primary" icon={<Sparkles className="w-4 h-4" />}>
                Run Generator
              </Button>
            </Link>
          )}

          {(role === 'teacher' || role === 'student') && (
            <Link href="/dashboard/timetable/tt-se-a-pub">
              <Button variant="outline" icon={<Calendar className="w-4 h-4" />}>
                My Timetable
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Departments"
          value={MOCK_DEPARTMENTS.length}
          subtitle="Active Engineering Branches"
          icon={<Layers className="w-5 h-5 text-black" />}
          color="#FFF"
        />

        <StatCard
          title="Divisions"
          value={MOCK_DIVISIONS.length}
          subtitle="Classes Scheduled"
          icon={<Users className="w-5 h-5 text-black" />}
          color="#FFF"
        />

        <StatCard
          title="Published Timetables"
          value={publishedCount}
          subtitle={`${draftCount} in Draft status`}
          icon={<CheckCircle2 className="w-5 h-5 text-green-700" />}
          color="#2DD4BF"
        />

        <StatCard
          title="Clash Rate"
          value="0.0%"
          subtitle="Backtracking Verified"
          icon={<Sparkles className="w-5 h-5 text-[#FF5D5D]" />}
          color="#A78BFA"
        />
      </div>

      {/* ── Main Content Two Columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Timetable Status & Schedule Snapshot */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between pb-4 border-b-3 border-black mb-4">
              <div>
                <h3 className="text-lg font-black uppercase text-black tracking-tight">
                  Active Department Timetables
                </h3>
                <p className="text-xs font-bold text-black/60">
                  Current Even Semester 2026 Status
                </p>
              </div>
              <Link
                href="/dashboard/timetable"
                className="text-xs font-black uppercase hover:underline flex items-center gap-1 text-black"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {MOCK_TIMETABLES.map((tt) => (
                <div
                  key={tt.id}
                  className="p-4 rounded-xl border-3 border-black bg-[#FDF6EC] nb-shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:translate-x-1 transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black border-2 border-white text-[#FFD93D] flex items-center justify-center font-black">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-black">
                          {tt.division?.name || 'Class Division'}
                        </span>
                        <Badge
                          color={tt.status === 'published' ? 'accent' : 'yellow'}
                          size="sm"
                        >
                          {tt.status}
                        </Badge>
                      </div>
                      <p className="text-xs font-bold text-black/60 mt-0.5">
                        Academic Year: {tt.academic_year} • {tt.department?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Link href={`/dashboard/timetable/${tt.id}`}>
                      <Button variant="outline" size="sm">
                        View Grid
                      </Button>
                    </Link>
                    {(role === 'hod' || role === 'management') && (
                      <Link href={`/dashboard/editor/${tt.id}`}>
                        <Button variant="warning" size="sm">
                          Edit
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/dashboard/faculty" className="block">
              <Card hoverable className="p-4 bg-[#5CB8FF] text-black">
                <UserCheck className="w-6 h-6 mb-2 stroke-[2.5]" />
                <h4 className="font-black text-sm uppercase">Free Faculty</h4>
                <p className="text-[11px] font-bold text-black/80 mt-0.5">
                  Find available teachers for any day & slot
                </p>
              </Card>
            </Link>

            <Link href="/dashboard/chat" className="block">
              <Card hoverable className="p-4 bg-[#FF8A5C] text-black">
                <MessageSquare className="w-6 h-6 mb-2 stroke-[2.5]" />
                <h4 className="font-black text-sm uppercase">Live Chat</h4>
                <p className="text-[11px] font-bold text-black/80 mt-0.5">
                  Discuss with departmental staff & classes
                </p>
              </Card>
            </Link>

            <Link href="/dashboard/exports" className="block">
              <Card hoverable className="p-4 bg-[#2DD4BF] text-black">
                <FileDown className="w-6 h-6 mb-2 stroke-[2.5]" />
                <h4 className="font-black text-sm uppercase">Export PDF</h4>
                <p className="text-[11px] font-bold text-black/80 mt-0.5">
                  Generate print-ready PDFs & Excel sheets
                </p>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right Column: Faculty Status & Recent Alerts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Faculty Roster */}
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-3">
              <h3 className="text-sm font-black uppercase text-black">
                Department Faculty
              </h3>
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-[#FFD93D] border border-black">
                {MOCK_FACULTY.length} Active
              </span>
            </div>

            <div className="space-y-2.5">
              {MOCK_FACULTY.map((fac) => (
                <div
                  key={fac.id}
                  className="flex items-center justify-between p-2 rounded-xl border-2 border-black/20 hover:border-black bg-white transition-all text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#FFD93D] border border-black flex items-center justify-center font-black text-[11px]">
                      {fac.initials}
                    </span>
                    <div>
                      <p className="font-black text-black">
                        {fac.user?.name || `Prof. ${fac.initials}`}
                      </p>
                      <span className="text-[10px] font-bold text-black/50">
                        Max {fac.max_per_day} lectures/day
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-green-100 text-green-800 border border-green-500">
                    Available
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Activity Notifications */}
          <Card className="p-5 bg-[#FFFBEB]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-3">
              <h3 className="text-sm font-black uppercase text-black flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Recent Updates</span>
              </h3>
            </div>

            <div className="space-y-3">
              {MOCK_NOTIFICATIONS.map((notif) => (
                <div
                  key={notif.id}
                  className="p-2.5 rounded-xl border-2 border-black bg-white text-xs"
                >
                  <p className="font-bold text-black leading-tight">
                    {notif.message}
                  </p>
                  <span className="text-[10px] font-black uppercase text-black/50 mt-1 block">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

