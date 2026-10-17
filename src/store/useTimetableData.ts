// ─────────────────────────────────────────────────────────────
// Campus Clock – Timetable Data
//
// The timetables (and every cell inside them) live here rather than in
// component state. Management and HODs can create a timetable for any
// division, edit its grid, and publish it — and those edits survive a
// reload instead of disappearing on navigation.
// ─────────────────────────────────────────────────────────────

'use client';

import { create } from 'zustand';
import type { Division, Department, Timetable, TimetableEntry } from '@/lib/types';
import { MOCK_TIMETABLES } from '@/lib/data/mockData';

const STORAGE_KEY = 'campus_clock_timetables_v1';

export interface CreateTimetableInput {
  department: Department;
  division: Division;
  academic_year: string;
  created_by: string;
}

interface TimetableDataState {
  timetables: Timetable[];
  hydrated: boolean;

  hydrate: () => void;
  resetToSeed: () => void;

  createTimetable: (input: CreateTimetableInput) => Timetable;
  saveEntries: (id: string, entries: TimetableEntry[]) => void;
  setStatus: (id: string, status: Timetable['status']) => void;
  updateAcademicYear: (id: string, academicYear: string) => void;
  deleteTimetable: (id: string) => void;
}

function persist(timetables: Timetable[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ timetables }));
  } catch (err) {
    console.warn('[campus-clock] timetables could not be saved', err);
  }
}

let hasHydrated = false;

export const useTimetableData = create<TimetableDataState>((set, get) => ({
  timetables: MOCK_TIMETABLES,
  hydrated: false,

  hydrate: () => {
    if (hasHydrated) return;
    hasHydrated = true;
    if (typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        set({ hydrated: true });
        return;
      }

      const parsed = JSON.parse(raw) as { timetables?: Timetable[] };
      set({
        timetables: Array.isArray(parsed.timetables)
          ? parsed.timetables
          : MOCK_TIMETABLES,
        hydrated: true,
      });
    } catch (err) {
      console.warn('[campus-clock] timetables could not be restored', err);
      set({ hydrated: true });
    }
  },

  resetToSeed: () => {
    set({ timetables: MOCK_TIMETABLES, hydrated: true });
    persist(MOCK_TIMETABLES);
  },

  createTimetable: (input) => {
    const existing = get().timetables.find(
      (t) => t.division_id === input.division.id
    );
    if (existing) return existing;

    const now = new Date().toISOString();
    const timetable: Timetable = {
      id: `tt-${input.division.id}-${Date.now().toString(36)}`,
      department_id: input.department.id,
      division_id: input.division.id,
      status: 'draft',
      created_by: input.created_by,
      approved_by: null,
      academic_year: input.academic_year.trim() || '2026-2027 (Even)',
      created_at: now,
      updated_at: now,
      division: input.division,
      department: input.department,
      entries: [],
    };

    set((state) => ({ timetables: [...state.timetables, timetable] }));
    persist(get().timetables);
    return timetable;
  },

  saveEntries: (id, entries) => {
    set((state) => ({
      timetables: state.timetables.map((t) =>
        t.id === id
          ? { ...t, entries, updated_at: new Date().toISOString() }
          : t
      ),
    }));
    persist(get().timetables);
  },

  setStatus: (id, status) => {
    set((state) => ({
      timetables: state.timetables.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              approved_by: status === 'published' ? 'user-mgmt-1' : null,
              updated_at: new Date().toISOString(),
            }
          : t
      ),
    }));
    persist(get().timetables);
  },

  updateAcademicYear: (id, academicYear) => {
    set((state) => ({
      timetables: state.timetables.map((t) =>
        t.id === id
          ? { ...t, academic_year: academicYear, updated_at: new Date().toISOString() }
          : t
      ),
    }));
    persist(get().timetables);
  },

  deleteTimetable: (id) => {
    set((state) => ({
      timetables: state.timetables.filter((t) => t.id !== id),
    }));
    persist(get().timetables);
  },
}));
