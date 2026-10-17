// ─────────────────────────────────────────────────────────────
// Campus Clock – Core Type Definitions
// ─────────────────────────────────────────────────────────────

/** Possible user roles in the system */
export type UserRole = 'management' | 'hod' | 'teacher' | 'student';

/** Authenticated user record */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department_id: string | null;
  division_id: string | null;
  faculty_initial: string | null;
  must_change_password: boolean;
  created_at: string;
  /**
   * Branch short code (e.g. "CMPN"). Supabase accounts store their department
   * as a database UUID, while the master matrix uses internal ids — the code is
   * what lets an HOD be matched to their branch in both worlds.
   */
  department_code?: string | null;
}

/** Academic department */
export interface Department {
  id: string;
  name: string;
  code: string;
  hod_id: string | null;
  created_at: string;
}

/** Class division within a department */
export interface Division {
  id: string;
  name: string;
  department_id: string;
  class_teacher_id: string | null;
  semester: number;
  strength: number;
  created_at: string;
  department?: Department;
}

/** Subject / course offered */
export interface Subject {
  id: string;
  code: string;
  name: string;
  type: 'lecture' | 'practical' | 'tutorial';
  weekly_hours: number;
  needs_lab: boolean;
  department_id: string;
  created_at: string;
}

/** Faculty member (linked to a User) */
export interface Faculty {
  id: string;
  user_id: string;
  initials: string;
  max_per_day: number;
  unavailable_slots: string[];
  department_id: string;
  created_at: string;
  user?: User;
}

/** Physical room / lab / seminar hall */
export interface Room {
  id: string;
  number: string;
  type: 'classroom' | 'lab' | 'seminar';
  capacity: number;
  created_at: string;
}

/** A single cell in a timetable grid */
export interface TimetableEntry {
  id: string;
  timetable_id: string;
  day: 1 | 2 | 3 | 4 | 5;
  slot: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  subject_id: string;
  faculty_id: string;
  room_id: string;
  entry_type: 'lecture' | 'practical' | 'tutorial';
  is_locked: boolean;
  /**
   * Optional practical/tutorial batch. Two batches can legitimately sit in the
   * same period (one in a lab, one in a tutorial room), so the grid renders a
   * cell as a list rather than assuming a single entry.
   */
  batch?: string | null;
  subject?: Subject;
  faculty?: Faculty;
  room?: Room;
}

/** A scheduled lunch/activity break inside one day of a timetable. */
export interface TimetableBreak {
  day: number;
  slot: number;
}

/** Complete timetable for a division */
export interface Timetable {
  id: string;
  department_id: string;
  division_id: string;
  status: 'draft' | 'published';
  created_by: string;
  approved_by: string | null;
  academic_year: string;
  created_at: string;
  updated_at: string;
  entries?: TimetableEntry[];
  /** Breaks are per day because lab rotations move lunch on some days. */
  breaks?: TimetableBreak[];
  division?: Division;
  department?: Department;
}

// ─────────────────────────────────────────────────────────────
// Chat
// ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  text: string;
  created_at: string;
  sender?: { name: string; role: UserRole };
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'department' | 'class' | 'general' | 'hod';
  department_id: string | null;
  division_id: string | null;
}

// ─────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

// ─────────────────────────────────────────────────────────────
// Generator
// ─────────────────────────────────────────────────────────────

/** Assignment linking a subject to its faculty */
export interface SubjectFacultyAssignment {
  subject: Subject;
  faculty: Faculty;
}

/** Input payload for the timetable generator */
export interface GeneratorInput {
  division: Division;
  assignments: SubjectFacultyAssignment[];
  rooms: Room[];
}

/** A single scheduling clash detected by the validator */
export interface Clash {
  type: 'faculty_conflict' | 'room_conflict' | 'class_conflict' | 'practical_consecutive';
  day: number;
  slot: number;
  details: string;
}

/** Output from the timetable generator */
export interface GeneratorResult {
  success: boolean;
  entries: Omit<TimetableEntry, 'id' | 'timetable_id'>[];
  clashes: Clash[];
  message: string;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

/** Weekday names indexed 1–5 */
export const DAYS: Record<number, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
} as const;

/** Time-slot definitions (1-indexed, 8 teaching periods) */
export const SLOTS: Record<number, { label: string; start: string; end: string }> = {
  1: { label: 'Slot 1', start: '09:15', end: '10:15' },
  2: { label: 'Slot 2', start: '10:15', end: '11:15' },
  3: { label: 'Slot 3', start: '11:15', end: '12:15' },
  4: { label: 'Slot 4', start: '12:15', end: '01:15' },
  5: { label: 'Slot 5', start: '01:15', end: '02:15' },
  6: { label: 'Slot 6', start: '02:15', end: '03:15' },
  7: { label: 'Slot 7', start: '03:15', end: '04:15' },
  8: { label: 'Slot 8', start: '04:15', end: '05:15' },
} as const;

/** Default lunch slot. Most timetables break after period 4. */
export const BREAK_AFTER_SLOT = 4;

/** Badge / accent colours per role (Bulbasaur palette) */
export const ROLE_COLORS: Record<UserRole, string> = {
  management: '#1B5E20', // deep leaf green
  hod: '#00796B', // teal
  teacher: '#7CB342', // lime
  student: '#FBC02D', // sunflower yellow
} as const;

/** Tint palette for subject cards — keeps every card in the garden palette. */
export const SUBJECT_COLORS: string[] = [
  '#DCEDC8', // light leaf
  '#B2DFDB', // soft teal
  '#FFF9C4', // sunlit yellow
  '#C8E6C9', // mint
  '#A5D6A7', // leaf
] as const;
