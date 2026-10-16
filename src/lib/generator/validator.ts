// ─────────────────────────────────────────────────────────────
// Campus Clock – Timetable Validator
// ─────────────────────────────────────────────────────────────
//
// Scans a set of timetable entries and returns an array of Clash
// objects describing any constraint violations.
//
// Checks:
//   1. No faculty double-booked in the same day + slot
//   2. No room   double-booked in the same day + slot
//   3. No class  has two entries in the same day + slot
//   4. Practical entries occupy 2 consecutive slots
// ─────────────────────────────────────────────────────────────

import { type TimetableEntry, type Clash, BREAK_AFTER_SLOT } from '@/lib/types';

/**
 * Validate a flat list of timetable entries and return any clashes found.
 *
 * @param entries – the entries to validate (may span a single timetable or
 *                  multiple timetables when checking cross-division clashes)
 * @returns An array of `Clash` objects. Empty means no issues.
 */
export function validateTimetable(
  entries: Pick<TimetableEntry, 'day' | 'slot' | 'subject_id' | 'faculty_id' | 'room_id' | 'entry_type'>[]
): Clash[] {
  const clashes: Clash[] = [];

  // Build lookup maps keyed by "day-slot"
  // Each map: key → array of entry indices
  const facultySlots: Record<string, number[]> = {};
  const roomSlots: Record<string, number[]> = {};
  const classSlots: Record<string, number[]> = {};

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const ds = `${e.day}-${e.slot}`;

    // Faculty map
    const fKey = `${e.faculty_id}::${ds}`;
    if (!facultySlots[fKey]) facultySlots[fKey] = [];
    facultySlots[fKey].push(i);

    // Room map
    const rKey = `${e.room_id}::${ds}`;
    if (!roomSlots[rKey]) roomSlots[rKey] = [];
    roomSlots[rKey].push(i);

    // Class map (same day+slot regardless of subject)
    if (!classSlots[ds]) classSlots[ds] = [];
    classSlots[ds].push(i);
  }

  // ── 1. Faculty conflicts ──────────────────────────────────
  for (const [key, indices] of Object.entries(facultySlots)) {
    if (indices.length > 1) {
      const [facultyId, ds] = key.split('::');
      const [day, slot] = ds.split('-').map(Number);
      const subjects = indices.map((i) => entries[i].subject_id).join(', ');
      clashes.push({
        type: 'faculty_conflict',
        day,
        slot,
        details: `Faculty ${facultyId} is double-booked on day ${day}, slot ${slot} (subjects: ${subjects}).`,
      });
    }
  }

  // ── 2. Room conflicts ─────────────────────────────────────
  for (const [key, indices] of Object.entries(roomSlots)) {
    if (indices.length > 1) {
      const [roomId, ds] = key.split('::');
      const [day, slot] = ds.split('-').map(Number);
      clashes.push({
        type: 'room_conflict',
        day,
        slot,
        details: `Room ${roomId} is double-booked on day ${day}, slot ${slot}.`,
      });
    }
  }

  // ── 3. Class conflicts ────────────────────────────────────
  for (const [ds, indices] of Object.entries(classSlots)) {
    if (indices.length > 1) {
      // Practicals legitimately occupy 2 rows for the *same* subject+faculty+room.
      // That is NOT a conflict. We only flag it when different subjects collide.
      const uniqueSubjects = new Set(indices.map((i) => entries[i].subject_id));
      if (uniqueSubjects.size > 1) {
        const [day, slot] = ds.split('-').map(Number);
        clashes.push({
          type: 'class_conflict',
          day,
          slot,
          details: `Class has ${indices.length} entries on day ${day}, slot ${slot}.`,
        });
      }
    }
  }

  // ── 4. Practical consecutive-slot check ───────────────────
  // Group practical entries by subject_id + day to verify they form
  // consecutive pairs.
  const practicalGroups: Record<string, number[]> = {};

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (e.entry_type !== 'practical') continue;
    const gKey = `${e.subject_id}::${e.day}`;
    if (!practicalGroups[gKey]) practicalGroups[gKey] = [];
    practicalGroups[gKey].push(e.slot);
  }

  for (const [gKey, slots] of Object.entries(practicalGroups)) {
    // Each practical session should have exactly 2 slots
    if (slots.length !== 2) {
      const [, dayStr] = gKey.split('::');
      clashes.push({
        type: 'practical_consecutive',
        day: Number(dayStr),
        slot: Math.min(...slots),
        details: `Practical session has ${slots.length} slot(s) instead of the required 2.`,
      });
      continue;
    }

    slots.sort((a, b) => a - b);
    const [s1, s2] = slots;

    // Must be numerically consecutive and not span the break
    if (s2 !== s1 + 1 || s1 === BREAK_AFTER_SLOT) {
      const [, dayStr] = gKey.split('::');
      clashes.push({
        type: 'practical_consecutive',
        day: Number(dayStr),
        slot: s1,
        details: `Practical slots ${s1} and ${s2} on day ${dayStr} are not truly consecutive (break gap or non-adjacent).`,
      });
    }
  }

  return clashes;
}
