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
import { InstitutionLogos } from '@/components/layout/InstitutionLogos';
import { Clock, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import type { User, UserRole } from '@/lib/types';

/** Institution ids used by the seeded campus data (must be valid UUIDs). */
const DEMO_DEPARTMENT_ID = '11111111-1111-4111-8111-111111111111';
const DEMO_DIVISION_ID = '22222222-2222-4222-8222-222222222222';

/**
 * Role profiles. Selecting one sets the role, name and department that a new
 * account is created with — the email and password stay fully editable, so a
 * visitor can register with their own address and still land in the right role.
 */
const PROFILES: Record<
  UserRole,
  {
    name: string;
    email: string;
    password: string;
    department_id: string | null;
    division_id: string | null;
    faculty_initial: string | null;
    /** Branch short code, used to line the account up with the master matrix. */
    department_code: string | null;
  }
> = {
  management: {
    name: 'Dr. Arthur Vance (Dean)',
    email: 'management@campus.edu',
    password: 'admin123',
    department_id: null,
    division_id: null,
    faculty_initial: null,
    department_code: null,
  },
  hod: {
    name: 'Prof. Bhushan Sir',
    email: 'hod.cmpn@campus.edu',
    password: 'hod123',
    department_id: DEMO_DEPARTMENT_ID,
    division_id: null,
    faculty_initial: 'BS',
    department_code: 'CMPN',
  },
  teacher: {
    name: 'Prof. Manthan Joshi',
    email: 'teacher.mj@campus.edu',
    password: 'teach123',
    department_id: DEMO_DEPARTMENT_ID,
    division_id: DEMO_DIVISION_ID,
    faculty_initial: 'MJ',
    department_code: 'CMPN',
  },
  student: {
    name: 'Aarav Patel',
    email: 'student.a1@campus.edu',
    password: 'stud123',
    department_id: DEMO_DEPARTMENT_ID,
    division_id: DEMO_DIVISION_ID,
    faculty_initial: null,
    department_code: 'CMPN',
  },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useStore();

  // Deep links such as /login?role=hod prefill straight from the query param,
  // so no state-setting effect is needed.
  const roleParam = searchParams.get('role') as UserRole | null;
  const initialProfile = roleParam ? PROFILES[roleParam] : undefined;

  // Land the user back on whatever protected page sent them here. Only
  // same-origin relative paths are honoured, so this can't be an open redirect.
  const rawNext = searchParams.get('next');
  const nextPath = rawNext && /^\/(?!\/)/.test(rawNext) ? rawNext : '/dashboard';

  const [email, setEmail] = useState(initialProfile?.email ?? '');
  const [password, setPassword] = useState(initialProfile?.password ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(
    initialProfile ? roleParam : null
  );

  const handleQuickSelectRole = useCallback((role: UserRole) => {
    setSelectedRole(role);
    setError('');
    const profile = PROFILES[role];
    if (profile) {
      setEmail(profile.email);
      setPassword(profile.password);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const profile = selectedRole ? PROFILES[selectedRole] : undefined;

    try {
      let loggedInUser: User | null = null;

      if (isSupabaseConfigured()) {
        const supabase = createClient();

        // 1. Sign in with an existing account.
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

        let authUser = signInData?.user ?? null;          if (signInError) {
          const msg = signInError.message ?? '';
          const unknownAccount =
            (signInError as { code?: string }).code === 'invalid_credentials' ||
            /invalid login credentials|user not found/i.test(msg);

          if (!unknownAccount) {
            throw new Error(msg || 'Sign-in failed. Please try again.');
          }

          // 2. No account for this email yet — register it as a student or
          //    teacher. Management and HOD access is provisioned by the college,
          //    so a visitor cannot grant themselves admin rights by typing an
          //    address. The seeded demo identities are the only exception, and
          //    only for their own fixed email.
          const privilegedRole =
            selectedRole === 'management' || selectedRole === 'hod';
          const isSeededIdentity = Boolean(
            profile && cleanEmail === profile.email.toLowerCase()
          );

          if (privilegedRole && !isSeededIdentity) {
            throw new Error(
              'Management and HOD accounts are created by the college. Ask your administrator to provision this email, or sign in with an existing account.'
            );
          }

          const { data: signUpData, error: signUpError } =
            await supabase.auth.signUp({
              email: cleanEmail,
              password,
              options: {
                data: {
                  name: profile?.name || cleanEmail.split('@')[0],
                  role: selectedRole ?? 'student',
                  department_id: profile?.department_id ?? null,
                  division_id: profile?.division_id ?? null,
                  faculty_initial: profile?.faculty_initial ?? null,
                  department_code: profile?.department_code ?? null,
                },
              },
            });

          if (signUpError) {
            const upMsg = signUpError.message ?? '';
            if (/already registered|already been registered|user already/i.test(upMsg)) {
              throw new Error(
                'That email already has an account — please check your password.'
              );
            }
            throw new Error(upMsg || 'Could not create your account.');
          }

          if (!signUpData.session) {
            setError(
              'Account created. Please confirm the email we sent you, then sign in.'
            );
            return;
          }

          authUser = signUpData.user;
        }

        if (!authUser) {
          throw new Error('Sign-in failed. Please try again.');
        }

        const meta = (authUser.user_metadata ?? {}) as Record<string, unknown>;
        loggedInUser = {
          id: authUser.id,
          name: (meta.name as string) || profile?.name || cleanEmail.split('@')[0],
          email: authUser.email || cleanEmail,
          role: (meta.role as UserRole) || selectedRole || 'student',
          department_id:
            (meta.department_id as string) ?? profile?.department_id ?? null,
          division_id:
            (meta.division_id as string) ?? profile?.division_id ?? null,
          faculty_initial:
            (meta.faculty_initial as string) ?? profile?.faculty_initial ?? null,
          department_code:
            (meta.department_code as string) ?? profile?.department_code ?? null,
          must_change_password: false,
          created_at: authUser.created_at,
        };
      } else {
        // Supabase is not configured (local/preview): use the bundled personas
        // so the app is still fully explorable.
        const matchedUser = MOCK_USERS.find(
          (u) => u.email.toLowerCase() === cleanEmail
        );

        loggedInUser = matchedUser ?? {
          id: 'user-custom-' + Date.now(),
          name: profile?.name || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: selectedRole ?? 'student',
          department_id: profile?.department_id ?? null,
          division_id: profile?.division_id ?? null,
          faculty_initial: profile?.faculty_initial ?? null,
          department_code: profile?.department_code ?? null,
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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to sign in right now.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F8E9] flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#BF360C] border-3 border-black nb-shadow flex items-center justify-center text-white">
          <Clock className="w-7 h-7 stroke-[2.5]" />
        </div>
        <div>
          <span className="font-black text-2xl uppercase tracking-tighter block text-black">
            Campus Clock
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#BF360C]">
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
            Pick your role, then sign in — or register with your own email.
          </p>
        </div>

        {/* ── 1-Click Role Selectors ── */}
        <div className="mb-6 p-4 rounded-xl border-3 border-black bg-[#F7FBF3] nb-shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-black uppercase text-black flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#BF360C]" />
              <span>1 · Choose your role</span>
            </span>
            <span className="text-[10px] font-bold text-black/60">
              Sample identities
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSelectRole('management')}
              className={`p-2 rounded-xl border-2 border-black font-black text-xs uppercase transition-transform flex flex-col items-center gap-0.5 cursor-pointer ${
                selectedRole === 'management'
                  ? 'bg-[#BF360C] text-white nb-shadow-sm -translate-y-0.5'
                  : 'bg-white text-black hover:bg-[#BF360C]/10'
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
                  ? 'bg-[#80CBC4] text-black nb-shadow-sm -translate-y-0.5'
                  : 'bg-white text-black hover:bg-[#80CBC4]/10'
              }`}
            >                  <span>🎓 HOD</span>
                  <span className="text-[9px] font-bold opacity-80">BS</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelectRole('teacher')}
              className={`p-2 rounded-xl border-2 border-black font-black text-xs uppercase transition-transform flex flex-col items-center gap-0.5 cursor-pointer ${
                selectedRole === 'teacher'
                  ? 'bg-[#4DB6AC] text-black nb-shadow-sm -translate-y-0.5'
                  : 'bg-white text-black hover:bg-[#4DB6AC]/10'
              }`}
            >
              <span>👨‍🏫 Teacher</span>
              <span className="text-[9px] font-bold opacity-80">MJ</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelectRole('student')}
              className={`p-2 rounded-xl border-2 border-black font-black text-xs uppercase transition-transform flex flex-col items-center gap-0.5 cursor-pointer ${
                selectedRole === 'student'
                  ? 'bg-[#FFD54F] text-black nb-shadow-sm -translate-y-0.5'
                  : 'bg-white text-black hover:bg-[#FFD54F]/20'
              }`}
            >
              <span>🎒 Student</span>
              <span className="text-[9px] font-bold opacity-80">Aarav</span>
            </button>
          </div>

          <p className="text-[11px] font-bold text-black/60 mt-3 leading-snug">
            Selecting a role prefills a sample address. The email and password below
            stay editable — use your own address instead and we&apos;ll create your
            account in that role.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl border-2 border-[#BF360C] bg-[#FFEBEE] text-xs font-black text-[#BF360C]">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-black">
              2 · Your details
            </span>
            <div className="mt-2 space-y-4">
              <Input
                label="Email Address"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourcollege.edu"
                icon={<Mail className="w-4 h-4 stroke-[2.2]" />}
              />

              <Input
                label="Password"
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                icon={<Lock className="w-4 h-4 stroke-[2.2]" />}
              />
            </div>
            <p className="text-[11px] font-bold text-black/55 mt-2">
              New email? We create the account automatically in the role you picked.
            </p>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl border-2 border-black/15 bg-[#F7FBF3] text-[11px] font-bold text-black/65">
            <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              Sessions stay signed in on this device. Password resets are handled
              by your department administrator.
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
            Sign In / Create Account
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
    <Suspense fallback={<div className="min-h-screen bg-[#F1F8E9] flex items-center justify-center font-black">Loading Login...</div>}>
      <LoginForm />
    </Suspense>
  );
}

