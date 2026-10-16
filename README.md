# ⏰ Campus Clock — AI-Powered 0-Clash Timetable SaaS

> **Buildsaur Track 1 — Campus Timetable Generator**  
> *100% Conflict-Free Academic Scheduling in Authentic Neubrutalism Design*

[![Deploy with Vercel](https://vercel.com/button)](https://campusclock.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-Neubrutalism-orange)](https://tailwindcss.com/)

---

## 🚀 Live Demo & Deployment
- **Live Production URL**: [https://campusclock.vercel.app/](https://campusclock.vercel.app/)
- **GitHub Repository**: [https://github.com/shivamprajapati17/Campus-Clock.git](https://github.com/shivamprajapati17/Campus-Clock.git)

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

## 🎨 Neubrutalism Design System

Campus Clock features a bold, human-designed **Neubrutalism** visual aesthetic:

| Design Token | Value | Visual Purpose |
|---|---|---|
| **Background** | `#FFF5EB` | Warm cream paper-like backdrop |
| **Primary** | `#FF6B70` | High-impact coral / Management |
| **Secondary** | `#A78BFA` | Lavender purple / HOD council |
| **Accent** | `#42D1C3` | Turquoise / Teacher & success validation |
| **Highlight** | `#FFE66D` | Butter yellow / Student & CTAs |
| **Peach** | `#FFA477` | Supporting accent / lecture differentiation |
| **Ink** | `#171717` | Warm near-black text & borders |
| **Muted** | `#777777` | Secondary text |
| **Border** | `3px solid #171717` | Unapologetic thick comic-style borders |
| **Shadow** | `4px 4px 0 #171717` | Hard offset shadows, never blurred |
| **Type** | `Poppins` | Bold/extra-bold headings, medium body |
| **Lunch Break** | Diagonal Striped | `#FFE66D` & `#FFFDF5` barber-pole break row |

---

## 👥 Role-Based Access Control (RBAC)

| Capability | Management (Dean) | HOD | Class Teacher | Student |
|---|:---:|:---:|:---:|:---:|
| **Generate Timetables** | ✅ All Depts | ✅ Own Dept | ❌ | ❌ |
| **Drag & Drop Editor** | ✅ | ✅ | Request Only | ❌ |
| **Publish Schedules** | ✅ | ✅ | ❌ | ❌ |
| **View Published Timetable** | ✅ | ✅ | ✅ | ✅ |
| **Executive Master View** | ✅ | ❌ | ❌ | ❌ |
| **Free Faculty Finder** | ✅ | ✅ | ✅ | ❌ |
| **User Provisioning** | ✅ | ❌ | ❌ | ❌ |
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

```
   ┌─────────────────────────────────────────────────────────┐
   │             Next.js 14 (App Router) + React             │
   │               Neubrutalism Tailwind UI                  │
   └─────────────┬─────────────────────────────┬─────────────┘
                 │                             │
       Client State & Cache           API Route Handlers
        (Zustand + SSR)               (/api/timetable/*)
                 │                             │
   ┌─────────────┴─────────────┐ ┌─────────────┴─────────────┐
   │    Backtracking Engine    │ │  Supabase / DB Storage    │
   │  (Practicals, Labs, Free) │ │ (Profiles, Tables, Rooms) │
   └───────────────────────────┘ └───────────────────────────┘
```

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4 (via `@tailwindcss/postcss`), Poppins, Lucide Icons, Canvas Confetti
- **State**: Zustand Store (`src/store/useStore.ts`)
- **Generator**: Custom constraint-satisfaction backtracking engine (`src/lib/generator/engine.ts`)
- **Validator**: Live collision checker (`src/lib/generator/validator.ts`)
- **Database & Auth**: Supabase PostgreSQL / SSR Client + Session Cookies
- **Exports**: `jspdf`, `jspdf-autotable`, `xlsx` (SheetJS)
- **Deployment**: Vercel Serverless Platform

---

## 📡 REST API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/login` | Session login & JWT token issuance | Public |
| `POST` | `/api/auth/register` | Provision new campus user | Management |
| `GET` | `/api/timetable` | Filter timetables by dept, division, status | All |
| `POST` | `/api/timetable/generate` | Run AI 0-clash backtracking algorithm | HOD, Mgmt |
| `GET` | `/api/timetable/:id` | Fetch timetable grid with joined entities | All |
| `POST` | `/api/timetable/:id/publish`| Publish draft timetable to campus | HOD, Mgmt |
| `GET` | `/api/timetable/master` | Multi-department status matrix | Management |
| `GET` | `/api/faculty/free` | Discover available teachers by day & slot | Teacher, HOD, Mgmt |
| `GET` | `/api/chat/:roomId` | Fetch messages for room | All |
| `POST` | `/api/chat/:roomId` | Post message to channel | All |
| `GET` | `/api/notifications` | User notification stream | All |
| `POST` | `/api/seed` | Reset & seed database with demo data | Public / Admin |

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

## 📜 License
Licensed under the [MIT License](LICENSE). Built for the **Buildsaur Track 1 Hackathon**.
