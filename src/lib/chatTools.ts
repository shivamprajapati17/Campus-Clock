// ─────────────────────────────────────────────────────────────
// Campus Clock – Chatbot tools
//
// The assistant answers from the same seeded timetable data the app renders:
// free-faculty lookup, today's timetable, publishing and export guidance. It is
// deliberately dependency-free so the bot still works with no API key and no
// network — the LLM is an enhancement, never a requirement.
// ─────────────────────────────────────────────────────────────

import { DAYS, SLOTS, type Timetable, type TimetableEntry, type UserRole } from '@/lib/types';
import {
  MOCK_DIVISIONS,
  MOCK_FACULTY,
  MOCK_TIMETABLES,
} from '@/lib/data/mockData';

export type ChatLang = 'en' | 'hi' | 'es' | 'fr';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequestContext {
  role?: UserRole;
  divisionId?: string | null;
  divisionName?: string | null;
  day?: number;
  slot?: number;
}

export type ChatIntent =
  | 'free'
  | 'today'
  | 'timetable'
  | 'publish'
  | 'export'
  | 'permissions'
  | 'greeting'
  | 'help';

export const LANGUAGE_LABELS: Record<ChatLang, string> = {
  en: 'English',
  hi: 'हिन्दी',
  es: 'Español',
  fr: 'Français',
};

const DAY_NAMES: Record<ChatLang, string[]> = {
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  hi: ['सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार'],
  es: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
  fr: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
};

const ROLE_NAMES: Record<ChatLang, Record<UserRole, string>> = {
  en: {
    management: 'Management',
    hod: 'HOD',
    teacher: 'Teacher',
    student: 'Student',
  },
  hi: {
    management: 'प्रबंधन',
    hod: 'विभागाध्यक्ष',
    teacher: 'शिक्षक',
    student: 'छात्र',
  },
  es: {
    management: 'Dirección',
    hod: 'Jefe de departamento',
    teacher: 'Profesor',
    student: 'Estudiante',
  },
  fr: {
    management: 'Direction',
    hod: 'Chef de département',
    teacher: 'Enseignant',
    student: 'Étudiant',
  },
};

export function isChatLang(value: unknown): value is ChatLang {
  return value === 'en' || value === 'hi' || value === 'es' || value === 'fr';
}

export function isUserRole(value: unknown): value is UserRole {
  return (
    value === 'management' ||
    value === 'hod' ||
    value === 'teacher' ||
    value === 'student'
  );
}

/** Weekday index 1–5, clamped to Monday on weekends. */
export function todayIndex(date = new Date()): number {
  const day = date.getDay();
  if (day === 0 || day === 6) return 1;
  return day;
}

/** Period index 1–8 for the current clock, clamped to the college day. */
export function currentSlot(date = new Date()): number {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const ranges = Object.entries(SLOTS).map(([slot, info]) => {
    const [startH, startM] = info.start.split(':').map(Number);
    return { slot: Number(slot), minutes: startH * 60 + startM };
  });
  let current = 1;
  for (const range of ranges) {
    if (minutes >= range.minutes) current = range.slot;
  }
  return current;
}

function publishedTimetables(): Timetable[] {
  return MOCK_TIMETABLES.filter((t) => t.status === 'published');
}

function findDivision(divisionId?: string | null, question = ''): Timetable | undefined {
  const published = publishedTimetables();
  if (divisionId) {
    const exact = published.find((t) => t.division_id === divisionId);
    if (exact) return exact;
  }

  const q = question.toLowerCase();
  if (q.includes('ecs b') || q.includes('ecs-b')) {
    const ecs = published.find((t) => t.division_id === 'div-ecs-b');
    if (ecs) return ecs;
  }
  if (q.includes('se-a') || q.includes('se a')) {
    const se = published.find((t) => t.division_id === 'div-se-a');
    if (se) return se;
  }

  return published[0];
}

function entryLabel(entry: TimetableEntry): string {
  const code = entry.subject?.code ?? 'Subject';
  const initials = entry.faculty?.initials ?? 'FAC';
  const room = entry.room?.number ?? 'Room';
  const batch = entry.batch ? ` (${entry.batch})` : '';
  return `${code} · ${initials} · ${room}${batch}`;
}

/** Teachers with no class in any published timetable at day/slot. */
export function getFreeFaculty(day: number, slot: number) {
  const busy = new Set<string>();
  publishedTimetables().forEach((timetable) => {
    (timetable.entries ?? []).forEach((entry) => {
      if (entry.day === day && entry.slot === slot) busy.add(entry.faculty_id);
    });
  });

  const free = MOCK_FACULTY.filter((f) => !busy.has(f.id));
  return {
    day,
    slot,
    total: free.length,
    totalFaculty: MOCK_FACULTY.length,
    names: free.map((f) => ({
      initials: f.initials,
      name: f.user?.name ?? f.initials,
    })),
  };
}

/** Today's periods for one division, including its break row. */
export function getDayTimetable(divisionId: string | null | undefined, day: number) {
  const timetable = findDivision(divisionId);
  if (!timetable) return null;

  const entries = (timetable.entries ?? [])
    .filter((e) => e.day === day)
    .sort((a, b) => a.slot - b.slot || (a.batch ?? '').localeCompare(b.batch ?? ''));

  const breaks = (timetable.breaks ?? [])
    .filter((b) => b.day === day)
    .map((b) => b.slot);

  return {
    timetable,
    division: timetable.division?.name ?? timetable.division_id,
    day,
    entries,
    breaks,
  };
}

export function detectIntent(text: string): ChatIntent {
  const q = text.toLowerCase();

  if (/(^|\b)(hi|hello|hey|namaste|hola|bonjour|namaskar)(\b|$)/.test(q) || /नमस्ते/.test(q)) {
    return 'greeting';
  }
  if (/(free|available|khali|खाली|फ्री|libre|libres|disponible|gratis)/.test(q)) {
    return 'free';
  }
  if (/(export|pdf|excel|download|डाउनलोड|निर्यात|descargar|exporter|télécharger|exportar)/.test(q)) {
    return 'export';
  }
  if (/(publish|publ\w*|प्रकाशित|प्रकाशन|draft|borrador|brouillon)/.test(q)) {
    return 'publish';
  }
  if (/(permission|role|who can|अधिकार|अनुमति|permiso|rôle|droits)/.test(q)) {
    return 'permissions';
  }
  if (/(today|aaj|आज|hoy|aujourd)/.test(q)) {
    return 'today';
  }
  if (/(timetable|time table|schedule|समय-सारणी|horario|emploi du temps)/.test(q)) {
    return 'timetable';
  }
  return 'help';
}

function dayName(lang: ChatLang, day: number): string {
  return DAY_NAMES[lang][Math.max(0, Math.min(4, day - 1))];
}

function timeRange(slot: number): string {
  const info = SLOTS[slot];
  return info ? `${info.start}–${info.end}` : '';
}

/** Short human summary of free faculty, localized. */
function freeAnswer(lang: ChatLang, day: number, slot: number): string {
  const result = getFreeFaculty(day, slot);
  const who = result.names
    .slice(0, 6)
    .map((f) => `${f.name} (${f.initials})`)
    .join(', ');
  const more = result.names.length > 6 ? '…' : '';

  if (lang === 'hi') {
    return `${dayName(lang, day)} के पीरियड ${slot} (${timeRange(slot)}) में ${result.totalFaculty} में से ${result.total} शिक्षक खाली हैं: ${who}${more}.`;
  }
  if (lang === 'es') {
    return `El ${dayName(lang, day)} en el período ${slot} (${timeRange(slot)}) hay ${result.total} de ${result.totalFaculty} profesores libres: ${who}${more}.`;
  }
  if (lang === 'fr') {
    return `Le ${dayName(lang, day)}, période ${slot} (${timeRange(slot)}), ${result.total} enseignants sur ${result.totalFaculty} sont libres : ${who}${more}.`;
  }
  return `On ${dayName(lang, day)} at period ${slot} (${timeRange(slot)}), ${result.total} of ${result.totalFaculty} teachers are free: ${who}${more}.`;
}

function timetableAnswer(lang: ChatLang, timetable: Timetable, day: number): string {
  const entries = (timetable.entries ?? [])
    .filter((e) => e.day === day)
    .sort((a, b) => a.slot - b.slot);
  const breaks = (timetable.breaks ?? []).filter((b) => b.day === day);
  const division = timetable.division?.name ?? timetable.division_id;

  if (entries.length === 0 && breaks.length === 0) {
    const empty =
      lang === 'hi'
        ? `${division} के लिए ${dayName(lang, day)} को कोई कक्षा नहीं है।`
        : lang === 'es'
          ? `${division} no tiene clases el ${dayName(lang, day)}.`
          : lang === 'fr'
            ? `${division} n'a pas de cours le ${dayName(lang, day)}.`
            : `${division} has no classes on ${dayName(lang, day)}.`;
    return empty;
  }

  const lines: string[] = [];
  const labelled = [
    ...entries.map((e) => ({ slot: e.slot, text: `P${e.slot} ${timeRange(e.slot)} · ${entryLabel(e)}` })),
    ...breaks.map((b) => ({
      slot: b.slot,
      text: `P${b.slot} ${timeRange(b.slot)} · ${lang === 'hi' ? 'अवकाश' : lang === 'es' ? 'descanso' : lang === 'fr' ? 'pause' : 'break'}`,
    })),
  ].sort((a, b) => a.slot - b.slot);

  labelled.forEach((row) => lines.push(row.text));

  const header: Record<ChatLang, string> = {
    en: `Here is ${division} on ${dayName(lang, day)}:`,
    hi: `${division} का ${dayName(lang, day)} कार्यक्रम:`,
    es: `Este es el horario de ${division} el ${dayName(lang, day)}:`,
    fr: `Voici l'emploi du temps de ${division} le ${dayName(lang, day)} :`,
  };

  return `${header[lang]}\n${lines.join('\n')}`;
}

function guideAnswer(lang: ChatLang, intent: ChatIntent): string {
  const guides: Record<ChatLang, Record<'publish' | 'export' | 'permissions' | 'help', string>> = {
    en: {
      publish:
        'To publish: open Timetables → choose the division → Edit Grid → fix any red clash alerts → Publish. Management and that department\'s HOD can publish; students and teachers receive it read-only.',
      export:
        'To export: open the timetable or Exports & PDF → pick the division → choose PDF, Excel or JSON. The file is generated from the grid you are viewing, including breaks and lab batches.',
      permissions:
        'Roles: Management can edit every department and user. HODs can edit only their own department. Teachers can view published schedules and use Free Faculty Finder. Students have read-only access to their division.',
      help: 'I can help with free teachers, today\'s timetable, publishing, exports and role permissions. Try "Free teachers now", "ECS B timetable" or "Export PDF".',
    },
    hi: {
      publish:
        'प्रकाशित करने के लिए: टाइमटेबल → डिवीज़न चुनें → ग्रिड संपादित करें → लाल टकराव ठीक करें → प्रकाशित करें। प्रबंधन और उस विभाग के विभागाध्यक्ष ही प्रकाशित कर सकते हैं।',
      export:
        'निर्यात के लिए: टाइमटेबल या एक्सपोर्ट्स और PDF खोलें → डिवीज़न चुनें → PDF, Excel या JSON चुनें। फ़ाइल आपके देखे जा रहे ग्रिड से बनती है।',
      permissions:
        'भूमिकाएँ: प्रबंधन सभी विभाग और उपयोगकर्ता संपादित कर सकता है। विभागाध्यक्ष केवल अपना विभाग। शिक्षक प्रकाशित समय-सारणी देख सकते हैं। छात्र केवल पढ़ सकते हैं।',
      help: 'मैं खाली शिक्षक, आज की समय-सारणी, प्रकाशन, निर्यात और अनुमतियों में मदद कर सकता हूँ। "खाली शिक्षक" या "ECS B समय-सारणी" पूछें।',
    },
    es: {
      publish:
        'Para publicar: Horarios → elige la división → Editar cuadrícula → corrige los conflictos rojos → Publicar. Solo Dirección y el jefe de ese departamento pueden publicar.',
      export:
        'Para exportar: abre el horario o Exportaciones y PDF → elige la división → PDF, Excel o JSON. El archivo se genera desde la cuadrícula que ves.',
      permissions:
        'Roles: Dirección edita todos los departamentos y usuarios. El jefe edita solo su departamento. Los profesores ven horarios publicados y buscan profesores libres. Los estudiantes solo leen.',
      help: 'Puedo ayudar con profesores libres, el horario de hoy, publicación, exportaciones y permisos. Prueba "Profesores libres" o "Horario ECS B".',
    },
    fr: {
      publish:
        'Pour publier : Emplois du temps → choisissez la division → Modifier la grille → corrigez les conflits rouges → Publier. Seule la Direction et le chef de ce département peuvent publier.',
      export:
        'Pour exporter : ouvrez l\'emploi du temps ou Exports et PDF → choisissez la division → PDF, Excel ou JSON. Le fichier reprend la grille affichée.',
      permissions:
        'Rôles : la Direction modifie tous les départements et utilisateurs. Le chef modifie uniquement son département. Les enseignants consultent les emplois publiés et les disponibilités. Les étudiants lisent seulement.',
      help: 'Je peux aider pour les enseignants libres, l\'emploi du temps du jour, la publication, les exports et les permissions. Essayez « Enseignants libres » ou « Emploi du temps ECS B ».',
    },
  };

  if (intent === 'publish' || intent === 'export' || intent === 'permissions') {
    return guides[lang][intent];
  }
  return guides[lang].help;
}

export function buildLocalAnswer(
  question: string,
  lang: ChatLang,
  ctx: ChatRequestContext = {}
): { reply: string; intent: ChatIntent; division: string | null } {
  const intent = detectIntent(question);
  const role: UserRole = ctx.role ?? 'student';
  const day = ctx.day && ctx.day >= 1 && ctx.day <= 5 ? ctx.day : todayIndex();
  const slot = ctx.slot && ctx.slot >= 1 && ctx.slot <= 8 ? ctx.slot : currentSlot();
  const timetable = findDivision(ctx.divisionId, question);
  const division = timetable?.division?.name ?? null;

  if (intent === 'free') {
    return { reply: freeAnswer(lang, day, slot), intent, division };
  }

  if (intent === 'today' || intent === 'timetable') {
    if (timetable) {
      return { reply: timetableAnswer(lang, timetable, day), intent, division };
    }
    return { reply: guideAnswer(lang, 'help'), intent, division };
  }

  if (intent === 'greeting') {
    const greetings: Record<ChatLang, string> = {
      en: `Hello! I'm Sprout, the Campus Clock assistant. You're signed in as ${ROLE_NAMES.en[role]}. Want free teachers, today's timetable, or help exporting?`,
      hi: `नमस्ते! मैं स्प्राउट हूँ, Campus Clock का सहायक। आप ${ROLE_NAMES.hi[role]} के रूप में साइन इन हैं। खाली शिक्षक, आज की समय-सारणी या निर्यात के बारे में पूछें।`,
      es: `¡Hola! Soy Sprout, el asistente de Campus Clock. Has iniciado sesión como ${ROLE_NAMES.es[role]}. ¿Quieres profesores libres, el horario de hoy o ayuda para exportar?`,
      fr: `Bonjour ! Je suis Sprout, l'assistant Campus Clock. Vous êtes connecté en tant que ${ROLE_NAMES.fr[role]}. Enseignants libres, emploi du temps du jour ou aide à l'export ?`,
    };
    return { reply: greetings[lang], intent, division };
  }

  return { reply: guideAnswer(lang, intent), intent, division };
}

/** Compact context handed to the LLM so it answers from real data. */
export function buildLlmContext(question: string, lang: ChatLang, ctx: ChatRequestContext): string {
  const day = ctx.day && ctx.day >= 1 && ctx.day <= 5 ? ctx.day : todayIndex();
  const slot = ctx.slot && ctx.slot >= 1 && ctx.slot <= 8 ? ctx.slot : currentSlot();
  const free = getFreeFaculty(day, slot);
  const timetable = findDivision(ctx.divisionId, question);
  const dayView = timetable ? getDayTimetable(timetable.division_id, day) : null;

  const freeLine = free.names
    .slice(0, 12)
    .map((f) => `${f.name} (${f.initials})`)
    .join(', ');

  const timetableLine = dayView
    ? [
        `Division: ${dayView.division} (${DAYS[day]})`,
        ...dayView.entries.map((e) => entryLabel(e).replace(' · ', ' | ')),
        ...dayView.breaks.map((b) => `P${b} break`),
      ].join('; ')
    : 'No published timetable found.';

  return [
    `Language: ${LANGUAGE_LABELS[lang]}.`,
    `User role: ${ROLE_NAMES[lang][ctx.role ?? 'student']}.`,
    `Reference day: ${DAYS[day]}, period ${slot} (${SLOTS[slot]?.start}–${SLOTS[slot]?.end}).`,
    `Free faculty (${free.total}/${free.totalFaculty}): ${freeLine}.`,
    `Reference timetable: ${timetableLine}.`,
    'Answer only about Campus Clock: timetables, free faculty, publishing, exports and role permissions. Be brief (max 120 words).',
  ].join('\n');
}

/** Five offline answers per language, used when the network or API fails. */
export const OFFLINE_ANSWERS: Record<ChatLang, string[]> = {
  en: [
    'I am offline right now, but you can still use Timetables → any division to see the published grid.',
    'Free Faculty Finder is in the sidebar and works without the assistant.',
    'To export, open Exports & PDF and choose PDF, Excel or JSON.',
    'Only Management and the department HOD can publish a timetable.',
    'Try “Free teachers now” again once the connection returns.',
  ],
  hi: [
    'मैं अभी ऑफ़लाइन हूँ, लेकिन टाइमटेबल → कोई भी डिवीज़न खोलकर प्रकाशित ग्रिड देख सकते हैं।',
    'फ्री फैकल्टी फाइंडर साइडबार में है और सहायक के बिना भी काम करता है।',
    'निर्यात के लिए एक्सपोर्ट्स और PDF खोलें और PDF, Excel या JSON चुनें।',
    'केवल प्रबंधन और विभागाध्यक्ष समय-सारणी प्रकाशित कर सकते हैं।',
    'कनेक्शन आने पर "खाली शिक्षक" फिर पूछें।',
  ],
  es: [
    'Estoy sin conexión, pero puedes abrir Horarios → cualquier división para ver la cuadrícula publicada.',
    'El buscador de profesores libres está en el menú y funciona sin el asistente.',
    'Para exportar, abre Exportaciones y PDF y elige PDF, Excel o JSON.',
    'Solo Dirección y el jefe del departamento pueden publicar un horario.',
    'Vuelve a preguntar “Profesores libres” cuando vuelva la conexión.',
  ],
  fr: [
    'Je suis hors ligne, mais vous pouvez ouvrir Emplois du temps → une division pour voir la grille publiée.',
    'Le chercheur d\'enseignants libres est dans le menu et fonctionne sans l\'assistant.',
    'Pour exporter, ouvrez Exports et PDF puis choisissez PDF, Excel ou JSON.',
    'Seule la Direction et le chef de département peuvent publier un emploi du temps.',
    'Réessayez « Enseignants libres » dès que la connexion revient.',
  ],
};

/** Extra context exposed by GET /api/chat for smoke tests and tooling. */
export function chatToolSummary() {
  const published = publishedTimetables();
  return {
    languages: LANGUAGE_LABELS,
    divisions: MOCK_DIVISIONS.filter((d) =>
      published.some((t) => t.division_id === d.id)
    ).map((d) => ({ id: d.id, name: d.name })),
    publishedTimetables: published.map((t) => ({
      id: t.id,
      division: t.division?.name ?? t.division_id,
      entries: t.entries?.length ?? 0,
    })),
  };
}
