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
  slot: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  subject_id: string;
  faculty_id: string;
  room_id: string;
  entry_type: 'lecture' | 'practical' | 'tutorial';
  is_locked: boolean;
  subject?: Subject;
  faculty?: Faculty;
  room?: Room;
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

/** Time-slot definitions (1-indexed, 7 teaching slots) */
export const SLOTS: Record<number, { label: string; start: string; end: string }> = {
  1: { label: 'Slot 1', start: '09:00', end: '10:00' },
  2: { label: 'Slot 2', start: '10:00', end: '11:00' },
  3: { label: 'Slot 3', start: '11:00', end: '12:00' },
  4: { label: 'Slot 4', start: '12:00', end: '01:00' },
  5: { label: 'Slot 5', start: '01:30', end: '02:30' },
  6: { label: 'Slot 6', start: '02:30', end: '03:30' },
  7: { label: 'Slot 7', start: '03:30', end: '04:30' },
} as const;

/** Break falls between slot 4 and slot 5 (lunch break) */
export const BREAK_AFTER_SLOT = 4;

/** Badge / accent colours per role (Neo-Brutalist palette) */
export const ROLE_COLORS: Record<UserRole, string> = {
  management: '#FF6B70', // coral red
  hod: '#A78BFA', // lavender purple
  teacher: '#42D1C3', // turquoise
  student: '#FFE66D', // butter yellow
} as const;

/** Rotating palette for subject cards (Neo-Brutalist palette) */
export const SUBJECT_COLORS: string[] = [
  '#FF6B70', // coral red
  '#A78BFA', // lavender purple
  '#42D1C3', // turquoise
  '#FFE66D', // butter yellow
  '#FFA477', // peach
] as const;
