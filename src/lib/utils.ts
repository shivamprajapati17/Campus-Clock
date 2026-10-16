// ─────────────────────────────────────────────────────────────
// Campus Clock – Utility Functions
// ─────────────────────────────────────────────────────────────

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { DAYS, SLOTS, SUBJECT_COLORS, ROLE_COLORS, type UserRole } from '@/lib/types';

/**
 * Merge Tailwind classes intelligently (handles conflicts).
 * Wraps clsx + tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
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
