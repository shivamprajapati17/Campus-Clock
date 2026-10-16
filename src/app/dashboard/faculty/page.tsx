'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { DAYS, SLOTS } from '@/lib/types';
import {
  MOCK_FACULTY,
  MOCK_ENTRIES_SE_A,
} from '@/lib/data/mockData';
import {
  UserCheck,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export default function FreeFacultyPage() {
  const [selectedDay, setSelectedDay] = useState('1'); // Monday
  const [selectedSlot, setSelectedSlot] = useState('3'); // Slot 3

  const dayNum = parseInt(selectedDay, 10);
  const slotNum = parseInt(selectedSlot, 10);

  // Find busy faculty from entries
  const busyFacultyIds = new Set<string>();
  MOCK_ENTRIES_SE_A.forEach((e) => {
    if (e.day === dayNum && e.slot === slotNum) {
      busyFacultyIds.add(e.faculty_id);
    }
  });

  // Filter free faculty
  const freeFaculty = MOCK_FACULTY.filter(
    (f) => !busyFacultyIds.has(f.id)
  );

  const busyFaculty = MOCK_FACULTY.filter(
    (f) => busyFacultyIds.has(f.id)
  );

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
              Instant Finder
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
            Free Faculty Slot Finder
          </h1>
          <p className="text-xs md:text-sm font-bold text-black/70">
            Check teacher availability in real-time for any timetable period across campus.
          </p>
        </div>
      </div>

      {/* Selector Card */}
      <Card className="p-6 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 items-end">
          <Dropdown
            label="Select Weekday"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            options={[
              { label: 'Monday', value: '1' },
              { label: 'Tuesday', value: '2' },
              { label: 'Wednesday', value: '3' },
              { label: 'Thursday', value: '4' },
              { label: 'Friday', value: '5' },
            ]}
          />

          <Dropdown
            label="Select Time Slot"
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            options={[
              { label: 'Slot 1 (09:00 - 10:00 AM)', value: '1' },
              { label: 'Slot 2 (10:00 - 11:00 AM)', value: '2' },
              { label: 'Slot 3 (11:00 - 12:00 PM)', value: '3' },
              { label: 'Slot 4 (12:00 - 01:00 PM)', value: '4' },
              { label: 'Slot 5 (01:30 - 02:30 PM)', value: '5' },
              { label: 'Slot 6 (02:30 - 03:30 PM)', value: '6' },
              { label: 'Slot 7 (03:30 - 04:30 PM)', value: '7' },
            ]}
          />

          <div className="p-3 rounded-xl border-2 border-black bg-[#FFE66D] nb-shadow-sm flex items-center justify-between">
            <span className="text-xs font-black uppercase">
              Target Slot Status:
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-white border border-black">
              {freeFaculty.length} Free
            </span>
          </div>
        </div>
      </Card>

      {/* Free Faculty List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-black uppercase text-black">
            Available Faculty for Substitution
          </h3>
          <Badge color="accent" size="sm">
            {DAYS[dayNum]} • Slot {slotNum} ({SLOTS[slotNum]?.start} – {SLOTS[slotNum]?.end})
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {freeFaculty.map((fac) => (
            <Card
              key={fac.id}
              hoverable
              className="p-5 bg-white flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-[#42D1C3] border-2 border-black text-black font-black text-base flex items-center justify-center nb-shadow-sm">
                    {fac.initials}
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-green-100 text-green-800 border border-green-600">
                    Free Slot
                  </span>
                </div>

                <h4 className="text-base font-black text-black">
                  {fac.user?.name || `Prof. ${fac.initials}`}
                </h4>
                <p className="text-xs font-bold text-black/60 mt-0.5">
                  Department of Computer Engineering
                </p>

                <div className="mt-3 pt-3 border-t-2 border-black/10 text-xs font-bold text-black/70 flex items-center justify-between">
                  <span>Daily Cap:</span>
                  <span className="font-black text-black">{fac.max_per_day} Lectures / Day</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t-2 border-black/20 flex items-center gap-2">
                <Button
                  variant="warning"
                  size="sm"
                  className="w-full"
                  icon={<MessageSquare className="w-4 h-4" />}
                >
                  Request Substitution
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Busy Faculty for this slot */}
        {busyFaculty.length > 0 && (
          <div className="mt-8 pt-6 border-t-3 border-black">
            <h4 className="text-sm font-black uppercase text-black/60 mb-3">
              Currently Engaged Faculty ({busyFaculty.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {busyFaculty.map((bf) => (
                <div
                  key={bf.id}
                  className="p-3 rounded-xl border-2 border-black/30 bg-[#FFF5EB] flex items-center gap-2 text-xs"
                >
                  <span className="w-6 h-6 rounded-md bg-black/10 font-black flex items-center justify-center text-[10px]">
                    {bf.initials}
                  </span>
                  <span className="font-bold text-black/80 truncate">
                    {bf.user?.name || bf.initials}
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

