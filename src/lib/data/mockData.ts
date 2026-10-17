import {
  Department,
  Division,
  Subject,
  Faculty,
  Room,
  User,
  Timetable,
  TimetableEntry,
  ChatRoom,
  ChatMessage,
  Notification,
  DAYS,
  SLOTS,
} from '@/lib/types';

export { DAYS, SLOTS };

// ── Department Heads ──
// One head per branch, so every department in the matrix has a named owner.
const HOD_SEED: [string, string, string, string][] = [
  // [department_id, name, initials, email]
  ['dept-it', 'Dr. Sunita Deshmukh', 'SD', 'hod.it@campus.edu'],
  ['dept-extc', 'Dr. Vikram Rane', 'VR', 'hod.extc@campus.edu'],
  ['dept-aids', 'Dr. Meera Iyer', 'MI', 'hod.aids@campus.edu'],
  ['dept-mech', 'Dr. Anil Deshpande', 'AD', 'hod.mech@campus.edu'],
  ['dept-civil', 'Dr. Kavita Joshi', 'KJ', 'hod.civil@campus.edu'],
  ['dept-elec', 'Dr. Sanjay Bhosale', 'SB', 'hod.elec@campus.edu'],
  ['dept-inst', 'Dr. Nisha Kulkarni', 'NK', 'hod.inst@campus.edu'],
];

const HOD_USERS: User[] = HOD_SEED.map(
  ([department_id, name, faculty_initial, email]) => ({
    id: `user-hod-${department_id.replace('dept-', '')}`,
    name,
    email,
    role: 'hod' as const,
    department_id,
    division_id: null,
    faculty_initial,
    must_change_password: false,
    created_at: '2026-01-01T00:00:00Z',
  })
);

// ── Demo Users ──
export const MOCK_USERS: User[] = [
  {
    id: 'user-mgmt-1',
    name: 'Dr. Arthur Vance (Dean)',
    email: 'management@campus.edu',
    role: 'management',
    department_id: null,
    division_id: null,
    faculty_initial: null,
    must_change_password: false,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-hod-1',
    name: 'Prof. Bhushan Sir',
    email: 'hod.cmpn@campus.edu',
    role: 'hod',
    department_id: 'dept-cmpn',
    division_id: null,
    faculty_initial: 'BS',
    must_change_password: false,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-teach-mj',
    name: 'Prof. Manthan Joshi',
    email: 'teacher.mj@campus.edu',
    role: 'teacher',
    department_id: 'dept-cmpn',
    division_id: 'div-se-a',
    faculty_initial: 'MJ',
    must_change_password: false,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-teach-vp',
    name: 'Prof. Vivek Patil',
    email: 'teacher.vp@campus.edu',
    role: 'teacher',
    department_id: 'dept-cmpn',
    division_id: 'div-se-a',
    faculty_initial: 'VP',
    must_change_password: false,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-teach-sm',
    name: 'Prof. Sneha More',
    email: 'teacher.sm@campus.edu',
    role: 'teacher',
    department_id: 'dept-cmpn',
    division_id: 'div-se-a',
    faculty_initial: 'SM',
    must_change_password: false,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-teach-1',
    name: 'Prof. Anita Sharma',
    email: 'teacher.a1@campus.edu',
    role: 'teacher',
    department_id: 'dept-cmpn',
    division_id: 'div-se-a',
    faculty_initial: 'AS',
    must_change_password: false,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-stud-1',
    name: 'Aarav Patel',
    email: 'student.a1@campus.edu',
    role: 'student',
    department_id: 'dept-cmpn',
    division_id: 'div-se-a',
    faculty_initial: null,
    must_change_password: false,
    created_at: '2026-01-01T00:00:00Z',
  },
  ...HOD_USERS,
];

// ── Departments ──
export const MOCK_DEPARTMENTS: Department[] = [
  {
    id: 'dept-cmpn',
    name: 'Computer Engineering',
    code: 'CMPN',
    hod_id: 'user-hod-1',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dept-it',
    name: 'Information Technology',
    code: 'IT',
    hod_id: 'user-hod-it',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dept-extc',
    name: 'Electronics & Telecommunication',
    code: 'EXTC',
    hod_id: 'user-hod-extc',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dept-aids',
    name: 'Artificial Intelligence & Data Science',
    code: 'AIDS',
    hod_id: 'user-hod-aids',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dept-mech',
    name: 'Mechanical Engineering',
    code: 'MECH',
    hod_id: 'user-hod-mech',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dept-civil',
    name: 'Civil Engineering',
    code: 'CIVIL',
    hod_id: 'user-hod-civil',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dept-elec',
    name: 'Electrical Engineering',
    code: 'ELEC',
    hod_id: 'user-hod-elec',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dept-inst',
    name: 'Instrumentation & Control Engineering',
    code: 'INST',
    hod_id: 'user-hod-inst',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    // First-Year Engineering sits under the Department of Humanities and
    // Applied Sciences. ECS B is its real 2026-27 division.
    id: 'dept-has',
    name: 'Humanities & Applied Sciences',
    code: 'HAS',
    hod_id: 'user-fac-has-vs',
    created_at: '2026-01-01T00:00:00Z',
  },
];

// ── Divisions ──
// Every branch runs its own year-wise classes, so the matrix ships several
// divisions per department instead of one token class each.
const DIVISION_SEED: [string, string, string, number, number][] = [
  // [id, name, department_id, semester, strength]
  ['div-se-a', 'SE-A (CMPN)', 'dept-cmpn', 4, 65],
  ['div-se-b', 'SE-B (CMPN)', 'dept-cmpn', 4, 60],
  ['div-cmpn-te-a', 'TE-A (CMPN)', 'dept-cmpn', 6, 68],
  ['div-cmpn-te-b', 'TE-B (CMPN)', 'dept-cmpn', 6, 62],
  ['div-cmpn-be-a', 'BE-A (CMPN)', 'dept-cmpn', 8, 58],
  ['div-it-se-a', 'SE-A (IT)', 'dept-it', 4, 70],
  ['div-te-a', 'TE-A (IT)', 'dept-it', 6, 66],
  ['div-it-be-a', 'BE-A (IT)', 'dept-it', 8, 60],
  ['div-extc-se-a', 'SE-A (EXTC)', 'dept-extc', 4, 72],
  ['div-extc-te-a', 'TE-A (EXTC)', 'dept-extc', 6, 64],
  ['div-be-extc', 'BE (EXTC)', 'dept-extc', 8, 55],
  ['div-aids-se-a', 'SE-A (AIDS)', 'dept-aids', 4, 68],
  ['div-aids-te-a', 'TE-A (AIDS)', 'dept-aids', 6, 63],
  ['div-mech-se-a', 'SE-A (MECH)', 'dept-mech', 4, 66],
  ['div-mech-te-a', 'TE-A (MECH)', 'dept-mech', 6, 61],
  ['div-mech-be-a', 'BE-A (MECH)', 'dept-mech', 8, 57],
  ['div-civil-se-a', 'SE-A (CIVIL)', 'dept-civil', 4, 64],
  ['div-civil-be-a', 'BE (CIVIL)', 'dept-civil', 8, 52],
  ['div-elec-se-a', 'SE-A (ELEC)', 'dept-elec', 4, 62],
  ['div-elec-te-a', 'TE-A (ELEC)', 'dept-elec', 6, 59],
  ['div-inst-se-a', 'SE-A (INST)', 'dept-inst', 4, 60],
  ['div-inst-be-a', 'BE (INST)', 'dept-inst', 8, 50],
  ['div-ecs-b', 'ECS B (FE)', 'dept-has', 1, 62],
];

/** Divisions that already have a named class teacher in the seeded data. */
const DIVISION_CLASS_TEACHERS: Record<string, string> = {
  'div-se-a': 'user-teach-1',
};

export const MOCK_DIVISIONS: Division[] = DIVISION_SEED.map(
  ([id, name, department_id, semester, strength]) => ({
    id,
    name,
    department_id,
    class_teacher_id: DIVISION_CLASS_TEACHERS[id] ?? null,
    semester,
    strength,
    created_at: '2026-01-01T00:00:00Z',
  })
);

// ── Subjects ──
export const MOCK_SUBJECTS: Subject[] = [
  {
    id: 'sub-dsa',
    code: 'CSC401',
    name: 'Data Structures & Algorithms',
    type: 'lecture',
    weekly_hours: 4,
    needs_lab: false,
    department_id: 'dept-cmpn',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub-dbms',
    code: 'CSC402',
    name: 'Database Management Systems',
    type: 'lecture',
    weekly_hours: 4,
    needs_lab: false,
    department_id: 'dept-cmpn',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub-os',
    code: 'CSC403',
    name: 'Operating Systems',
    type: 'lecture',
    weekly_hours: 3,
    needs_lab: false,
    department_id: 'dept-cmpn',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub-cn',
    code: 'CSC404',
    name: 'Computer Networks',
    type: 'lecture',
    weekly_hours: 3,
    needs_lab: false,
    department_id: 'dept-cmpn',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub-dsa-lab',
    code: 'CSL401',
    name: 'DSA Practical Lab',
    type: 'practical',
    weekly_hours: 2,
    needs_lab: true,
    department_id: 'dept-cmpn',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub-dbms-lab',
    code: 'CSL402',
    name: 'DBMS Practical Lab',
    type: 'practical',
    weekly_hours: 2,
    needs_lab: true,
    department_id: 'dept-cmpn',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub-math-tut',
    code: 'CSM405',
    name: 'Discrete Maths Tutorial',
    type: 'tutorial',
    weekly_hours: 2,
    needs_lab: false,
    department_id: 'dept-cmpn',
    created_at: '2026-01-01T00:00:00Z',
  },
];

// ── ECS B (First Year, Sem I) ──
// Course codes, names, hours and faculty are transcribed from the official
// "Class - ECS B | W.E.F. 18 August 2026 | SEM I | A.Y. 2026-27" sheet.
const ECS_B_SUBJECTS: Subject[] = [
  ['sub-has-em1', '2613111101', 'Engineering Mathematics-I', 'lecture', 4, false],
  ['sub-has-ec1', '2613111102', 'Engineering Chemistry-I', 'lecture', 2, false],
  ['sub-has-bee', '2613121103', 'Basic Electrical & Electronics', 'lecture', 3, false],
  ['sub-has-eg', '2613121104', 'Engineering Graphics', 'lecture', 2, false],
  ['sub-has-cp', '2613211105', 'C-Programming', 'lecture', 2, false],
  ['sub-has-ecl', '2613112106', 'Engineering Chemistry Lab', 'practical', 1, true],
  ['sub-has-beel', '2613122107', 'Basic Electrical & Electronics Lab', 'practical', 2, true],
  ['sub-has-acad', '2613122108', 'Engineering Graphics Lab (ACAD)', 'practical', 2, true],
  ['sub-has-pccl', '2613212109', 'Electronics and Web Simulation', 'practical', 2, true],
  ['sub-has-idea', '2613122110', 'IDEA Lab-I', 'practical', 2, true],
  ['sub-has-cplab', '2613412111', 'C Programming Lab', 'practical', 2, true],
  ['sub-has-uhv', '2698462112', 'Universal Human Values', 'lecture', 2, false],
].map(([id, code, name, type, weekly_hours, needs_lab]) => ({
  id: id as string,
  code: code as string,
  name: name as string,
  type: type as Subject['type'],
  weekly_hours: weekly_hours as number,
  needs_lab: needs_lab as boolean,
  department_id: 'dept-has',
  created_at: '2026-08-18T00:00:00Z',
}));

MOCK_SUBJECTS.push(...ECS_B_SUBJECTS);

// ── Faculty ──
/** Directory lookup so every faculty card can show a real name, not initials. */
export function userById(id: string): User | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}

const CMPN_FACULTY: Faculty[] = [
  {
    id: 'fac-as',
    user_id: 'user-teach-1',
    initials: 'AS',
    max_per_day: 3,
    unavailable_slots: ['1-1'],
    department_id: 'dept-cmpn',
    created_at: '2026-01-01T00:00:00Z',
    user: userById('user-teach-1'),
  },
  {
    id: 'fac-bs',
    user_id: 'user-hod-1',
    initials: 'BS',
    max_per_day: 2,
    unavailable_slots: ['5-7'],
    department_id: 'dept-cmpn',
    created_at: '2026-01-01T00:00:00Z',
    user: userById('user-hod-1'),
  },
  {
    id: 'fac-vp',
    user_id: 'user-teach-vp',
    initials: 'VP',
    max_per_day: 4,
    unavailable_slots: [],
    department_id: 'dept-cmpn',
    created_at: '2026-01-01T00:00:00Z',
    user: userById('user-teach-vp'),
  },
  {
    id: 'fac-sm',
    user_id: 'user-teach-sm',
    initials: 'SM',
    max_per_day: 3,
    unavailable_slots: [],
    department_id: 'dept-cmpn',
    created_at: '2026-01-01T00:00:00Z',
    user: userById('user-teach-sm'),
  },
  {
    id: 'fac-mj',
    user_id: 'user-teach-mj',
    initials: 'MJ',
    max_per_day: 4,
    unavailable_slots: ['2-7'],
    department_id: 'dept-cmpn',
    created_at: '2026-01-01T00:00:00Z',
    user: userById('user-teach-mj'),
  },
];

// ── Faculty for the remaining branches ──
// Each branch ships a small teaching roster so its timetables can actually be
// scheduled and edited, not just listed.
const BRANCH_FACULTY_SEED: Record<string, [string, string][]> = {
  IT: [
    ['Nilesh Pawar', 'NP'],
    ['Shreya Naik', 'SN'],
  ],
  EXTC: [
    ['Amit Kulkarni', 'AK'],
    ['Pooja Kamble', 'PK'],
  ],
  AIDS: [
    ['Rohan Shetty', 'RS'],
    ['Tanvi Joshi', 'TJ'],
  ],
  MECH: [
    ['Sameer Gaikwad', 'SG'],
    ['Rutuja Patil', 'RP'],
  ],
  CIVIL: [
    ['Mahesh Jadhav', 'MJD'],
    ['Asha Nair', 'ASN'],
  ],
  ELEC: [
    ['Kiran Shinde', 'KS'],
    ['Aarti More', 'AM'],
  ],
  INST: [
    ['Dinesh Patil', 'DP'],
    ['Shruti Bhosale', 'SBH'],
  ],
};

const BRANCH_FACULTY_USERS: User[] = [];
const BRANCH_FACULTY: Faculty[] = [];

for (const dept of Object.keys(BRANCH_FACULTY_SEED)) {
  const departmentId = `dept-${dept.toLowerCase()}`;
  for (const [name, initials] of BRANCH_FACULTY_SEED[dept]) {
    const userId = `user-teach-${dept.toLowerCase()}-${initials.toLowerCase()}`;
    const user: User = {
      id: userId,
      name: `Prof. ${name}`,
      email: `${dept.toLowerCase()}.${initials.toLowerCase()}@campus.edu`,
      role: 'teacher',
      department_id: departmentId,
      division_id: null,
      faculty_initial: initials,
      must_change_password: false,
      created_at: '2026-01-01T00:00:00Z',
    };
    BRANCH_FACULTY_USERS.push(user);
    BRANCH_FACULTY.push({
      id: `fac-${dept.toLowerCase()}-${initials.toLowerCase()}`,
      user_id: userId,
      initials,
      max_per_day: 4,
      unavailable_slots: [],
      department_id: departmentId,
      created_at: '2026-01-01T00:00:00Z',
      user,
    });
  }
}

MOCK_USERS.push(...BRANCH_FACULTY_USERS);

// ── ECS B teaching roster ──
// Every name, initial and subject allocation comes from the ECS B sheet.
const ECS_B_FACULTY_SEED: [string, string, string, string][] = [
  // [initials, name, email local-part, role in the class]
  ['PR', 'Mr. Priti Raut', 'pr', 'Engineering Mathematics-I'],
  ['LT', 'Dr. Lahu Teli', 'lt', 'Engineering Chemistry-I / FE In-Charge'],
  ['MG', 'Ms. Manjiri Gogate', 'mg', 'Basic Electrical & Electronics'],
  ['BK', 'Mr. Bhagyesh Kasle', 'bk', 'Engineering Graphics'],
  ['PB', 'Ms. Poonam Bawankar', 'pb', 'C-Programming'],
  ['AG', 'Ms. Akshata Gondhalekar', 'ag', 'Engineering Graphics Lab (ACAD)'],
  ['DP', 'Mr. Durgesh Pal', 'dp', 'Engineering Graphics Lab (ACAD)'],
  ['NA', 'Mr. Nesar Ahmad', 'na', 'Basic Electrical & Electronics Lab'],
  ['AD', 'Mr. Aditya Desai', 'ad', 'Electronics and Web Simulation'],
  ['SB', 'Ms. Samita Bhandari', 'sb', 'IDEA Lab-I'],
  ['VS', 'Dr. Vinayak Shinde', 'vs', 'C Programming Lab / Class In-charge'],
  ['AKG', 'Ms. Amee Ghadia', 'akg', 'Universal Human Values'],
  ['BM', 'Mr. Bhavik Modi', 'bm', 'Time Table In-charge'],
];

const ECS_B_FACULTY_USERS: User[] = ECS_B_FACULTY_SEED.map(
  ([initials, name, localPart]) => ({
    id: `user-fac-has-${localPart}`,
    name,
    email: `has.${localPart}@campus.edu`,
    role: 'teacher' as const,
    department_id: 'dept-has',
    division_id: 'div-ecs-b',
    faculty_initial: initials,
    must_change_password: false,
    created_at: '2026-08-18T00:00:00Z',
  })
);

MOCK_USERS.push(...ECS_B_FACULTY_USERS);

const ECS_B_FACULTY: Faculty[] = ECS_B_FACULTY_SEED.map(([initials, , localPart]) => ({
  id: `fac-has-${localPart}`,
  user_id: `user-fac-has-${localPart}`,
  initials,
  max_per_day: 5,
  unavailable_slots: [],
  department_id: 'dept-has',
  created_at: '2026-08-18T00:00:00Z',
  user: ECS_B_FACULTY_USERS.find((u) => u.faculty_initial === initials),
}));

export const MOCK_FACULTY: Faculty[] = [
  ...CMPN_FACULTY,
  ...BRANCH_FACULTY,
  ...ECS_B_FACULTY,
];

/** Faculty that belong to one branch (used by the editor and generator). */
export function facultyForDepartment(departmentId: string): Faculty[] {
  return MOCK_FACULTY.filter((f) => f.department_id === departmentId);
}

// ── Subjects for the remaining branches ──
// Generated from one academic template so every branch has a schedulable, but
// branch-coded, subject set (`IT301`, `MECH304`, …).
const BRANCH_SUBJECT_TEMPLATE: [string, string, Subject['type'], number, boolean][] = [
  ['301', 'Applied Mathematics III', 'lecture', 4, false],
  ['302', 'Core Systems & Architecture', 'lecture', 4, false],
  ['303', 'Design & Analysis', 'lecture', 3, false],
  ['304', 'Laboratory Practice', 'practical', 2, true],
  ['305', 'Seminar & Tutorial', 'tutorial', 2, false],
];

for (const dept of MOCK_DEPARTMENTS) {
  if (dept.code === 'CMPN' || dept.code === 'HAS') continue;
  BRANCH_SUBJECT_TEMPLATE.forEach(([suffix, name, type, hours, lab], index) => {
    MOCK_SUBJECTS.push({
      id: `sub-${dept.code.toLowerCase()}-${index + 1}`,
      code: `${dept.code}${suffix}`,
      name,
      type,
      weekly_hours: hours,
      needs_lab: lab,
      department_id: dept.id,
      created_at: '2026-01-01T00:00:00Z',
    });
  });
}

/** Subjects offered by one branch (used by the editor and generator). */
export function subjectsForDepartment(departmentId: string): Subject[] {
  return MOCK_SUBJECTS.filter((s) => s.department_id === departmentId);
}

// ── Rooms ──
// ECS B's real rooms. 111/103/104/105/304L/312/503 host labs; 201/206/209 are
// the first-year classrooms used by the theory periods.
const ECS_B_ROOMS: Room[] = [
  ['room-has-201', '201', 'classroom', 70],
  ['room-has-206', '206', 'classroom', 70],
  ['room-has-209', '209', 'classroom', 70],
  ['room-has-103', '103', 'lab', 35],
  ['room-has-104', '104', 'lab', 35],
  ['room-has-105', '105', 'lab', 35],
  ['room-has-111', '111', 'lab', 70],
  ['room-has-304l', '304L', 'lab', 35],
  ['room-has-312', '312', 'lab', 35],
  ['room-has-503', '503', 'lab', 35],
].map(([id, number, type, capacity]) => ({
  id: id as string,
  number: number as string,
  type: type as Room['type'],
  capacity: capacity as number,
  created_at: '2026-08-18T00:00:00Z',
}));

export const MOCK_ROOMS: Room[] = [
  {
    id: 'room-301',
    number: 'LH-301',
    type: 'classroom',
    capacity: 75,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'room-302',
    number: 'LH-302',
    type: 'classroom',
    capacity: 75,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'room-lab1',
    number: 'Lab-101 (Systems)',
    type: 'lab',
    capacity: 35,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'room-lab2',
    number: 'Lab-102 (Database)',
    type: 'lab',
    capacity: 35,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'room-sem',
    number: 'Auditorium-A',
    type: 'seminar',
    capacity: 150,
    created_at: '2026-01-01T00:00:00Z',
  },
  ...ECS_B_ROOMS,
];

// ── ECS B timetable (transcribed from ECS B.pdf) ──
// The official sheet is eight periods wide with a moving lunch period: P4 on
// Mon/Wed/Fri and P6 on Tue/Thu. Lab batches run in parallel, which is why an
// entry can carry a batch label.
const HAS_SUBJECT = (suffix: string): Subject => {
  const subject = MOCK_SUBJECTS.find((s) => s.id === `sub-has-${suffix}`);
  if (!subject) throw new Error(`Missing ECS B subject: ${suffix}`);
  return subject;
};

const HAS_FACULTY = (initials: string): Faculty => {
  const teacher = MOCK_FACULTY.find(
    (f) => f.department_id === 'dept-has' && f.initials === initials
  );
  if (!teacher) throw new Error(`Missing ECS B faculty: ${initials}`);
  return teacher;
};

const HAS_ROOM = (number: string): Room => {
  const room = ECS_B_ROOMS.find((r) => r.number === number);
  if (!room) throw new Error(`Missing ECS B room: ${number}`);
  return room;
};

let ecsEntryCounter = 0;

function ecsEntry(
  day: number,
  slot: number,
  subject: string,
  initials: string,
  room: string,
  batch: string | null = null
): TimetableEntry {
  ecsEntryCounter += 1;
  const subj = HAS_SUBJECT(subject);
  return {
    id: `ecs-b-${ecsEntryCounter}`,
    timetable_id: 'tt-ecs-b-pub',
    day: day as TimetableEntry['day'],
    slot: slot as TimetableEntry['slot'],
    subject_id: subj.id,
    faculty_id: HAS_FACULTY(initials).id,
    room_id: HAS_ROOM(room).id,
    entry_type: subj.type,
    is_locked: true,
    batch,
    subject: subj,
    faculty: HAS_FACULTY(initials),
    room: HAS_ROOM(room),
  };
}

const ECS_B_ENTRIES: TimetableEntry[] = [
  // Monday — ACAD lab (both batches), then UHV, EM-I, EC-I, BEE
  ecsEntry(1, 1, 'acad', 'AG', '111', 'B1'),
  ecsEntry(1, 2, 'acad', 'AG', '111', 'B1'),
  ecsEntry(1, 1, 'acad', 'DP', '111', 'B2'),
  ecsEntry(1, 2, 'acad', 'DP', '111', 'B2'),
  ecsEntry(1, 3, 'uhv', 'AKG', '209'),
  ecsEntry(1, 5, 'em1', 'PR', '209'),
  ecsEntry(1, 6, 'ec1', 'LT', '209'),
  ecsEntry(1, 7, 'bee', 'MG', '209'),

  // Tuesday — B1 in BEE lab, B2 in EM-I tutorial then EC lab; break at P6
  ecsEntry(2, 3, 'beel', 'MG', '104', 'B1'),
  ecsEntry(2, 4, 'beel', 'MG', '104', 'B1'),
  // EM-I tutorials are numbered separately from the lab batches (T1/T2).
  ecsEntry(2, 3, 'em1', 'PR', '105', 'T2'),
  ecsEntry(2, 4, 'ecl', 'LT', '103', 'B2'),
  ecsEntry(2, 5, 'eg', 'BK', '209'),
  ecsEntry(2, 7, 'cplab', 'PB', '111', 'B1'),
  ecsEntry(2, 8, 'cplab', 'PB', '111', 'B1'),
  ecsEntry(2, 7, 'cplab', 'VS', '111', 'B2'),
  ecsEntry(2, 8, 'cplab', 'VS', '111', 'B2'),

  // Wednesday — three theory periods, then the Idea/PCCL lab rotation
  ecsEntry(3, 1, 'bee', 'MG', '201'),
  ecsEntry(3, 2, 'ec1', 'LT', '201'),
  ecsEntry(3, 3, 'cp', 'PB', '201'),
  ecsEntry(3, 5, 'idea', 'SB', '304L', 'B1'),
  ecsEntry(3, 6, 'idea', 'SB', '304L', 'B1'),
  ecsEntry(3, 5, 'pccl', 'AD', '312', 'B2'),
  ecsEntry(3, 6, 'pccl', 'AD', '312', 'B2'),

  // Thursday — lab rotation, break at P6, then EM-I and EG
  ecsEntry(4, 3, 'beel', 'MG', '104', 'B2'),
  ecsEntry(4, 4, 'beel', 'MG', '104', 'B2'),
  // Engineering Chemistry Lab is a 1-hour practical in the curriculum.
  ecsEntry(4, 4, 'ecl', 'LT', '103', 'B1'),
  ecsEntry(4, 4, 'em1', 'PR', '206', 'T1'),
  ecsEntry(4, 5, 'cp', 'PB', '206'),
  ecsEntry(4, 7, 'em1', 'PR', '206'),
  ecsEntry(4, 8, 'eg', 'BK', '206'),

  // Friday — three theory periods, then the reverse Idea/PCCL rotation
  ecsEntry(5, 1, 'uhv', 'AKG', '206'),
  ecsEntry(5, 2, 'em1', 'PR', '206'),
  ecsEntry(5, 3, 'bee', 'MG', '206'),
  ecsEntry(5, 5, 'idea', 'SB', '503', 'B2'),
  ecsEntry(5, 6, 'idea', 'SB', '503', 'B2'),
  ecsEntry(5, 5, 'pccl', 'AD', '312', 'B1'),
  ecsEntry(5, 6, 'pccl', 'AD', '312', 'B1'),
];

// ── Sample Timetable Entries (Division SE-A) ──
export const MOCK_ENTRIES_SE_A: TimetableEntry[] = [
  // Monday
  {
    id: 'entry-mon-1',
    timetable_id: 'tt-se-a-pub',
    day: 1,
    slot: 1,
    subject_id: 'sub-dsa',
    faculty_id: 'fac-bs',
    room_id: 'room-301',
    entry_type: 'lecture',
    is_locked: false,
    subject: MOCK_SUBJECTS[0],
    faculty: MOCK_FACULTY[1],
    room: MOCK_ROOMS[0],
  },
  {
    id: 'entry-mon-2',
    timetable_id: 'tt-se-a-pub',
    day: 1,
    slot: 2,
    subject_id: 'sub-dbms',
    faculty_id: 'fac-as',
    room_id: 'room-301',
    entry_type: 'lecture',
    is_locked: false,
    subject: MOCK_SUBJECTS[1],
    faculty: MOCK_FACULTY[0],
    room: MOCK_ROOMS[0],
  },
  {
    id: 'entry-mon-3',
    timetable_id: 'tt-se-a-pub',
    day: 1,
    slot: 3,
    subject_id: 'sub-os',
    faculty_id: 'fac-vp',
    room_id: 'room-301',
    entry_type: 'lecture',
    is_locked: false,
    subject: MOCK_SUBJECTS[2],
    faculty: MOCK_FACULTY[2],
    room: MOCK_ROOMS[0],
  },
  {
    id: 'entry-mon-4',
    timetable_id: 'tt-se-a-pub',
    day: 1,
    slot: 4,
    subject_id: 'sub-cn',
    faculty_id: 'fac-mj',
    room_id: 'room-301',
    entry_type: 'lecture',
    is_locked: false,
    subject: MOCK_SUBJECTS[3],
    faculty: MOCK_FACULTY[4],
    room: MOCK_ROOMS[0],
  },
  // Slot 5 & 6: 2-slot Practical Lab
  {
    id: 'entry-mon-5',
    timetable_id: 'tt-se-a-pub',
    day: 1,
    slot: 5,
    subject_id: 'sub-dsa-lab',
    faculty_id: 'fac-bs',
    room_id: 'room-lab1',
    entry_type: 'practical',
    is_locked: true,
    subject: MOCK_SUBJECTS[4],
    faculty: MOCK_FACULTY[1],
    room: MOCK_ROOMS[2],
  },
  {
    id: 'entry-mon-6',
    timetable_id: 'tt-se-a-pub',
    day: 1,
    slot: 6,
    subject_id: 'sub-dsa-lab',
    faculty_id: 'fac-bs',
    room_id: 'room-lab1',
    entry_type: 'practical',
    is_locked: true,
    subject: MOCK_SUBJECTS[4],
    faculty: MOCK_FACULTY[1],
    room: MOCK_ROOMS[2],
  },
  {
    id: 'entry-mon-7',
    timetable_id: 'tt-se-a-pub',
    day: 1,
    slot: 7,
    subject_id: 'sub-math-tut',
    faculty_id: 'fac-sm',
    room_id: 'room-301',
    entry_type: 'tutorial',
    is_locked: false,
    subject: MOCK_SUBJECTS[6],
    faculty: MOCK_FACULTY[3],
    room: MOCK_ROOMS[0],
  },

  // Tuesday
  {
    id: 'entry-tue-1',
    timetable_id: 'tt-se-a-pub',
    day: 2,
    slot: 1,
    subject_id: 'sub-os',
    faculty_id: 'fac-vp',
    room_id: 'room-301',
    entry_type: 'lecture',
    is_locked: false,
    subject: MOCK_SUBJECTS[2],
    faculty: MOCK_FACULTY[2],
    room: MOCK_ROOMS[0],
  },
  {
    id: 'entry-tue-2',
    timetable_id: 'tt-se-a-pub',
    day: 2,
    slot: 2,
    subject_id: 'sub-dsa',
    faculty_id: 'fac-bs',
    room_id: 'room-301',
    entry_type: 'lecture',
    is_locked: false,
    subject: MOCK_SUBJECTS[0],
    faculty: MOCK_FACULTY[1],
    room: MOCK_ROOMS[0],
  },
  {
    id: 'entry-tue-3',
    timetable_id: 'tt-se-a-pub',
    day: 2,
    slot: 3,
    subject_id: 'sub-dbms',
    faculty_id: 'fac-as',
    room_id: 'room-301',
    entry_type: 'lecture',
    is_locked: false,
    subject: MOCK_SUBJECTS[1],
    faculty: MOCK_FACULTY[0],
    room: MOCK_ROOMS[0],
  },
  {
    id: 'entry-tue-4',
    timetable_id: 'tt-se-a-pub',
    day: 2,
    slot: 4,
    subject_id: 'sub-cn',
    faculty_id: 'fac-mj',
    room_id: 'room-301',
    entry_type: 'lecture',
    is_locked: false,
    subject: MOCK_SUBJECTS[3],
    faculty: MOCK_FACULTY[4],
    room: MOCK_ROOMS[0],
  },
  // Tuesday practical
  {
    id: 'entry-tue-5',
    timetable_id: 'tt-se-a-pub',
    day: 2,
    slot: 5,
    subject_id: 'sub-dbms-lab',
    faculty_id: 'fac-as',
    room_id: 'room-lab2',
    entry_type: 'practical',
    is_locked: true,
    subject: MOCK_SUBJECTS[5],
    faculty: MOCK_FACULTY[0],
    room: MOCK_ROOMS[3],
  },
  {
    id: 'entry-tue-6',
    timetable_id: 'tt-se-a-pub',
    day: 2,
    slot: 6,
    subject_id: 'sub-dbms-lab',
    faculty_id: 'fac-as',
    room_id: 'room-lab2',
    entry_type: 'practical',
    is_locked: true,
    subject: MOCK_SUBJECTS[5],
    faculty: MOCK_FACULTY[0],
    room: MOCK_ROOMS[3],
  },

  // Wednesday
  {
    id: 'entry-wed-1',
    timetable_id: 'tt-se-a-pub',
    day: 3,
    slot: 1,
    subject_id: 'sub-cn',
    faculty_id: 'fac-mj',
    room_id: 'room-301',
    entry_type: 'lecture',
    is_locked: false,
    subject: MOCK_SUBJECTS[3],
    faculty: MOCK_FACULTY[4],
    room: MOCK_ROOMS[0],
  },
  {
    id: 'entry-wed-2',
    timetable_id: 'tt-se-a-pub',
    day: 3,
    slot: 2,
    subject_id: 'sub-dsa',
    faculty_id: 'fac-bs',
    room_id: 'room-301',
    entry_type: 'lecture',
    is_locked: false,
    subject: MOCK_SUBJECTS[0],
    faculty: MOCK_FACULTY[1],
    room: MOCK_ROOMS[0],
  },
  {
    id: 'entry-wed-3',
    timetable_id: 'tt-se-a-pub',
    day: 3,
    slot: 3,
    subject_id: 'sub-dbms',
    faculty_id: 'fac-as',
    room_id: 'room-301',
    entry_type: 'lecture',
    is_locked: false,
    subject: MOCK_SUBJECTS[1],
    faculty: MOCK_FACULTY[0],
    room: MOCK_ROOMS[0],
  },
  {
    id: 'entry-wed-4',
    timetable_id: 'tt-se-a-pub',
    day: 3,
    slot: 4,
    subject_id: 'sub-os',
    faculty_id: 'fac-vp',
    room_id: 'room-301',
    entry_type: 'lecture',
    is_locked: false,
    subject: MOCK_SUBJECTS[2],
    faculty: MOCK_FACULTY[2],
    room: MOCK_ROOMS[0],
  },

  // Thursday
  {
    id: 'entry-thu-1',
    timetable_id: 'tt-se-a-pub',
    day: 4,
    slot: 1,
    subject_id: 'sub-dbms',
    faculty_id: 'fac-as',
    room_id: 'room-301',
    entry_type: 'lecture',
    is_locked: false,
    subject: MOCK_SUBJECTS[1],
    faculty: MOCK_FACULTY[0],
    room: MOCK_ROOMS[0],
  },
  {
    id: 'entry-thu-2',
    timetable_id: 'tt-se-a-pub',
    day: 4,
    slot: 2,
    subject_id: 'sub-dsa',
    faculty_id: 'fac-bs',
    room_id: 'room-301',
    entry_type: 'lecture',
    is_locked: false,
    subject: MOCK_SUBJECTS[0],
    faculty: MOCK_FACULTY[1],
    room: MOCK_ROOMS[0],
  },
  {
    id: 'entry-thu-3',
    timetable_id: 'tt-se-a-pub',
    day: 4,
    slot: 3,
    subject_id: 'sub-math-tut',
    faculty_id: 'fac-sm',
    room_id: 'room-301',
    entry_type: 'tutorial',
    is_locked: false,
    subject: MOCK_SUBJECTS[6],
    faculty: MOCK_FACULTY[3],
    room: MOCK_ROOMS[0],
  },

  // Friday
  {
    id: 'entry-fri-1',
    timetable_id: 'tt-se-a-pub',
    day: 5,
    slot: 1,
    subject_id: 'sub-os',
    faculty_id: 'fac-vp',
    room_id: 'room-301',
    entry_type: 'lecture',
    is_locked: false,
    subject: MOCK_SUBJECTS[2],
    faculty: MOCK_FACULTY[2],
    room: MOCK_ROOMS[0],
  },
  {
    id: 'entry-fri-2',
    timetable_id: 'tt-se-a-pub',
    day: 5,
    slot: 2,
    subject_id: 'sub-cn',
    faculty_id: 'fac-mj',
    room_id: 'room-301',
    entry_type: 'lecture',
    is_locked: false,
    subject: MOCK_SUBJECTS[3],
    faculty: MOCK_FACULTY[4],
    room: MOCK_ROOMS[0],
  },
  {
    id: 'entry-fri-3',
    timetable_id: 'tt-se-a-pub',
    day: 5,
    slot: 3,
    subject_id: 'sub-dbms',
    faculty_id: 'fac-as',
    room_id: 'room-301',
    entry_type: 'lecture',
    is_locked: false,
    subject: MOCK_SUBJECTS[1],
    faculty: MOCK_FACULTY[0],
    room: MOCK_ROOMS[0],
  },
];

// ── Timetables ──
export const MOCK_TIMETABLES: Timetable[] = [
  {
    id: 'tt-ecs-b-pub',
    department_id: 'dept-has',
    division_id: 'div-ecs-b',
    status: 'published',
    created_by: 'user-fac-has-vs',
    approved_by: 'user-mgmt-1',
    academic_year: '2026-27 (Sem I)',
    created_at: '2026-08-18T09:00:00Z',
    updated_at: '2026-08-18T09:00:00Z',
    division: MOCK_DIVISIONS.find((d) => d.id === 'div-ecs-b'),
    department: MOCK_DEPARTMENTS.find((d) => d.id === 'dept-has'),
    breaks: [
      { day: 1, slot: 4 },
      { day: 2, slot: 6 },
      { day: 3, slot: 4 },
      { day: 4, slot: 6 },
      { day: 5, slot: 4 },
    ],
    entries: ECS_B_ENTRIES,
  },
  {
    id: 'tt-se-a-pub',
    department_id: 'dept-cmpn',
    division_id: 'div-se-a',
    status: 'published',
    created_by: 'user-hod-1',
    approved_by: 'user-mgmt-1',
    academic_year: '2026-2027 (Even)',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-05T14:30:00Z',
    division: MOCK_DIVISIONS[0],
    department: MOCK_DEPARTMENTS[0],
    breaks: [1, 2, 3, 4, 5].map((day) => ({ day, slot: 4 })),
    entries: MOCK_ENTRIES_SE_A,
  },
  {
    id: 'tt-se-b-draft',
    department_id: 'dept-cmpn',
    division_id: 'div-se-b',
    status: 'draft',
    created_by: 'user-hod-1',
    approved_by: null,
    academic_year: '2026-2027 (Even)',
    created_at: '2026-02-10T11:00:00Z',
    updated_at: '2026-02-10T11:00:00Z',
    division: MOCK_DIVISIONS[1],
    department: MOCK_DEPARTMENTS[0],
    entries: [],
  },
  // Draft schedules for the other branches, so Management has real rows to
  // open and edit in every department from day one.
  ...(['dept-it', 'dept-extc', 'dept-aids'] as const).map(
    (departmentId, index) => {
      const department = MOCK_DEPARTMENTS.find((d) => d.id === departmentId)!;
      const division = MOCK_DIVISIONS.find(
        (d) => d.department_id === departmentId
      )!;
      return {
        id: `tt-${department.code.toLowerCase()}-draft`,
        department_id: departmentId,
        division_id: division.id,
        status: 'draft' as const,
        created_by: department.hod_id ?? 'user-mgmt-1',
        approved_by: null,
        academic_year: '2026-2027 (Even)',
        created_at: `2026-02-1${index + 1}T09:00:00Z`,
        updated_at: `2026-02-1${index + 1}T09:00:00Z`,
        division,
        department,
        entries: [],
      } as Timetable;
    }
  ),
];

// ── Chat Rooms & Messages ──
export const MOCK_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'room-general',
    name: '📢 Campus General Announcements',
    type: 'general',
    department_id: null,
    division_id: null,
  },
  {
    id: 'room-dept-cmpn',
    name: '💻 CMPN Department Faculty',
    type: 'department',
    department_id: 'dept-cmpn',
    division_id: null,
  },
  {
    id: 'room-div-se-a',
    name: '🎓 SE-A Class Discussion',
    type: 'class',
    department_id: 'dept-cmpn',
    division_id: 'div-se-a',
  },
  {
    id: 'room-hod',
    name: '🛡️ HOD & Management Council',
    type: 'hod',
    department_id: null,
    division_id: null,
  },
];

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    room_id: 'room-general',
    sender_id: 'user-mgmt-1',
    text: 'Welcome to Campus Clock! The Even Semester 2026 timetables are being finalized.',
    created_at: '2026-02-12T09:00:00Z',
    sender: { name: 'Dr. Arthur Vance (Dean)', role: 'management' },
  },
  {
    id: 'msg-2',
    room_id: 'room-dept-cmpn',
    sender_id: 'user-hod-1',
    text: 'All CMPN faculty, please verify your unavailable slots before generation.',
    created_at: '2026-02-12T10:15:00Z',
    sender: { name: 'Prof. Bhushan Sir', role: 'hod' },
  },
  {
    id: 'msg-3',
    room_id: 'room-dept-cmpn',
    sender_id: 'user-teach-1',
    text: 'Verified my schedule. Ready for timetable publish!',
    created_at: '2026-02-12T10:22:00Z',
    sender: { name: 'Prof. Anita Sharma', role: 'teacher' },
  },
  {
    id: 'msg-4',
    room_id: 'room-div-se-a',
    sender_id: 'user-teach-1',
    text: 'Students, the new timetable is live. Lab sessions start next Monday in Lab-101.',
    created_at: '2026-02-12T11:00:00Z',
    sender: { name: 'Prof. Anita Sharma', role: 'teacher' },
  },
  {
    id: 'msg-5',
    room_id: 'room-div-se-a',
    sender_id: 'user-stud-1',
    text: 'Thank you Professor! Got the schedule on my dashboard.',
    created_at: '2026-02-12T11:05:00Z',
    sender: { name: 'Aarav Patel', role: 'student' },
  },
];

// ── Notifications ──
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'user-stud-1',
    type: 'publish',
    message: 'SE-A Even Semester Timetable has been officially published!',
    read: false,
    link: '/dashboard/timetable/tt-se-a-pub',
    created_at: '2026-02-12T10:30:00Z',
  },
  {
    id: 'notif-2',
    user_id: 'user-teach-1',
    type: 'publish',
    message: 'Timetable published for SE-A. 5 lectures & 2 labs assigned.',
    read: false,
    link: '/dashboard/timetable/tt-se-a-pub',
    created_at: '2026-02-12T10:30:00Z',
  },
  {
    id: 'notif-3',
    user_id: 'user-hod-1',
    type: 'system',
    message: 'Generator completed 0-clash optimization for SE-B draft.',
    read: true,
    link: '/dashboard/generate',
    created_at: '2026-02-12T09:45:00Z',
  },
];

