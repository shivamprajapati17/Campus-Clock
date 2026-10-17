import { NextResponse, type NextRequest } from 'next/server';
import {
  buildLlmContext,
  buildLocalAnswer,
  chatToolSummary,
  isChatLang,
  isUserRole,
  todayIndex,
  currentSlot,
  type ChatLang,
  type ChatRequestContext,
  type ChatTurn,
} from '@/lib/chatTools';

export const dynamic = 'force-dynamic';

const MAX_MESSAGES = 10;
const MAX_CHARS = 2000;

/** GET is a small discovery endpoint so the widget and smoke tests can verify
 *  which languages and published timetables the bot can actually see. */
export async function GET() {
  return NextResponse.json({ ok: true, data: chatToolSummary() });
}

function fallbackReply(lang: ChatLang): string {
  const replies: Record<ChatLang, string> = {
    en: '⚠️ The assistant is busy right now. You can still use Timetables, Free Faculty Finder and Exports from the sidebar.',
    hi: '⚠️ सहायक अभी व्यस्त है। आप साइडबार से टाइमटेबल, फ्री फैकल्टी फाइंडर और एक्सपोर्ट्स का उपयोग कर सकते हैं।',
    es: '⚠️ El asistente está ocupado. Puedes usar Horarios, Profesores libres y Exportaciones desde el menú.',
    fr: "⚠️ L'assistant est occupé. Utilisez Emplois du temps, Enseignants libres et Exports depuis le menu.",
  };
  return replies[lang];
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Request body must be valid JSON' },
      { status: 400 }
    );
  }

  try {
    const payload = body as {
      messages?: unknown;
      lang?: unknown;
      role?: unknown;
      context?: unknown;
    };

    if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'messages must be a non-empty array' },
        { status: 400 }
      );
    }

    const messages: ChatTurn[] = payload.messages
      .slice(-MAX_MESSAGES)
      .map((raw): ChatTurn => {
        const turn = raw as { role?: unknown; content?: unknown };
        return {
          role: turn.role === 'assistant' ? 'assistant' : 'user',
          content:
            typeof turn.content === 'string'
              ? turn.content.slice(0, MAX_CHARS)
              : '',
        };
      })
      .filter((turn) => turn.content.trim().length > 0);

    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) {
      return NextResponse.json(
        { ok: false, error: 'At least one user message is required' },
        { status: 400 }
      );
    }

    const lang: ChatLang = isChatLang(payload.lang) ? payload.lang : 'en';
    const rawContext = (payload.context ?? {}) as Record<string, unknown>;
    const context: ChatRequestContext = {
      role: isUserRole(payload.role)
        ? payload.role
        : isUserRole(rawContext.role)
          ? rawContext.role
          : 'student',
      divisionId:
        typeof rawContext.divisionId === 'string' ? rawContext.divisionId : null,
      divisionName:
        typeof rawContext.divisionName === 'string'
          ? rawContext.divisionName
          : null,
      day:
        typeof rawContext.day === 'number' ? rawContext.day : todayIndex(),
      slot:
        typeof rawContext.slot === 'number' ? rawContext.slot : currentSlot(),
    };

    // The local engine always has a real answer, so an LLM outage can never
    // leave the user with nothing.
    const local = buildLocalAnswer(lastUser.content, lang, context);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        ok: true,
        data: {
          reply: local.reply,
          lang,
          intent: local.intent,
          division: local.division,
          source: 'local',
        },
      });
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest',
          max_tokens: 400,
          system: [
            "You are Sprout, Campus Clock's campus timetable assistant.",
            buildLlmContext(lastUser.content, lang, context),
            `Reply in ${lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : lang === 'es' ? 'Spanish' : 'French'}.`,
          ].join('\n'),
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error(`Anthropic ${response.status}`);

      const data = (await response.json()) as {
        content?: { type?: string; text?: string }[];
      };
      const text = data.content?.find((c) => c.type === 'text')?.text?.trim();

      return NextResponse.json({
        ok: true,
        data: {
          reply: text || local.reply,
          lang,
          intent: local.intent,
          division: local.division,
          source: text ? 'llm' : 'local',
        },
      });
    } catch {
      return NextResponse.json({
        ok: true,
        data: {
          reply: local.reply,
          lang,
          intent: local.intent,
          division: local.division,
          source: 'local-fallback',
        },
      });
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: fallbackReply('en') },
      { status: 500 }
    );
  }
}
