import Link from 'next/link';
import { InstitutionLogos } from '@/components/layout/InstitutionLogos';
import {
  Clock,
  Sparkles,
  ShieldCheck,
  Zap,
  Users,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Calendar,
  FileDown,
  Leaf,
} from 'lucide-react';

/** Hand-drawn Bulbasaur mascot — inline so it ships with the page. */
function BulbasaurArt({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 220"
      className={className}
      role="img"
      aria-label="Bulbasaur mascot"
    >
      <ellipse cx="100" cy="206" rx="58" ry="9" fill="#1B2E1F" opacity="0.12" />
      {/* bulb */}
      <path d="M100 20c-34 0-56 22-56 48 0 24 20 40 56 40s56-16 56-40c0-26-22-48-56-48z" fill="#43A047" stroke="#1B2E1F" strokeWidth="4" />
      <path d="M100 26c-10 12-14 26-14 42 0 14 4 26 14 34 10-8 14-20 14-34 0-16-4-30-14-42z" fill="#66BB6A" opacity="0.9" />
      <path d="M56 66c14-4 26-2 36 6M144 60c-14-2-26 2-34 12" fill="none" stroke="#1B2E1F" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* head */}
      <path d="M52 108c-12 6-20 20-18 36 3 24 24 44 66 44s63-20 66-44c2-16-6-30-18-36-8-30-26-44-48-44s-40 14-48 44z" fill="#7CB342" stroke="#1B2E1F" strokeWidth="4" />
      {/* ears */}
      <path d="M56 104 40 78l28 6zM144 104l16-26-28 6z" fill="#7CB342" stroke="#1B2E1F" strokeWidth="4" strokeLinejoin="round" />
      {/* spots */}
      <ellipse cx="74" cy="132" rx="9" ry="6" fill="#558B2F" opacity="0.7" />
      <ellipse cx="126" cy="132" rx="9" ry="6" fill="#558B2F" opacity="0.7" />
      {/* eyes */}
      <ellipse cx="80" cy="126" rx="9" ry="11" fill="#fff" stroke="#1B2E1F" strokeWidth="3" />
      <ellipse cx="120" cy="126" rx="9" ry="11" fill="#fff" stroke="#1B2E1F" strokeWidth="3" />
      <circle cx="81" cy="128" r="4" fill="#1B2E1F" />
      <circle cx="119" cy="128" r="4" fill="#1B2E1F" />
      {/* mouth */}
      <path d="M88 148c6 6 18 6 24 0" fill="none" stroke="#1B2E1F" strokeWidth="3.5" strokeLinecap="round" />
      {/* legs */}
      <path d="M70 176c-6 6-8 14-4 18 5 5 14 3 18-3M130 176c6 6 8 14 4 18-5 5-14 3-18-3" fill="none" stroke="#1B2E1F" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F1F8E9] text-black selection:bg-[#FFD54F] selection:text-black">
      {/* ── Top Announcement Bar ── */}
      <div className="bg-[#FFD54F] border-b-3 border-black py-2 px-4 text-center text-xs md:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 flex-wrap">
        <span>🌱 Grow your perfect schedule • 0-Clash AI Timetables</span>
        <span className="hidden sm:inline">•</span>
        <Link
          href="/overthinking-engine"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#1B2E1F] text-[#FFD54F] text-[11px] font-mono hover:bg-[#2E7D32] hover:text-white transition-colors border-2 border-black"
        >
          <span>🧠 Launch “The Overthinking Engine” ↗</span>
        </Link>
      </div>

      {/* ── Navbar ── */}
      <header className="border-b-3 border-black bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2E7D32] border-3 border-black nb-shadow flex items-center justify-center text-white">
              <Clock className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tighter uppercase block leading-none">
                Campus Clock
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#2E7D32]">
                Grow your perfect schedule 🌱
              </span>
            </div>
            <InstitutionLogos size="sm" className="hidden sm:flex ml-1" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 font-black text-sm uppercase">
            <a href="#features" className="hover:text-[#2E7D32] transition-colors">
              Features
            </a>
            <a href="#roles" className="hover:text-[#80CBC4] transition-colors">
              Role Matrix
            </a>
            <Link
              href="/overthinking-engine"
              className="text-[#2E7D32] hover:text-[#2E7D32] flex items-center gap-1 font-bold"
            >
              <span>Overthinking Engine</span>
            </Link>
            <a
              href="https://github.com/shivamprajapati17/Campus-Clock.git"
              target="_blank"
              rel="noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              GitHub ↗
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="nb-btn bg-white hover:bg-[#F1F8E9] text-black text-xs md:text-sm px-4 py-2.5"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="nb-btn bg-[#FFD54F] hover:bg-[#FBC02D] text-black text-xs md:text-sm px-5 py-2.5 flex items-center gap-2"
            >
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto">
        {/* ── Vine border: the garden frame around the hero ── */}
        <svg
          className="pointer-events-none absolute inset-x-0 top-0 h-full w-full hidden md:block"
          viewBox="0 0 1200 620"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M8 30C170 6 300 54 470 30S760 2 940 34s200 10 252 -4" stroke="#2E7D32" strokeWidth="3" opacity="0.35" strokeLinecap="round" />
          <path d="M8 590c170 24 300-24 470 0s290 28 470-4 200-10 252 4" stroke="#2E7D32" strokeWidth="3" opacity="0.28" strokeLinecap="round" />
          {[120, 260, 400, 540, 680, 820, 960, 1090].map((x, i) => (
            <g key={x} opacity={0.55}>
              <ellipse cx={x} cy={i % 2 ? 22 : 44} rx="9" ry="4.5" fill="#7CB342" transform={`rotate(${i % 2 ? -24 : 22} ${x} ${i % 2 ? 22 : 44})`} />
              <ellipse cx={x + 620} cy={i % 2 ? 574 : 598} rx="9" ry="4.5" fill="#7CB342" transform={`rotate(${i % 2 ? 24 : -22} ${x + 620} ${i % 2 ? 574 : 598})`} />
            </g>
          ))}
        </svg>
        {/* Decorative geometry */}
        <div className="pointer-events-none absolute top-10 right-8 hidden lg:flex flex-col items-end gap-3" aria-hidden="true">
          <span className="nb-star" />
          <span className="nb-dot bg-[#80CBC4]" />
          <span className="nb-square bg-[#4DB6AC]" />
        </div>
        <div className="pointer-events-none absolute bottom-16 left-4 hidden lg:block" aria-hidden="true">
          <span className="nb-square bg-[#2E7D32] rotate-12" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-3 border-black bg-[#4DB6AC] text-black text-xs font-black uppercase nb-shadow-sm">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>Backtracking Constraint Engine • Zero Clashes Guaranteed</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-black leading-[1.05]">
              Grow your <br />
              <span className="bg-[#2E7D32] text-white px-2 py-0.5 border-3 border-black inline-block -rotate-1 nb-shadow">
                perfect schedule 🌱
              </span>
            </h1>

            <p className="text-base sm:text-xl font-bold text-black/80 max-w-2xl leading-relaxed">
              Say goodbye to timetable chaos. Campus Clock plants a clash-free
              Mon–Fri schedule in under 5 seconds, then lets HODs, teachers and
              students tend it with live editing, chat and PDF/Excel exports.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/dashboard/generate"
                className="nb-btn bg-[#FFD54F] text-black text-base px-8 py-4 flex items-center gap-3 nb-shadow hover:nb-shadow-lg"
              >
                <Zap className="w-5 h-5 fill-black stroke-black" />
                <span>Auto-Generate Now</span>
              </Link>

              <Link
                href="/login"
                className="nb-btn bg-[#80CBC4] text-black text-base px-7 py-4 flex items-center gap-2"
              >
                <span>Try Demo Accounts</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </Link>
            </div>

            {/* Stat Counters */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t-3 border-black">
              <div className="nb-card bg-white p-3 text-center">
                <span className="block text-2xl sm:text-3xl font-black text-[#2E7D32]">
                  0
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
                  Clash Guarantee
                </span>
              </div>
              <div className="nb-card bg-white p-3 text-center">
                <span className="block text-2xl sm:text-3xl font-black text-[#4DB6AC]">
                  &lt; 5s
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
                  Gen Time
                </span>
              </div>
              <div className="nb-card bg-white p-3 text-center">
                <span className="block text-2xl sm:text-3xl font-black text-[#80CBC4]">
                  4
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
                  Role Portals
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Neubrutalist Interactive Visual Card */}
          <div className="lg:col-span-5">
            <div className="nb-card bg-white p-6 rotate-1 hover:rotate-0 transition-transform duration-300 relative">
              {/* Bulbasaur mascot perched on the preview card */}
              <BulbasaurArt className="absolute -top-24 -left-10 w-24 sm:w-28 rotate-[-8deg] drop-shadow-[3px_3px_0_#1B2E1F]" />

              {/* Badge top corner */}
              <div className="absolute -top-4 -right-4 px-3 py-1 rounded-xl bg-[#2E7D32] text-white border-3 border-black text-xs font-black uppercase nb-shadow-sm">
                Live Preview
              </div>

              <div className="flex items-center justify-between pb-4 border-b-3 border-black mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#2E7D32] border-2 border-black" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#FFD54F] border-2 border-black" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#4DB6AC] border-2 border-black" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-black">
                  HAS • ECS B Division
                </span>
              </div>

              {/* Mock Timetable Mini Grid */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl border-3 border-black bg-[#DCEDC8] nb-shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase">EM-I • Engineering Mathematics-I</span>
                    <p className="text-[11px] font-bold text-black/80">Mr. Priti Raut (PR)</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md border-2 border-black bg-white text-[10px] font-black">
                    209
                  </span>
                </div>

                <div className="p-3 rounded-xl border-3 border-black bg-[#B2DFDB] nb-shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase">BEE • Basic Electrical & Electronics</span>
                    <p className="text-[11px] font-bold text-black/80">Ms. Manjiri Gogate (MG)</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md border-2 border-black bg-white text-[10px] font-black">
                    201
                  </span>
                </div>

                {/* Lunch break indicator */}
                <div className="p-2 break-pattern rounded-xl text-center font-black text-xs uppercase text-black">
                  ☕ Lunch Break • 12:15 PM – 01:15 PM
                </div>

                <div className="p-3 rounded-xl border-3 border-black bg-[#A5D6A7] nb-shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase">ACAD • Engineering Graphics Lab</span>
                    <p className="text-[11px] font-bold text-black/80">Batch B1 · Ms. Akshata Gondhalekar</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md border-2 border-black bg-white text-[10px] font-black">
                    111
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t-3 border-black flex items-center justify-between text-xs font-black">
                <div className="flex items-center gap-1.5 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Validation: 0 Clashes</span>
                </div>
                <Link
                  href="/dashboard/timetable/tt-ecs-b-pub"
                  className="hover:underline flex items-center gap-1 text-black"
                >
                  <span>Open Full Grid</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Institution Showcase Band ── */}
      <section className="py-12 bg-white border-y-3 border-black px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg border-2 border-black bg-[#4DB6AC] inline-block mb-3">
              Institution Showcase
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-black">
              Engineered for Excellence
            </h2>
            <p className="text-sm sm:text-base font-bold text-black/70 mt-2 max-w-xl">
              Campus Clock schedules every department, division and lab — built to serve
              institutions that hold themselves to that standard.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 shrink-0">
            <InstitutionLogos size="lg" />
            <span className="text-[11px] font-black uppercase tracking-widest text-black/60">
              Rahul Education • Engineered for Excellence
            </span>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-20 bg-white border-y-3 border-black px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg border-2 border-black bg-[#FFD54F] inline-flex items-center gap-1.5 mb-3">
              <Leaf className="w-3.5 h-3.5 stroke-[2.5]" />
              Core Capabilities
            </span>
            <div className="flex items-center justify-center gap-2 mb-3" aria-hidden="true">
              <span className="nb-square bg-[#80CBC4]" />
              <span className="nb-dot bg-[#4DB6AC]" />
              <span className="nb-square bg-[#2E7D32]" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black">
              Everything Your Institution Needs
            </h2>
            <p className="text-base font-bold text-black/70 mt-2">
              Built to address every challenge outlined in the Buildsaur Track 1 specification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="nb-card nb-leaf bg-[#F1F8E9] p-6 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-[#2E7D32] border-3 border-black nb-shadow flex items-center justify-center text-white mb-5">
                <Sparkles className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black uppercase text-black mb-2">
                1-Click Auto Generator
              </h3>
              <p className="text-sm font-bold text-black/70 leading-relaxed">
                Backtracking engine handles practicals (2 consecutive slots + labs), lectures, and tutorials with teacher and room constraints.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="nb-card nb-leaf bg-[#F1F8E9] p-6 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-[#80CBC4] border-3 border-black nb-shadow flex items-center justify-center text-black mb-5">
                <Calendar className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black uppercase text-black mb-2">
                Drag-and-Drop Editor
              </h3>
              <p className="text-sm font-bold text-black/70 leading-relaxed">
                Interactive editor lets HODs and Management swap periods manually with real-time clash highlighting and slot locking.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="nb-card nb-leaf bg-[#F1F8E9] p-6 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-[#4DB6AC] border-3 border-black nb-shadow flex items-center justify-center text-black mb-5">
                <Users className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black uppercase text-black mb-2">
                Free Faculty Finder
              </h3>
              <p className="text-sm font-bold text-black/70 leading-relaxed">
                Class teachers can instantly discover which professors have a free period at any given day and slot for substitution.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="nb-card nb-leaf bg-[#F1F8E9] p-6 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-[#FFD54F] border-3 border-black nb-shadow flex items-center justify-center text-black mb-5">
                <MessageSquare className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black uppercase text-black mb-2">
                Department & Class Chat
              </h3>
              <p className="text-sm font-bold text-black/70 leading-relaxed">
                Dedicated real-time communication rooms with role-colored identity badges for Dean, HODs, Teachers, and Students.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="nb-card nb-leaf bg-[#F1F8E9] p-6 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-[#2E7D32] border-3 border-black nb-shadow flex items-center justify-center text-black mb-5">
                <FileDown className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black uppercase text-black mb-2">
                PDF & Excel Export
              </h3>
              <p className="text-sm font-bold text-black/70 leading-relaxed">
                One-click export generates formatted printable PDFs with college header and clean spreadsheet files for records.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="nb-card nb-leaf bg-[#F1F8E9] p-6 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-[#A5D6A7] border-3 border-black nb-shadow flex items-center justify-center text-black mb-5">
                <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black uppercase text-black mb-2">
                Draft → Publish Flow
              </h3>
              <p className="text-sm font-bold text-black/70 leading-relaxed">
                HOD creates drafts, edits freely, and publishes with instant notifications pushed to all division students and faculty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Demo Accounts Section ── */}
      <section id="demo" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="nb-card bg-[#FFD54F] p-8 md:p-12 text-center">
          <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg border-2 border-black bg-white inline-block mb-3">
            Instant Verification
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black mb-4">
            Test All 4 Roles In 1-Click
          </h2>
          <p className="text-base sm:text-lg font-bold text-black/80 max-w-2xl mx-auto mb-8">
            Click any role below to pre-fill credentials and experience the role-specific permissions and views immediately.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {/* Management */}
            <Link
              href="/login?role=management"
              className="nb-card bg-white p-5 hover:-translate-y-1 transition-transform block"
            >
              <span className="px-2.5 py-1 rounded-lg border-2 border-black bg-[#2E7D32] text-white text-[11px] font-black uppercase">
                Management
              </span>
              <h4 className="font-black text-base text-black mt-3 mb-1">
                Arthur Vance (Dean)
              </h4>
              <p className="text-xs font-bold text-black/60 truncate">
                management@campus.edu
              </p>
              <div className="mt-4 pt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-black text-[#2E7D32]">
                <span>Master View & Users</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* HOD */}
            <Link
              href="/login?role=hod"
              className="nb-card bg-white p-5 hover:-translate-y-1 transition-transform block"
            >
              <span className="px-2.5 py-1 rounded-lg border-2 border-black bg-[#80CBC4] text-black text-[11px] font-black uppercase">
                HOD
              </span>
              <h4 className="font-black text-base text-black mt-3 mb-1">
                Prof. Rajesh Kulkarni
              </h4>
              <p className="text-xs font-bold text-black/60 truncate">
                hod.cmpn@campus.edu
              </p>
              <div className="mt-4 pt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-black text-[#26A69A]">
                <span>Generate & Publish</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Teacher */}
            <Link
              href="/login?role=teacher"
              className="nb-card bg-white p-5 hover:-translate-y-1 transition-transform block"
            >
              <span className="px-2.5 py-1 rounded-lg border-2 border-black bg-[#4DB6AC] text-black text-[11px] font-black uppercase">
                Teacher
              </span>
              <h4 className="font-black text-base text-black mt-3 mb-1">
                Prof. Anita Sharma
              </h4>
              <p className="text-xs font-bold text-black/60 truncate">
                teacher.a1@campus.edu
              </p>
              <div className="mt-4 pt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-black text-[#26A69A]">
                <span>Class Timetable & Finder</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Student */}
            <Link
              href="/login?role=student"
              className="nb-card bg-white p-5 hover:-translate-y-1 transition-transform block"
            >
              <span className="px-2.5 py-1 rounded-lg border-2 border-black bg-[#FFD54F] text-black text-[11px] font-black uppercase">
                Student
              </span>
              <h4 className="font-black text-base text-black mt-3 mb-1">
                Aarav Patel
              </h4>
              <p className="text-xs font-bold text-black/60 truncate">
                student.a1@campus.edu
              </p>
              <div className="mt-4 pt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-black text-black">
                <span>Student Read-Only</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Decorative barcode rule ── */}
      <div className="nb-barcode" aria-hidden="true" />

      {/* ── Footer ── */}
      <footer className="bg-white py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D32] border-2 border-black flex items-center justify-center text-white">
              <Clock className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-black text-lg uppercase tracking-tight block">
                Campus Clock
              </span>
              <span className="text-xs font-bold text-black/60">
                Grow your perfect schedule 🌱
              </span>
            </div>
          </div>

          <InstitutionLogos size="md" />

          <div className="flex items-center gap-6 text-xs font-black uppercase">
            <Link href="/dashboard" className="inline-block py-2 hover:underline">
              Dashboard
            </Link>
            <Link href="/login" className="inline-block py-2 hover:underline">
              Login
            </Link>
            <a
              href="https://github.com/shivamprajapati17/Campus-Clock.git"
              target="_blank"
              rel="noreferrer"
              className="inline-block py-2 hover:underline"
            >
              GitHub Repository
            </a>
          </div>

          <p className="text-xs font-bold text-black/60">
            © 2026 Campus Clock • Built for Buildsaur Track 1
          </p>
        </div>
      </footer>
    </div>
  );
}
