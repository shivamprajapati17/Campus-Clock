// ─────────────────────────────────────────────────────────────
// Campus Clock – Timetable Generation Engine
// ─────────────────────────────────────────────────────────────
//
// Constraint-based scheduler with depth-limited backtracking.
//
// Priority order:
//   1. Practicals   (need 2 consecutive slots + lab room)
//   2. Tutorials
//   3. Lectures
//
// Constraints enforced:
//   - Faculty not double-booked in a day+slot
//   - Room   not double-booked in a day+slot
//   - Class  (division) not double-booked in a day+slot
//   - Faculty max_per_day limit
//   - Faculty unavailable_slots respected
//   - Break gap: slot 4→5 is not "consecutive" (lunch)
//   - Practicals must occupy 2 consecutive slots in the same day
// ─────────────────────────────────────────────────────────────

import {
  type GeneratorInput,
  type GeneratorResult,
  type TimetableEntry,
  type Subject,
  type Faculty,
  type Room,
  type Clash,
  BREAK_AFTER_SLOT,
} from '@/lib/types';

// ── Busy-map types ────────────────────────────────────────────

/** busy[id][day][slot] = true when occupied */
type BusyMap = Record<string, Record<number, Record<number, boolean>>>;
/** classBusy[day][slot] = true */
type ClassBusy = Record<number, Record<number, boolean>>;
/** facultyDayCount[id][day] = number of assigned slots */
type DayCount = Record<string, Record<number, number>>;

// ── Constants ─────────────────────────────────────────────────

const TOTAL_DAYS = 5; // Mon–Fri
const TOTAL_SLOTS = 7; // 7 teaching slots per day
const BACKTRACK_LIMIT = 100;

// ── Helpers ───────────────────────────────────────────────────

function initBusy(): BusyMap {
  return {};
}

function markBusy(map: BusyMap, id: string, day: number, slot: number) {
  if (!map[id]) map[id] = {};
  if (!map[id][day]) map[id][day] = {};
  map[id][day][slot] = true;
}

function isBusy(map: BusyMap, id: string, day: number, slot: number): boolean {
  return !!map[id]?.[day]?.[slot];
}

function clearBusy(map: BusyMap, id: string, day: number, slot: number) {
  if (map[id]?.[day]) {
    delete map[id][day][slot];
  }
}

function initClassBusy(): ClassBusy {
  const cb: ClassBusy = {};
  for (let d = 1; d <= TOTAL_DAYS; d++) cb[d] = {};
  return cb;
}

function initDayCount(): DayCount {
  return {};
}

function getDayCount(dc: DayCount, id: string, day: number): number {
  return dc[id]?.[day] ?? 0;
}

function incDayCount(dc: DayCount, id: string, day: number) {
  if (!dc[id]) dc[id] = {};
  dc[id][day] = (dc[id][day] ?? 0) + 1;
}

function decDayCount(dc: DayCount, id: string, day: number) {
  if (dc[id]?.[day]) dc[id][day]--;
}

/**
 * Parse an unavailable-slot string like "3-5" into { day, slot }.
 * Convention: "day-slot" where day ∈ 1..5 and slot ∈ 1..7.
 */
function parseUnavailable(raw: string[]): Set<string> {
  const set = new Set<string>();
  for (const s of raw) {
    // Accept "day-slot" format
    set.add(s.trim());
  }
  return set;
}

function slotKey(day: number, slot: number): string {
  return `${day}-${slot}`;
}

/**
 * Check whether two slots are truly consecutive (no break in between).
 * Slot 4 → Slot 5 crosses the lunch break, so they are NOT consecutive.
 */
function areConsecutive(slot1: number, slot2: number): boolean {
  if (slot2 !== slot1 + 1) return false;
  // Break falls after BREAK_AFTER_SLOT (slot 4).
  // So slot 4 and slot 5 are separated by the lunch break.
  if (slot1 === BREAK_AFTER_SLOT) return false;
  return true;
}

// ── Task representation ───────────────────────────────────────

interface Task {
  subject: Subject;
  faculty: Faculty;
  /** Number of contiguous slots this task needs (2 for practicals, 1 otherwise) */
  slotsNeeded: number;
  /** Whether a lab-type room is required */
  needsLab: boolean;
}

// ── Main generator ────────────────────────────────────────────

/**
 * Generate a complete timetable for a single division.
 *
 * @param input – division, subject→faculty assignments, available rooms
 * @returns GeneratorResult with entries or clash report
 */
export function generateTimetable(input: GeneratorInput): GeneratorResult {
  const { assignments, rooms } = input;

  // ── 1. Build task list ────────────────────────────────────
  const tasks: Task[] = [];

  for (const { subject, faculty } of assignments) {
    const slotsNeeded = subject.type === 'practical' ? 2 : 1;
    const needsLab = subject.needs_lab || subject.type === 'practical';

    // Each weekly_hour translates to one task for lectures/tutorials.
    // For practicals, each pair of hours is one task (since each needs 2 slots).
    const repetitions =
      subject.type === 'practical'
        ? Math.ceil(subject.weekly_hours / 2)
        : subject.weekly_hours;

    for (let i = 0; i < repetitions; i++) {
      tasks.push({ subject, faculty, slotsNeeded, needsLab });
    }
  }

  // Sort: practicals first (hardest to place), then tutorials, then lectures
  const priority: Record<string, number> = { practical: 0, tutorial: 1, lecture: 2 };
  tasks.sort((a, b) => (priority[a.subject.type] ?? 2) - (priority[b.subject.type] ?? 2));

  // ── 2. Initialise busy maps ───────────────────────────────
  const facultyBusy = initBusy();
  const roomBusy = initBusy();
  const classBusy = initClassBusy();
  const facultyDayCount = initDayCount();

  // Pre-parse unavailable slots per faculty
  const unavailableMap: Record<string, Set<string>> = {};
  for (const { faculty } of assignments) {
    if (!unavailableMap[faculty.id]) {
      unavailableMap[faculty.id] = parseUnavailable(faculty.unavailable_slots ?? []);
    }
  }

  // ── 3. Collect candidate rooms by type ────────────────────
  const labRooms = rooms.filter((r) => r.type === 'lab');
  const classroomRooms = rooms.filter((r) => r.type !== 'lab');

  // ── 4. Backtracking search ────────────────────────────────
  type PlacedEntry = Omit<TimetableEntry, 'id' | 'timetable_id'>;
  const placed: PlacedEntry[] = [];
  let backtracks = 0;

  function findRoom(
    candidateRooms: Room[],
    day: number,
    slot: number,
    slotsNeeded: number,
    divisionStrength: number,
    isLab: boolean
  ): Room | null {
    // Practicals run in batches, so a lab only has to seat one batch of the
    // division. Lectures and tutorials need a hall that fits the whole class.
    const requiredCapacity = isLab
      ? Math.ceil(divisionStrength / 2)
      : divisionStrength;

    for (const room of candidateRooms) {
      if (room.capacity < requiredCapacity) continue;

      let allFree = true;
      for (let s = slot; s < slot + slotsNeeded; s++) {
        if (isBusy(roomBusy, room.id, day, s)) {
          allFree = false;
          break;
        }
      }
      if (allFree) return room;
    }
    return null;
  }

  function solve(taskIndex: number): boolean {
    if (taskIndex >= tasks.length) return true; // all tasks placed

    const task = tasks[taskIndex];
    const fac = task.faculty;
    const unavailable = unavailableMap[fac.id] ?? new Set<string>();
    const candidateRooms = task.needsLab ? labRooms : classroomRooms;

    // Try every (day, slot) combination
    for (let day = 1; day <= TOTAL_DAYS; day++) {
      // Respect faculty max_per_day
      if (getDayCount(facultyDayCount, fac.id, day) + task.slotsNeeded > fac.max_per_day) {
        continue;
      }

      for (let slot = 1; slot <= TOTAL_SLOTS; slot++) {
        // For multi-slot tasks, ensure all slots fit within the day
        if (slot + task.slotsNeeded - 1 > TOTAL_SLOTS) continue;

        // For 2-slot practicals, the slots must be truly consecutive
        if (task.slotsNeeded === 2 && !areConsecutive(slot, slot + 1)) continue;

        // Check all needed slots
        let feasible = true;
        for (let s = slot; s < slot + task.slotsNeeded; s++) {
          // Class busy?
          if (classBusy[day][s]) { feasible = false; break; }
          // Faculty busy?
          if (isBusy(facultyBusy, fac.id, day, s)) { feasible = false; break; }
          // Faculty unavailable?
          if (unavailable.has(slotKey(day, s))) { feasible = false; break; }
        }
        if (!feasible) continue;

        // Find a suitable room
        const room = findRoom(
          candidateRooms,
          day,
          slot,
          task.slotsNeeded,
          input.division.strength,
          task.needsLab
        );
        if (!room) continue;

        // ── Place the task ──────────────────────────────────
        for (let s = slot; s < slot + task.slotsNeeded; s++) {
          classBusy[day][s] = true;
          markBusy(facultyBusy, fac.id, day, s);
          markBusy(roomBusy, room.id, day, s);
          incDayCount(facultyDayCount, fac.id, day);

          placed.push({
            day: day as TimetableEntry['day'],
            slot: s as TimetableEntry['slot'],
            subject_id: task.subject.id,
            faculty_id: fac.id,
            room_id: room.id,
            entry_type: task.subject.type,
            is_locked: false,
          });
        }

        // Recurse
        if (solve(taskIndex + 1)) return true;

        // ── Backtrack ───────────────────────────────────────
        backtracks++;
        if (backtracks > BACKTRACK_LIMIT) return false;

        for (let s = slot; s < slot + task.slotsNeeded; s++) {
          delete classBusy[day][s];
          clearBusy(facultyBusy, fac.id, day, s);
          clearBusy(roomBusy, room.id, day, s);
          decDayCount(facultyDayCount, fac.id, day);
          placed.pop();
        }
      }
    }

    return false; // no valid placement found for this task
  }

  const success = solve(0);

  // ── 5. Build result ───────────────────────────────────────
  const clashes: Clash[] = [];

  if (!success) {
    clashes.push({
      type: 'class_conflict',
      day: 0,
      slot: 0,
      details:
        backtracks > BACKTRACK_LIMIT
          ? `Backtrack limit (${BACKTRACK_LIMIT}) exceeded – constraints may be too tight. Placed ${placed.length} of ${tasks.length} tasks.`
          : `Could not place all subjects. Placed ${placed.length} of ${tasks.length} tasks. Consider adding more rooms or relaxing faculty constraints.`,
    });
  }

  return {
    success,
    entries: placed,
    clashes,
    message: success
      ? `Successfully generated timetable with ${placed.length} entries.`
      : `Partial timetable generated (${placed.length} entries). See clashes for details.`,
  };
}
