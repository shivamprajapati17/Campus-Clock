'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import {
  MOCK_TIMETABLES,
  MOCK_DEPARTMENTS,
  MOCK_DIVISIONS,
} from '@/lib/data/mockData';
import {
  Calendar,
  Sparkles,
  Eye,
  Edit3,
  FileDown,
  CheckCircle2,
  Clock,
  Layers,
  Search,
} from 'lucide-react';

export default function TimetableListPage() {
  const { user } = useStore();
  const role = user?.role || 'student';

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filterTabs = [
    { id: 'all', label: 'All Timetables', count: MOCK_TIMETABLES.length },
    {
      id: 'published',
      label: 'Published',
      count: MOCK_TIMETABLES.filter((t) => t.status === 'published').length,
    },
    {
      id: 'draft',
      label: 'Drafts',
      count: MOCK_TIMETABLES.filter((t) => t.status === 'draft').length,
    },
  ];

  const filteredTimetables = MOCK_TIMETABLES.filter((tt) => {
    // Role filter: Student and Teacher only view published timetable of their division
    if ((role === 'student' || role === 'teacher') && tt.status !== 'published') {
      return false;
    }
    // Tab filter
    if (activeTab !== 'all' && tt.status !== activeTab) {
      return false;
    }
    // Search query
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const divName = tt.division?.name.toLowerCase() || '';
      const deptName = tt.department?.name.toLowerCase() || '';
      return divName.includes(query) || deptName.includes(query);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-3 border-black">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
            Academic Timetables Directory
          </h1>
          <p className="text-xs md:text-sm font-bold text-black/70">
            Browse published class timetables and pending drafts across departments.
          </p>
        </div>

        {(role === 'hod' || role === 'management') && (
          <Link href="/dashboard/generate">
            <Button variant="warning" icon={<Sparkles className="w-4 h-4 stroke-[2.5]" />}>
              Generate New
            </Button>
          </Link>
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
            className="nb-input py-2 pl-9 text-xs"
          />
          <Search className="w-4 h-4 text-black/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Grid of Timetables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTimetables.map((tt) => {
          const isPublished = tt.status === 'published';
          const entriesCount = tt.entries?.length || (isPublished ? 21 : 0);

          return (
            <Card
              key={tt.id}
              hoverable
              className="p-6 flex flex-col justify-between bg-white relative overflow-hidden"
            >
              {/* Corner badge */}
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="w-12 h-12 rounded-xl bg-black border-2 border-white text-[#FFD93D] flex items-center justify-center font-black">
                  <Calendar className="w-6 h-6 stroke-[2.2]" />
                </div>
                <Badge color={isPublished ? 'accent' : 'yellow'} size="sm">
                  {tt.status}
                </Badge>
              </div>

              <div>
                <h3 className="text-xl font-black uppercase text-black tracking-tight">
                  {tt.division?.name || 'Class Division'}
                </h3>
                <p className="text-xs font-bold text-black/70 mt-0.5">
                  {tt.department?.name} ({tt.department?.code})
                </p>

                <div className="mt-4 pt-4 border-t-2 border-black/10 grid grid-cols-2 gap-2 text-xs font-bold text-black/80">
                  <div>
                    <span className="block text-[10px] font-black uppercase text-black/50">
                      Term / Session
                    </span>
                    <span>{tt.academic_year}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase text-black/50">
                      Weekly Sessions
                    </span>
                    <span>{entriesCount} Slots Filled</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t-3 border-black flex items-center justify-between gap-2">
                <Link href={`/dashboard/timetable/${tt.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full" icon={<Eye className="w-4 h-4" />}>
                    View Grid
                  </Button>
                </Link>

                {(role === 'hod' || role === 'management') && (
                  <Link href={`/dashboard/editor/${tt.id}`}>
                    <Button variant="warning" size="sm" icon={<Edit3 className="w-4 h-4" />}>
                      Edit
                    </Button>
                  </Link>
                )}

                <Link href={`/dashboard/exports?id=${tt.id}`}>
                  <button
                    className="p-2 rounded-xl border-2 border-black bg-white hover:bg-[#FDF6EC] nb-shadow-sm cursor-pointer"
                    title="Export PDF / Excel"
                  >
                    <FileDown className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

