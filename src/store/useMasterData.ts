// ─────────────────────────────────────────────────────────────
// Campus Clock – Institutional Master Data
//
// Departments, divisions and the user directory live here so that
// Management (Dean) and HODs can actually add, rename and remove
// institutional records. Edits are written to localStorage, so they
// survive a reload instead of vanishing on navigation.
//
// The store always starts from the seeded data (so server rendering
// stays deterministic) and `<DashboardLayout>` calls `hydrate()` once
// on mount to overlay whatever the operator saved previously.
// ─────────────────────────────────────────────────────────────

'use client';

import { create } from 'zustand';
import type { Department, Division, User } from '@/lib/types';
import {
  MOCK_DEPARTMENTS,
  MOCK_DIVISIONS,
  MOCK_USERS,
} from '@/lib/data/mockData';

// Bumping the version invalidates payloads saved before the seed changed
// (for example the CMPN HOD rename), so stale names never outlive a release.
const STORAGE_KEY = 'campus_clock_master_data_v2';

/** The only slice of state worth persisting. */
export interface MasterDataPayload {
  departments: Department[];
  divisions: Division[];
  directoryUsers: User[];
}

export interface DepartmentInput {
  name: string;
  code: string;
  hod_id: string | null;
}

export interface DivisionInput {
  name: string;
  department_id: string;
  semester: number;
  strength: number;
  class_teacher_id: string | null;
}

interface MasterDataState extends MasterDataPayload {
  /** True once localStorage has been consulted (or found empty). */
  hydrated: boolean;

  hydrate: () => void;
  resetToSeed: () => void;

  addDepartment: (input: DepartmentInput) => Department;
  updateDepartment: (id: string, patch: Partial<DepartmentInput>) => void;
  deleteDepartment: (id: string) => void;

  addDivision: (input: DivisionInput) => Division;
  updateDivision: (id: string, patch: Partial<DivisionInput>) => void;
  deleteDivision: (id: string) => void;

  addDirectoryUser: (user: User) => void;
  updateDirectoryUser: (id: string, patch: Partial<User>) => void;
  deleteDirectoryUser: (id: string) => void;
}

/** Short, collision-resistant id for locally created records. */
function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

function persist(state: MasterDataPayload): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        departments: state.departments,
        divisions: state.divisions,
        directoryUsers: state.directoryUsers,
      })
    );
  } catch (err) {
    // Private browsing or a full quota: the edit still applies for this
    // session, it just will not be remembered after a reload.
    console.warn('[campus-clock] master data could not be saved', err);
  }
}

/** Module-level guard so `hydrate()` only reads storage once. */
let hasHydrated = false;

export const useMasterData = create<MasterDataState>((set, get) => ({
  departments: MOCK_DEPARTMENTS,
  divisions: MOCK_DIVISIONS,
  directoryUsers: MOCK_USERS,
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

      const parsed = JSON.parse(raw) as Partial<MasterDataPayload>;
      set({
        departments: Array.isArray(parsed.departments)
          ? parsed.departments
          : MOCK_DEPARTMENTS,
        divisions: Array.isArray(parsed.divisions)
          ? parsed.divisions
          : MOCK_DIVISIONS,
        directoryUsers: Array.isArray(parsed.directoryUsers)
          ? parsed.directoryUsers
          : MOCK_USERS,
        hydrated: true,
      });
    } catch (err) {
      console.warn('[campus-clock] master data could not be restored', err);
      set({ hydrated: true });
    }
  },

  resetToSeed: () => {
    set({
      departments: MOCK_DEPARTMENTS,
      divisions: MOCK_DIVISIONS,
      directoryUsers: MOCK_USERS,
      hydrated: true,
    });
    persist(get());
  },

  // ── Departments ──────────────────────────────────────────
  addDepartment: (input) => {
    const department: Department = {
      id: makeId('dept'),
      name: input.name.trim(),
      code: input.code.trim().toUpperCase(),
      hod_id: input.hod_id,
      created_at: new Date().toISOString(),
    };

    set((state) => ({ departments: [...state.departments, department] }));
    persist(get());
    return department;
  },

  updateDepartment: (id, patch) => {
    set((state) => ({
      departments: state.departments.map((dept) =>
        dept.id === id
          ? {
              ...dept,
              ...patch,
              name: patch.name !== undefined ? patch.name.trim() : dept.name,
              code:
                patch.code !== undefined
                  ? patch.code.trim().toUpperCase()
                  : dept.code,
            }
          : dept
      ),
    }));
    persist(get());
  },

  // Removing a branch also removes the classes that belonged to it,
  // otherwise those divisions would linger with a dangling department.
  deleteDepartment: (id) => {
    set((state) => ({
      departments: state.departments.filter((dept) => dept.id !== id),
      divisions: state.divisions.filter((div) => div.department_id !== id),
    }));
    persist(get());
  },

  // ── Divisions ────────────────────────────────────────────
  addDivision: (input) => {
    const division: Division = {
      id: makeId('div'),
      name: input.name.trim(),
      department_id: input.department_id,
      class_teacher_id: input.class_teacher_id,
      semester: input.semester,
      strength: input.strength,
      created_at: new Date().toISOString(),
    };

    set((state) => ({ divisions: [...state.divisions, division] }));
    persist(get());
    return division;
  },

  updateDivision: (id, patch) => {
    set((state) => ({
      divisions: state.divisions.map((div) =>
        div.id === id
          ? {
              ...div,
              ...patch,
              name: patch.name !== undefined ? patch.name.trim() : div.name,
            }
          : div
      ),
    }));
    persist(get());
  },

  deleteDivision: (id) => {
    set((state) => ({
      divisions: state.divisions.filter((div) => div.id !== id),
    }));
    persist(get());
  },

  // ── User directory ───────────────────────────────────────
  addDirectoryUser: (user) => {
    set((state) => ({ directoryUsers: [user, ...state.directoryUsers] }));
    persist(get());
  },

  updateDirectoryUser: (id, patch) => {
    set((state) => ({
      directoryUsers: state.directoryUsers.map((user) =>
        user.id === id ? { ...user, ...patch } : user
      ),
    }));
    persist(get());
  },

  deleteDirectoryUser: (id) => {
    set((state) => ({
      directoryUsers: state.directoryUsers.filter((user) => user.id !== id),
    }));
    persist(get());
  },
}));
