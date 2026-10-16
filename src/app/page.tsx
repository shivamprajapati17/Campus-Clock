import Link from 'next/link';
import {
  Clock,
  Sparkles,
  ShieldCheck,
  Zap,
  Users,
  FileSpreadsheet,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Calendar,
  AlertTriangle,
  FileDown,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDF6EC] text-black selection:bg-[#FFD93D] selection:text-black">
      {/* ── Top Announcement Bar ── */}
      <div className="bg-[#FFD93D] border-b-3 border-black py-2 px-4 text-center text-xs md:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 flex-wrap">
        <span>🎉 Campus Clock SaaS • 0-Clash AI Timetables</span>
        <span className="hidden sm:inline">•</span>
        <Link
          href="/overthinking-engine"
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#0B0C10] text-[#00F5FF] text-[11px] font-mono hover:text-white transition-colors border border-black"
        >
          <span>🧠 Launch "The Overthinking Engine" ↗</span>
        </Link>
      </div>

      {/* ── Navbar ── */}
      <header className="border-b-3 border-black bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF5D5D] border-3 border-black nb-shadow flex items-center justify-center text-white">
              <Clock className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tighter uppercase block leading-none">
                Campus Clock
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#FF5D5D]">
                Buildsaur Track 1 SaaS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 font-black text-sm uppercase">
            <a href="#features" className="hover:text-[#FF5D5D] transition-colors">
              Features
            </a>
            <a href="#roles" className="hover:text-[#A78BFA] transition-colors">
              Role Matrix
            </a>
            <Link
              href="/overthinking-engine"
              className="text-[#9D4EDD] hover:text-[#00F5FF] flex items-center gap-1 font-bold"
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
              className="nb-btn bg-white hover:bg-[#FDF6EC] text-black text-xs md:text-sm px-4 py-2.5"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="nb-btn bg-[#FFD93D] hover:bg-[#f3cc20] text-black text-xs md:text-sm px-5 py-2.5 flex items-center gap-2"
            >
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-3 border-black bg-[#2DD4BF] text-black text-xs font-black uppercase nb-shadow-sm">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>Backtracking Constraint Engine • Zero Clashes Guaranteed</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-black leading-[1.05]">
              Say Goodbye to <br />
              <span className="bg-[#FF5D5D] text-white px-2 py-0.5 border-3 border-black inline-block -rotate-1 nb-shadow">
                Timetable Chaos
              </span>
            </h1>

            <p className="text-base sm:text-xl font-bold text-black/80 max-w-2xl leading-relaxed">
              Automated, clash-free Mon–Fri schedules in under 5 seconds. Designed for
              colleges, HODs, teachers, and students with real-time editing, live department chat, and instant PDF/Excel exports.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/dashboard/generate"
                className="nb-btn bg-[#FFD93D] text-black text-base px-8 py-4 flex items-center gap-3 nb-shadow hover:nb-shadow-lg"
              >
                <Zap className="w-5 h-5 fill-black stroke-black" />
                <span>Auto-Generate Now</span>
              </Link>

              <Link
                href="/login"
                className="nb-btn bg-[#A78BFA] text-black text-base px-7 py-4 flex items-center gap-2"
              >
                <span>Try Demo Accounts</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </Link>
            </div>

            {/* Stat Counters */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t-3 border-black">
              <div className="nb-card bg-white p-3 text-center">
                <span className="block text-2xl sm:text-3xl font-black text-[#FF5D5D]">
                  0
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
                  Clash Guarantee
                </span>
              </div>
              <div className="nb-card bg-white p-3 text-center">
                <span className="block text-2xl sm:text-3xl font-black text-[#2DD4BF]">
                  &lt; 5s
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
                  Gen Time
                </span>
              </div>
              <div className="nb-card bg-white p-3 text-center">
                <span className="block text-2xl sm:text-3xl font-black text-[#A78BFA]">
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
              {/* Badge top corner */}
              <div className="absolute -top-4 -right-4 px-3 py-1 rounded-xl bg-[#FF5D5D] text-white border-3 border-black text-xs font-black uppercase nb-shadow-sm">
                Live Preview
              </div>

              <div className="flex items-center justify-between pb-4 border-b-3 border-black mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#FF5D5D] border-2 border-black" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#FFD93D] border-2 border-black" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#2DD4BF] border-2 border-black" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-black">
                  CMPN • SE-A Division
                </span>
              </div>

              {/* Mock Timetable Mini Grid */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl border-3 border-black bg-[#5CB8FF] nb-shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase">CSC401 • DSA</span>
                    <p className="text-[11px] font-bold text-black/80">Prof. Rajesh Kulkarni (HOD)</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md border-2 border-black bg-white text-[10px] font-black">
                    LH-301
                  </span>
                </div>

                <div className="p-3 rounded-xl border-3 border-black bg-[#A78BFA] nb-shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase">CSC402 • DBMS</span>
                    <p className="text-[11px] font-bold text-black/80">Prof. Anita Sharma</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md border-2 border-black bg-white text-[10px] font-black">
                    LH-301
                  </span>
                </div>

                {/* Lunch break indicator */}
                <div className="p-2 break-pattern rounded-xl text-center font-black text-xs uppercase text-black">
                  ☕ Lunch Break • 01:00 PM – 01:30 PM
                </div>

                <div className="p-3 rounded-xl border-3 border-black bg-[#2DD4BF] nb-shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase">CSL401 • DSA Practical</span>
                    <p className="text-[11px] font-bold text-black/80">2-Slot Lab Session</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md border-2 border-black bg-white text-[10px] font-black">
                    Lab-101
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t-3 border-black flex items-center justify-between text-xs font-black">
                <div className="flex items-center gap-1.5 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Validation: 0 Clashes</span>
                </div>
                <Link
                  href="/dashboard/timetable/tt-se-a-pub"
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

      {/* ── Features Section ── */}
      <section id="features" className="py-20 bg-white border-y-3 border-black px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg border-2 border-black bg-[#FFD93D] inline-block mb-3">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black">
              Everything Your Institution Needs
            </h2>
            <p className="text-base font-bold text-black/70 mt-2">
              Built to address every challenge outlined in the Buildsaur Track 1 specification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="nb-card bg-[#FDF6EC] p-6 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-[#FF5D5D] border-3 border-black nb-shadow flex items-center justify-center text-white mb-5">
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
            <div className="nb-card bg-[#FDF6EC] p-6 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-[#A78BFA] border-3 border-black nb-shadow flex items-center justify-center text-black mb-5">
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
            <div className="nb-card bg-[#FDF6EC] p-6 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-[#2DD4BF] border-3 border-black nb-shadow flex items-center justify-center text-black mb-5">
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
            <div className="nb-card bg-[#FDF6EC] p-6 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-[#FFD93D] border-3 border-black nb-shadow flex items-center justify-center text-black mb-5">
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
            <div className="nb-card bg-[#FDF6EC] p-6 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-[#5CB8FF] border-3 border-black nb-shadow flex items-center justify-center text-black mb-5">
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
            <div className="nb-card bg-[#FDF6EC] p-6 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-[#FF8A5C] border-3 border-black nb-shadow flex items-center justify-center text-black mb-5">
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
        <div className="nb-card bg-[#FFD93D] p-8 md:p-12 text-center">
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
              <span className="px-2.5 py-1 rounded-lg border-2 border-black bg-[#FF5D5D] text-white text-[11px] font-black uppercase">
                Management
              </span>
              <h4 className="font-black text-base text-black mt-3 mb-1">
                Arthur Vance (Dean)
              </h4>
              <p className="text-xs font-bold text-black/60 truncate">
                management@campus.edu
              </p>
              <div className="mt-4 pt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-black text-[#FF5D5D]">
                <span>Master View & Users</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* HOD */}
            <Link
              href="/login?role=hod"
              className="nb-card bg-white p-5 hover:-translate-y-1 transition-transform block"
            >
              <span className="px-2.5 py-1 rounded-lg border-2 border-black bg-[#A78BFA] text-black text-[11px] font-black uppercase">
                HOD
              </span>
              <h4 className="font-black text-base text-black mt-3 mb-1">
                Prof. Rajesh Kulkarni
              </h4>
              <p className="text-xs font-bold text-black/60 truncate">
                hod.cmpn@campus.edu
              </p>
              <div className="mt-4 pt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-black text-[#845EF7]">
                <span>Generate & Publish</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Teacher */}
            <Link
              href="/login?role=teacher"
              className="nb-card bg-white p-5 hover:-translate-y-1 transition-transform block"
            >
              <span className="px-2.5 py-1 rounded-lg border-2 border-black bg-[#2DD4BF] text-black text-[11px] font-black uppercase">
                Teacher
              </span>
              <h4 className="font-black text-base text-black mt-3 mb-1">
                Prof. Anita Sharma
              </h4>
              <p className="text-xs font-bold text-black/60 truncate">
                teacher.a1@campus.edu
              </p>
              <div className="mt-4 pt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-black text-[#14B8A6]">
                <span>Class Timetable & Finder</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Student */}
            <Link
              href="/login?role=student"
              className="nb-card bg-white p-5 hover:-translate-y-1 transition-transform block"
            >
              <span className="px-2.5 py-1 rounded-lg border-2 border-black bg-[#FFD93D] text-black text-[11px] font-black uppercase">
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

      {/* ── Footer ── */}
      <footer className="border-t-3 border-black bg-white py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5D5D] border-2 border-black flex items-center justify-center text-white">
              <Clock className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-black text-lg uppercase tracking-tight block">
                Campus Clock
              </span>
              <span className="text-xs font-bold text-black/60">
                Neubrutalist SaaS Timetabler
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-black uppercase">
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/login" className="hover:underline">
              Login
            </Link>
            <a
              href="https://github.com/shivamprajapati17/Campus-Clock.git"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
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
