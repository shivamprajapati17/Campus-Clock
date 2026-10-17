# 🌱 Campus Clock — Grow Your Perfect Schedule

> **Buildsaur Track 1 — Campus Timetable Generator**  
> *100% conflict-free academic scheduling in a Bulbasaur garden theme, with a four-language assistant*

[![Deploy with Vercel](https://vercel.com/button)](https://campusclock.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js 16](https://img.shields.io/badge/Next.js-16_App_Router-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-Neubrutalism-orange)](https://tailwindcss.com/)

---

## 🚀 Live Demo & Deployment
- **Live Production URL**: [https://campusclock.vercel.app/](https://campusclock.vercel.app/)
- **GitHub Repository**: [https://github.com/shivamprajapati17/Campus-Clock.git](https://github.com/shivamprajapati17/Campus-Clock.git)

---

## 📖 Documentation

- **[Complete Guide](docs/Campus-Clock-Guide.md)** — every feature explained screen by screen, how the
  generator works, how authentication works, the architecture and file map, the API reference,
  and an honest breakdown of what is real versus simulated.
- **[Complete Guide (PDF)](docs/Campus-Clock-Guide.pdf)** — the same guide as a print-ready 12-page document.

---

## 🎯 The Problem & Our Solution

### The Challenge
Manual timetable generation across college departments is prone to severe scheduling collisions:
- **Teacher Double-Booking**: A professor assigned to teach two classes at the same hour.
- **Room Collisions**: Two lecture batches or labs allocated to the same physical room.
- **Student Clashes**: A division scheduled for two concurrent lectures in a single slot.
- **Practical Constraints**: Labs require **2 consecutive slots** in specialized lab rooms.
- **Faculty Fatigue**: Teachers scheduled beyond their daily lecture quotas without gaps.

### The Campus Clock Solution
Campus Clock implements a **depth-limited constraint-backtracking engine** that solves department timetables in **< 5 seconds** with **0 clashes**. It features:
- **Instant 1-Click Generation** with real-time conflict reporting.
- **Interactive Drag & Drop Editor** with live collision warnings and period locking.
- **Free Faculty Finder** for immediate substitution when teachers are on leave.
- **Real-Time Campus Chat** across departments and class divisions with role-colored badges.
- **Universal Export Suite** for print-ready PDFs with college headers and Excel spreadsheets.

---

## 🎨 Bulbasaur Garden Design System

Every page reads the same tokens in `src/app/globals.css` (`@theme` + `:root`):

| Design Token | Value | Visual Purpose |
|---|---|---|
| **Background** | `#F1F8E9` | Fresh leaf-paper backdrop |
| **Primary** | `#2E7D32` | Deep leaf green / primary actions |
| **Primary dark** | `#1B5E20` | Shadows and pressed states |
| **Accent (teal)** | `#4DB6AC` | Labs, HOD surfaces, success |
| **Accent 2 (sunflower)** | `#FFD54F` | CTAs, break rows, student role |
| **Danger** | `#BF360C` | Clash alerts and errors only |
| **Lecture / Lab / Tutorial** | `#DCEDC8` / `#B2DFDB` / `#FFF9C4` | Timetable cell tints |
| **Ink** | `#1B2E1F` | Deep green ink for text and borders |
| **Border** | `3px solid #1B2E1F` | Chunky garden-frame borders |
| **Shadow** | `4px 4px 0 #1B5E20` | Soft leaf-offset shadows |
| **Radius** | `16px` | Rounded, friendly cards |
| **Type** | `Poppins` (`next/font/google`) | Rounded headings and body |

Role badges: Management `#1B5E20`, HOD `#00796B`, Teacher `#7CB342`, Student `#FBC02D`.
The landing page adds an SVG vine border, leaf motifs on the feature cards and an inline
Bulbasaur mascot — all drawn in code, so no extra image files are needed.

---

## 👥 Role-Based Access Control (RBAC)

| Capability | Management (Dean) | HOD | Class Teacher | Student |
|---|:---:|:---:|:---:|:---:|
| **Generate Timetables** | ✅ All Depts | ✅ Own Dept | ❌ | ❌ |
| **Drag & Drop Editor** | ✅ | ✅ | Request Only | ❌ |
| **Publish Schedules** | ✅ | ✅ | ❌ | ❌ |
| **View Published Timetable** | ✅ | ✅ | ✅ | ✅ |
| **Master Data** (departments & divisions) | ✅ All branches | ✅ Own branch | ❌ | ❌ |
| **User Provisioning & Editing** | ✅ All users | ✅ Own department | ❌ | ❌ |
| **Free Faculty Finder** | ✅ | ✅ | ✅ | ❌ |
| **Campus Chat & PDF Export** | ✅ | ✅ | ✅ | ✅ |

---

## 🔑 Demo Personas (1-Click Login)

The login screen includes instant 1-click autofill buttons for all 4 roles:

| Role | Email | Password | Persona & Privileges |
|---|---|---|---|
| **Management** | `management@campus.edu` | `admin123` | Dr. Arthur Vance (Dean) — Full master view, user management |
| **HOD** | `hod.cmpn@campus.edu` | `hod123` | Prof. Rajesh Kulkarni — CMPN Dept generator & publishing |
| **Teacher** | `teacher.a1@campus.edu` | `teach123` | Prof. Anita Sharma — SE-A Class teacher, faculty finder |
| **Student** | `student.a1@campus.edu` | `stud123` | Aarav Patel — Read-only class timetable & chat |

---

## ⚙️ Technical Architecture & Stack

![Campus Clock system architecture](docs/campus-clock-architecture.png)

The exported diagram ([`docs/campus-clock-architecture.png`](docs/campus-clock-architecture.png)) numbers the
chatbot flow 1–6: user → widget → `/api/chat` → timetable tools → optional LLM → reply.

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4 (via `@tailwindcss/postcss`), Poppins, Lucide Icons, Canvas Confetti
- **State**: Zustand stores (`src/store/useStore.ts`, `useMasterData.ts`, `useTimetableData.ts`)
- **Generator**: Custom constraint-satisfaction backtracking engine (`src/lib/generator/engine.ts`)
- **Validator**: Live collision checker (`src/lib/generator/validator.ts`), batch-aware for parallel labs
- **Assistant**: `/api/chat` + `src/lib/chatTools.ts` + floating `src/components/Chatbot.tsx` (EN/HI/ES/FR)
- **Database & Auth**: Supabase PostgreSQL / SSR Client + Session Cookies
- **Exports**: `jspdf`, `jspdf-autotable`, `xlsx` (SheetJS)
- **Deployment**: Vercel Serverless Platform

### 🔐 Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Recommended | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Recommended | Supabase anon key |
| `ANTHROPIC_API_KEY` | Optional | Upgrades Sprout to an LLM. **Server-side only** — never prefix it with `NEXT_PUBLIC_`. Without it the assistant answers from real timetable data in all four languages. |
| `ANTHROPIC_MODEL` | Optional | Model id; defaults to `claude-3-5-haiku-latest` |

### 🤖 Sprout — the multilingual assistant

- Floating 🌱 button on every page; panel with a language dropdown (English, हिन्दी, Español, Français).
- Quick replies: free teachers now, my timetable, export PDF.
- Real answers from the seeds: free-faculty lookup, today's periods for the signed-in division, publish steps and role permissions.
- Five canned answers per language are used if the network or the LLM fails, so the demo never breaks.
- `GET /api/chat` exposes which languages and published timetables the bot can see (handy for smoke tests).

### 🎓 ECS B — real seeded class

The First-Year **ECS B** division is transcribed from the official sheet (`ECS B.pdf`): the
Department of Humanities & Applied Sciences, 13 real teachers (Priti Raut, Lahu Teli, Manjiri
Gogate, Bhagyesh Kasle, Poonam Bawankar, Akshata Gondhalekar, Durgesh Pal, Nesar Ahmad,
Aditya Desai, Samita Bhandari, Vinayak Shinde, Amee Ghadia, Bhavik Modi), 12 subjects with
course codes, 10 rooms and a published 39-period timetable. It uses eight periods with
per-day breaks (P4 on Mon/Wed/Fri, P6 on Tue/Thu) and labelled lab batches.

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Demo-persona sign-in; sets the session cookie |
| `POST` | `/api/auth/register` | Returns a provisioned user object |
| `GET` | `/api/timetable` | List timetables; filter by `department_id`, `division_id`, `status` |
| `POST` | `/api/timetable/generate` | Run the 0-clash backtracking engine for a division |
| `GET` | `/api/faculty/free` | Free faculty for `?day=` and `?slot=` |
| `GET` | `/api/chat` | Assistant capabilities: languages + published timetables |
| `POST` | `/api/chat` | Multilingual assistant reply (`messages`, `lang`, `role`, `context`) |
| `GET` | `/api/chat/[roomId]` | Messages in a room |
| `POST` | `/api/chat/[roomId]` | Post a message to a room |
| `GET` | `/api/notifications` | Notification stream |
| `PUT` | `/api/notifications` | Mark a notification read |
| `POST` | `/api/overthink` | Generate a thought-spiral tree |
| `POST` | `/api/seed` | Report seed record counts |

> Authentication is backed by Supabase; the remaining handlers read from the in-app seed data.
> See [What is real and what is simulated](docs/Campus-Clock-Guide.md#12-what-is-real-and-what-is-simulated).


---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/shivamprajapati17/Campus-Clock.git
cd Campus-Clock
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables (Optional for Supabase)
Copy `.env.example` to `.env.local` (Campus Clock includes a built-in fallback mock-data layer, so it also runs without Supabase):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# Optional: upgrades Sprout to an LLM. Server-side only, never NEXT_PUBLIC_.
ANTHROPIC_API_KEY=
```
To provision the database, run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor — it creates the `profiles`, `departments`, `divisions`, `subjects`, `rooms`, `faculty`, `timetables`, `timetable_entries`, `chat_messages` and `notifications` tables with row-level security.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Deployment to Vercel

Campus Clock is optimized for seamless 1-click Vercel deployment:
1. Push to GitHub (`git push origin main`)
2. Import project in [Vercel](https://vercel.com/)
3. Framework Preset: **Next.js**
4. Deploy! Live URL: [https://campusclock.vercel.app/](https://campusclock.vercel.app/)

---

## 📱 Android App

The same portal also ships as a signed Android WebView app — the file is
[`android/CampusClock.apk`](android/CampusClock.apk) (package
`com.campusclock.app`, minSdk 23, target 34). Install it on a device with
"Install unknown apps" allowed; it opens `https://campusclock.vercel.app` in a
native shell and saves PDF/Excel downloads straight to the device's Downloads
folder.

To rebuild it after changing the web app or the shell:

```bash
# JDK 17 + Android SDK (build-tools 34, platform 34)
ANDROID_SDK=/path/to/android-sdk JAVA_HOME=/path/to/jdk-17 ./android/build-apk.sh
```

The script compiles resources with `aapt2`, dexes with `d8`, aligns with
`zipalign` and signs with `apksigner`. It needs no Gradle and no network access
beyond the local SDK. The signing key is generated on first run as
`android/.android-signing.keystore` and is deliberately **not** committed — keep
it if you want to ship updates that Android will accept as the same app.

---

## 📜 License
Licensed under the [MIT License](LICENSE). Built for the **Buildsaur Track 1 Hackathon**.
