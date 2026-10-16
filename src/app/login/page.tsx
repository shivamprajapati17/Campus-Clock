'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { MOCK_USERS } from '@/lib/data/mockData';
import { writeDemoSession } from '@/lib/utils';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { InstitutionLogos } from '@/components/layout/InstitutionLogos';
import {
  Clock,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import type { User, UserRole } from '@/lib/types';

/** 1-click demo personas shown on the login screen. */
const DEMO_CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  management: { email: 'management@campus.edu', password: 'admin123' },
  hod: { email: 'hod.cmpn@campus.edu', password: 'hod123' },
  teacher: { email: 'teacher.a1@campus.edu', password: 'teach123' },
  student: { email: 'student.a1@campus.edu', password: 'stud123' },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useStore();

  // Deep links such as /login?role=hod prefill straight from the query param,
  // so no state-setting effect is needed.
  const roleParam = searchParams.get('role') as UserRole | null;
  const initialCreds = roleParam ? DEMO_CREDENTIALS[roleParam] : undefined;

  // Land the user back on whatever protected page sent them here. Only
  // same-origin relative paths are honoured, so this can't be an open redirect.
  const rawNext = searchParams.get('next');
  const nextPath = rawNext && /^\/(?!\/)/.test(rawNext) ? rawNext : '/dashboard';

  const [email, setEmail] = useState(initialCreds?.email ?? '');
  const [password, setPassword] = useState(initialCreds?.password ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(
    initialCreds ? roleParam : null
  );

  const handleQuickSelectRole = useCallback((role: UserRole) => {
    setSelectedRole(role);
    setError('');
    const creds = DEMO_CREDENTIALS[role];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let loggedInUser: User | null = null;

      // 1. Prefer a real Supabase session when the project is configured.
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const { data } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (data?.user) {
            const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
            loggedInUser = {
              id: data.user.id,
              name: (meta.name as string) || email.split('@')[0],
              email: data.user.email || email.trim(),
              role: (meta.role as UserRole) || selectedRole || 'student',
              department_id: (meta.department_id as string) ?? null,
              division_id: (meta.division_id as string) ?? null,
              faculty_initial: (meta.faculty_initial as string) ?? null,
              must_change_password: false,
              created_at: data.user.created_at,
            };
          }
        } catch {
          // Auth/network failure — fall through to the built-in demo personas.
        }
      }

      // 2. Fall back to the built-in demo personas so the demo always works.
      if (!loggedInUser) {
        const matchedUser = MOCK_USERS.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase()
        );

        loggedInUser = matchedUser ?? {
          id: 'user-custom-' + Date.now(),
          name: email.split('@')[0],
          email: email.trim(),
          role: selectedRole || 'student',
          department_id: 'dept-cmpn',
          division_id: 'div-se-a',
          faculty_initial: null,
          must_change_password: false,
          created_at: new Date().toISOString(),
        };
      }

      // Persist the session for the store, SSR and middleware
      setUser(loggedInUser);
      writeDemoSession(loggedInUser);

      // Redirect to the requested page (or the dashboard by default)
      setTimeout(() => {
        router.push(nextPath);
      }, 400);
    } catch {
      setError('Invalid login credentials. Please check or click a demo role.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5EB] flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#FF6B70] border-3 border-black nb-shadow flex items-center justify-center text-white">
          <Clock className="w-7 h-7 stroke-[2.5]" />
        </div>
        <div>
          <span className="font-black text-2xl uppercase tracking-tighter block text-black">
            Campus Clock
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B70]">
            Single Sign-On Portal
          </span>
        </div>
      </Link>

      <InstitutionLogos size="md" className="mb-6" />

      <Card className="w-full max-w-lg bg-white p-6 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tight text-black">
            Account Login
          </h2>
          <p className="text-xs font-bold text-black/60 mt-1">
            Choose a demo persona or enter institutional email
          </p>
        </div>

        {/* ── 1-Click Role Selectors ── */}
        <div className="mb-6 p-4 rounded-xl border-3 border-black bg-[#FFF9F1] nb-shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-black uppercase text-black flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B70]" />
              <span>1-Click Demo Profiles</span>
            </span>
            <span className="text-[10px] font-bold text-black/60">
              Click to autofill
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSelectRole('management')}
              className={`p-2 rounded-xl border-2 border-black font-black text-xs uppercase transition-transform flex flex-col items-center gap-0.5 cursor-pointer ${
                selectedRole === 'management'
                  ? 'bg-[#FF6B70] text-white nb-shadow-sm -translate-y-0.5'
                  : 'bg-white text-black hover:bg-[#FF6B70]/10'
              }`}
            >
              <span>👔 Dean</span>
              <span className="text-[9px] font-bold opacity-80">Mgmt</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelectRole('hod')}
              className={`p-2 rounded-xl border-2 border-black font-black text-xs uppercase transition-transform flex flex-col items-center gap-0.5 cursor-pointer ${
                selectedRole === 'hod'
                  ? 'bg-[#A78BFA] text-black nb-shadow-sm -translate-y-0.5'
                  : 'bg-white text-black hover:bg-[#A78BFA]/10'
              }`}
            >
              <span>🎓 HOD</span>
              <span className="text-[9px] font-bold opacity-80">CMPN</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelectRole('teacher')}
              className={`p-2 rounded-xl border-2 border-black font-black text-xs uppercase transition-transform flex flex-col items-center gap-0.5 cursor-pointer ${
                selectedRole === 'teacher'
                  ? 'bg-[#42D1C3] text-black nb-shadow-sm -translate-y-0.5'
                  : 'bg-white text-black hover:bg-[#42D1C3]/10'
              }`}
            >
              <span>👩‍🏫 Teacher</span>
              <span className="text-[9px] font-bold opacity-80">SE-A</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelectRole('student')}
              className={`p-2 rounded-xl border-2 border-black font-black text-xs uppercase transition-transform flex flex-col items-center gap-0.5 cursor-pointer ${
                selectedRole === 'student'
                  ? 'bg-[#FFE66D] text-black nb-shadow-sm -translate-y-0.5'
                  : 'bg-white text-black hover:bg-[#FFE66D]/20'
              }`}
            >
              <span>🎒 Student</span>
              <span className="text-[9px] font-bold opacity-80">Aarav</span>
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl border-2 border-[#FF6B70] bg-[#FFE3E4] text-xs font-black text-[#FF6B70]">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Institutional Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. hod.cmpn@campus.edu"
            icon={<Mail className="w-4 h-4 stroke-[2.2]" />}
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4 stroke-[2.2]" />}
          />

          <div className="flex items-center justify-between text-xs font-bold pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" defaultChecked className="nb-checkbox" />
              <span className="text-black/80">Remember session</span>
            </label>
            <span className="text-black/50 hover:underline cursor-pointer">
              Forgot password?
            </span>
          </div>

          <Button
            type="submit"
            variant="warning"
            size="lg"
            loading={loading}
            className="w-full mt-2"
            icon={<ArrowRight className="w-5 h-5 stroke-[2.5]" />}
          >
            Enter Campus Clock
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t-2 border-black/10 text-center">
          <Link
            href="/"
            className="text-xs font-black uppercase text-black/70 hover:text-black hover:underline"
          >
            ← Back to Homepage
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF5EB] flex items-center justify-center font-black">Loading Login...</div>}>
      <LoginForm />
    </Suspense>
  );
}

