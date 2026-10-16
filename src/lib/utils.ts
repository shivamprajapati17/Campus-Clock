// ─────────────────────────────────────────────────────────────
// Campus Clock – Utility Functions
// ─────────────────────────────────────────────────────────────

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import {
  DAYS,
  SLOTS,
  SUBJECT_COLORS,
  ROLE_COLORS,
  type Department,
  type UserRole,
} from '@/lib/types';

/**
 * Merge Tailwind classes intelligently (handles conflicts).
 * Wraps clsx + tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────────────────────
// Demo session cookie helpers
//
// Isolated here so components never mutate `document` directly,
// which keeps them pure and SSR-safe.
// ─────────────────────────────────────────────────────────────

export const DEMO_SESSION_COOKIE = 'campus_clock_demo_user';

/** Persist the active demo persona for one week. */
export function writeDemoSession(user: unknown): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${DEMO_SESSION_COOKIE}=${encodeURIComponent(
    JSON.stringify(user)
  )}; path=/; max-age=604800`;
}

/** Read the persisted demo persona, or null when absent/unparseable. */
export function readDemoSession<T>(): T | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`${DEMO_SESSION_COOKIE}=([^;]+)`)
  );
  if (!match || !match[1]) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as T;
  } catch {
    return null;
  }
}

/** Clear the demo persona cookie (sign out). */
export function clearDemoSession(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${DEMO_SESSION_COOKIE}=; path=/; max-age=0`;
}

/**
 * Return the human-readable time range for a slot number.
 * e.g. formatTime(1) → "09:00 – 10:00"
 */
export function formatTime(slot: number): string {
  const s = SLOTS[slot];
  if (!s) return '';
  return `${s.start} – ${s.end}`;
}

/**
 * Return the weekday name for a day number (1 = Monday … 5 = Friday).
 */
export function getDayName(day: number): string {
  return DAYS[day] ?? '';
}

/**
 * Pick a colour from the rotating subject palette.
 */
export function getSubjectColor(index: number): string {
  return SUBJECT_COLORS[index % SUBJECT_COLORS.length];
}

/**
 * Return the accent colour associated with a user role.
 */
export function getRoleColor(role: UserRole): string {
  return ROLE_COLORS[role] ?? '#868E96';
}

/**
 * Match a signed-in user to a department in the master matrix.
 *
 * Accounts created through Supabase carry the department as a database UUID,
 * which never equals the matrix's own id — so fall back to the branch short
 * code before giving up.
 */
export function resolveDepartmentId(
  departments: Department[],
  departmentId: string | null | undefined,
  departmentCode: string | null | undefined
): string | null {
  if (departmentId && departments.some((d) => d.id === departmentId)) {
    return departmentId;
  }

  if (departmentCode) {
    const byCode = departments.find(
      (d) => d.code.toLowerCase() === departmentCode.toLowerCase()
    );
    if (byCode) return byCode.id;
  }

  return departmentId ?? null;
}

/**
 * Extract uppercase initials from a full name.
 * e.g. "Jane Doe" → "JD", "Alice" → "A"
 */
export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join('');
}

/**
 * Format an ISO date string into a locale-friendly display string.
 * e.g. "2024-03-15T10:30:00Z" → "Mar 15, 2024"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
