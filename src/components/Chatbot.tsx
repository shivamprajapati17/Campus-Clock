'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Leaf, Send, X, Languages, Loader2, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  LANGUAGE_LABELS,
  OFFLINE_ANSWERS,
  currentSlot,
  todayIndex,
  type ChatLang,
} from '@/lib/chatTools';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const WELCOME: Record<ChatLang, string> = {
  en: "Hi! I'm Sprout 🌱 Ask me about free teachers, today's timetable, publishing or exports.",
  hi: 'नमस्ते! मैं स्प्राउट हूँ 🌱 खाली शिक्षक, आज की समय-सारणी, प्रकाशन या निर्यात के बारे में पूछें।',
  es: '¡Hola! Soy Sprout 🌱 Pregúntame por profesores libres, el horario de hoy, publicación o exportaciones.',
  fr: "Bonjour ! Je suis Sprout 🌱 Posez-moi une question sur les enseignants libres, l'emploi du temps du jour, la publication ou les exports.",
};

const QUICK_REPLIES: Record<ChatLang, { label: string; prompt: string }[]> = {
  en: [
    { label: 'Free teachers now', prompt: 'Free teachers now' },
    { label: 'My timetable', prompt: "Show today's timetable" },
    { label: 'Export PDF', prompt: 'How do I export PDF?' },
  ],
  hi: [
    { label: 'अभी खाली शिक्षक', prompt: 'अभी खाली शिक्षक कौन हैं?' },
    { label: 'मेरी समय-सारणी', prompt: 'आज की समय-सारणी दिखाएँ' },
    { label: 'PDF निर्यात', prompt: 'PDF कैसे निर्यात करें?' },
  ],
  es: [
    { label: 'Profesores libres', prompt: '¿Qué profesores están libres ahora?' },
    { label: 'Mi horario', prompt: 'Muéstrame el horario de hoy' },
    { label: 'Exportar PDF', prompt: '¿Cómo exporto a PDF?' },
  ],
  fr: [
    { label: 'Enseignants libres', prompt: 'Quels enseignants sont libres maintenant ?' },
    { label: 'Mon emploi du temps', prompt: "Montre l'emploi du temps du jour" },
    { label: 'Exporter en PDF', prompt: 'Comment exporter en PDF ?' },
  ],
};

const SEND_LABEL: Record<ChatLang, string> = {
  en: 'Send',
  hi: 'भेजें',
  es: 'Enviar',
  fr: 'Envoyer',
};

const PLACEHOLDER: Record<ChatLang, string> = {
  en: 'Ask about timetables, free faculty, exports…',
  hi: 'समय-सारणी, खाली शिक्षक, निर्यात के बारे में पूछें…',
  es: 'Pregunta por horarios, profesores libres, exports…',
  fr: "Demandez horaires, enseignants libres, exports…",
};

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function Chatbot() {
  const { user } = useStore();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<ChatLang>('en');
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 'welcome', role: 'assistant', text: WELCOME.en },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(timer);
    };
  }, [open]);

  const changeLanguage = (next: ChatLang) => {
    setLang(next);
    setMessages([{ id: 'welcome', role: 'assistant', text: WELCOME[next] }]);
  };

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || loading) return;

    const userMessage: Message = { id: makeId(), role: 'user', text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          lang,
          role: user?.role ?? 'student',
          messages: nextMessages
            .filter((m) => m.id !== 'welcome')
            .slice(-10)
            .map((m) => ({ role: m.role, content: m.text })),
          context: {
            role: user?.role ?? 'student',
            divisionId: user?.division_id ?? null,
            day: todayIndex(),
            slot: currentSlot(),
          },
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        data?: { reply?: string };
      };
      if (!response.ok || !data.ok || !data.data?.reply) {
        throw new Error('Assistant unavailable');
      }

      setMessages((current) => [
        ...current,
        { id: makeId(), role: 'assistant', text: data.data!.reply! },
      ]);
    } catch {
      const canned = OFFLINE_ANSWERS[lang];
      const answer = canned[text.length % canned.length];
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: 'assistant',
          text: `${answer}\n\n(offline fallback)`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating launch button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open Campus Clock assistant"
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 inline-flex items-center gap-2 px-4 py-3 rounded-2xl border-3 border-[var(--ink)] bg-[var(--primary)] text-white font-black text-sm nb-shadow hover:bg-[var(--primary-dark)] active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          <span className="w-7 h-7 rounded-full bg-[var(--accent-2)] text-[var(--ink)] grid place-items-center border-2 border-[var(--ink)]">
            <Leaf className="w-4 h-4 stroke-[2.5]" />
          </span>
          <span className="hidden sm:inline">Ask Sprout</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <section
          aria-label="Campus Clock assistant"
          className="fixed bottom-20 right-3 left-3 sm:left-auto md:bottom-6 md:right-6 z-50 sm:w-[380px] max-h-[76vh] flex flex-col rounded-2xl border-3 border-[var(--ink)] bg-[var(--surface)] nb-shadow overflow-hidden"
        >
          <header className="bg-[var(--primary)] text-white px-4 py-3 flex items-center justify-between gap-3 border-b-3 border-[var(--ink)]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-9 h-9 rounded-full bg-[var(--accent-2)] text-[var(--ink)] grid place-items-center border-2 border-[var(--ink)] shrink-0">
                <Leaf className="w-5 h-5 stroke-[2.5]" />
              </span>
              <div className="min-w-0">
                <p className="font-black text-sm uppercase tracking-wide leading-tight">
                  Sprout Assistant
                </p>
                <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                  {LANGUAGE_LABELS[lang]} · 4 languages
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <label className="sr-only" htmlFor="chatbot-language">
                Assistant language
              </label>
              <div className="relative">
                <Languages className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none" />
                <select
                  id="chatbot-language"
                  value={lang}
                  onChange={(e) => changeLanguage(e.target.value as ChatLang)}
                  className="appearance-none rounded-lg border-2 border-white/70 bg-[var(--primary-dark)] text-white text-[11px] font-black pl-7 pr-2 py-1.5 cursor-pointer"
                >
                  {(Object.keys(LANGUAGE_LABELS) as ChatLang[]).map((code) => (
                    <option key={code} value={code}>
                      {LANGUAGE_LABELS[code]}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                className="p-1.5 rounded-lg border-2 border-white/70 text-white hover:bg-white/15"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-[var(--bg)]"
            role="log"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === 'user'
                    ? 'ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-[var(--primary)] text-white px-3 py-2 text-xs font-bold whitespace-pre-line'
                    : 'mr-auto max-w-[92%] rounded-2xl rounded-bl-md bg-white border-2 border-[var(--ink)]/15 px-3 py-2 text-xs font-semibold text-[var(--ink)] whitespace-pre-line'
                }
              >
                {message.text}
              </div>
            ))}

            {loading && (
              <div className="mr-auto inline-flex items-center gap-2 rounded-2xl bg-white border-2 border-[var(--ink)]/15 px-3 py-2 text-[11px] font-bold text-[var(--ink)]/70">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Sprout is thinking…
              </div>
            )}
          </div>

          <div className="px-3 pt-2 pb-1 flex flex-wrap gap-1.5 border-t-2 border-[var(--ink)]/10 bg-white">
            {QUICK_REPLIES[lang].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => send(chip.prompt)}
                disabled={loading}
                className="inline-flex items-center gap-1 rounded-full border-2 border-[var(--ink)]/25 bg-[var(--bg)] px-2.5 py-1 text-[10px] font-black text-[var(--ink)] hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3" />
                {chip.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
            className="p-3 bg-white flex items-center gap-2"
          >
            <label className="sr-only" htmlFor="chatbot-input">
              {PLACEHOLDER[lang]}
            </label>
            <input
              id="chatbot-input"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={500}
              placeholder={PLACEHOLDER[lang]}
              className="flex-1 min-w-0 rounded-xl border-2 border-[var(--ink)]/30 bg-white px-3 py-2 text-xs font-semibold text-[var(--ink)] outline-none focus:border-[var(--primary)]"
            />
            <button
              type="submit"
              disabled={loading || input.trim().length === 0}
              aria-label={SEND_LABEL[lang]}
              className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl border-2 border-[var(--ink)] bg-[var(--accent-2)] text-[var(--ink)] nb-shadow-sm disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </form>
        </section>
      )}
    </>
  );
}
