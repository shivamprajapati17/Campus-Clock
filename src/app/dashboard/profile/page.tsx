'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Toggle } from '@/components/ui/Toggle';
import { Progress } from '@/components/ui/Progress';
import { useMasterData } from '@/store/useMasterData';
import { useStoredState } from '@/lib/useStoredState';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  writeDemoSession,
  clearDemoSession,
  resolveDepartmentId,
  formatDate,
} from '@/lib/utils';
import {
  Key,
  CheckCircle2,
  LogOut,
  AlertTriangle,
  ShieldCheck,
  Lock,
} from 'lucide-react';

const PREFS_KEY = 'campus_clock_profile_prefs_v1';

interface Prefs {
  emailAlerts: boolean;
  clashWarnings: boolean;
  compactGrid: boolean;
}

const DEFAULT_PREFS: Prefs = {
  emailAlerts: true,
  clashWarnings: true,
  compactGrid: false,
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, clearUser } = useStore();
  const departments = useMasterData((s) => s.departments);
  const divisions = useMasterData((s) => s.divisions);

  const resolvedDepartmentId = resolveDepartmentId(
    departments,
    user?.department_id,
    user?.department_code
  );
  const department = departments.find((d) => d.id === resolvedDepartmentId);
  const division = divisions.find((d) => d.id === user?.division_id);

  const departmentLabel = department
    ? `${department.name} (${department.code})`
    : 'All Departments';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [storedPrefs, setPrefs] = useStoredState<Prefs>(PREFS_KEY, DEFAULT_PREFS);
  const prefs = { ...DEFAULT_PREFS, ...storedPrefs };

  const updatePref = <K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    setPrefs({ ...prefs, [key]: value });
  };

  const completeness = useMemo(() => {
    const checks = [
      Boolean(user?.name),
      Boolean(user?.email),
      Boolean(user?.faculty_initial),
      Boolean(department),
      Boolean(division) || user?.role === 'management' || user?.role === 'hod',
    ];
    return Math.round(
      (checks.filter(Boolean).length / checks.length) * 100
    );
  }, [user, department, division]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('Use at least 8 characters for the new password.');
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError('Choose a password different from your current one.');
      return;
    }

    if (!isSupabaseConfigured() || !user?.email) {
      setPasswordError(
        'Password changes need a live account. Sign in with a real campus account to update credentials.'
      );
      return;
    }

    setSavingPassword(true);
    try {
      const supabase = createClient();

      // Supabase cannot verify the old password itself, so re-authenticate
      // first — otherwise anyone with a borrowed session could set a new
      // password without knowing the current one.
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        setPasswordError('Current password is incorrect.');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setPasswordError(updateError.message);
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setPasswordMessage('Password updated successfully.');
      if (user) {
        setUser({ ...user, must_change_password: false });
        writeDemoSession({ ...user, must_change_password: false });
      }
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : 'Could not update the password.'
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSignOut = async () => {
    // Drop the local persona first so the UI reacts instantly, then end the
    // real Supabase session — otherwise the middleware keeps letting this
    // browser back into /dashboard.
    clearDemoSession();
    clearUser();

    if (isSupabaseConfigured()) {
      try {
        await createClient().auth.signOut();
      } catch (err) {
        console.warn('[campus-clock] sign-out could not reach Supabase', err);
      }
    }

    router.push('/login');
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-3 border-black">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-black/60">
              Identity & Access
            </span>
            <Badge color={user?.role || 'student'} size="sm">
              {user?.role || 'student'}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
            My Account
          </h1>
          <p className="text-xs md:text-sm font-bold text-black/70">
            Your campus identity, credentials and workspace preferences.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSignOut}
          icon={<LogOut className="w-4 h-4 stroke-[2.5]" />}
        >
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Account overview */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 bg-white text-center">
            <div className="flex justify-center mb-4">
              <Avatar
                name={user?.name || 'User'}
                role={user?.role || 'student'}
                size="xl"
              />
            </div>

            <h2 className="text-2xl font-black uppercase text-black">
              {user?.name || 'Academic User'}
            </h2>
            <p className="text-xs font-bold text-black/60 mt-0.5 break-all">
              {user?.email || 'Not signed in'}
            </p>

            <div className="mt-4 inline-block">
              <Badge color={user?.role || 'student'} size="md">
                {user?.role || 'student'}
              </Badge>
            </div>

            {user?.must_change_password && (
              <div className="mt-4 p-3 rounded-xl border-2 border-[#BF360C] bg-[#FFEBEE] text-[11px] font-black text-[#BF360C] text-left flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Your administrator asked you to set a new password.
              </div>
            )}

            <div className="mt-6 pt-5 border-t-2 border-black/10 text-left space-y-2 text-xs font-bold text-black/80">
              <div className="flex items-center justify-between gap-3 py-1 border-b border-black/10">
                <span className="text-black/60">Faculty Code</span>
                <span className="font-black text-black">
                  {user?.faculty_initial || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 py-1 border-b border-black/10">
                <span className="text-black/60">Department</span>
                <span className="font-black text-black text-right">
                  {departmentLabel}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 py-1 border-b border-black/10">
                <span className="text-black/60">Class Division</span>
                <span className="font-black text-black">
                  {division?.name ?? '—'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 py-1">
                <span className="text-black/60">Member Since</span>
                <span className="font-black text-black">
                  {user?.created_at ? formatDate(user.created_at) : '—'}
                </span>
              </div>
            </div>
          </Card>

          {/* Preferences */}
          <Card className="p-5 bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <h3 className="text-xs font-black uppercase text-black">
                Workspace Preferences
              </h3>
              <Badge color="outline" size="sm">
                This device
              </Badge>
            </div>

            <Progress
              label="Profile Completeness"
              value={completeness}
              showValue
              color="#4DB6AC"
            />

            <div className="space-y-3 pt-1">
              <Toggle
                label="Email Alerts"
                hint="Publish & schedule notifications"
                checked={prefs.emailAlerts}
                onChange={(v) => updatePref('emailAlerts', v)}
              />
              <Toggle
                label="Clash Warnings"
                hint="Highlight conflicts in the editor"
                checked={prefs.clashWarnings}
                onChange={(v) => updatePref('clashWarnings', v)}
              />
              <Toggle
                label="Compact Grid"
                hint="Denser timetable cells"
                checked={prefs.compactGrid}
                onChange={(v) => updatePref('compactGrid', v)}
              />
            </div>
          </Card>
        </div>

        {/* Right: Security */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 bg-white space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-black" />
                <h3 className="text-base font-black uppercase text-black">
                  Change Password
                </h3>
              </div>
              <span className="text-[11px] font-bold text-black/60 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
                Verified by Supabase Auth
              </span>
            </div>

            {passwordMessage && (
              <div
                role="status"
                className="p-3 rounded-xl border-2 border-green-700 bg-green-50 text-xs font-bold text-green-800 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{passwordMessage}</span>
              </div>
            )}

            {passwordError && (
              <div
                role="alert"
                className="p-3 rounded-xl border-2 border-[#BF360C] bg-[#FFEBEE] text-xs font-bold text-[#BF360C] flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4 stroke-[2.2]" />}
              />

              <Input
                label="New Password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                icon={<Key className="w-4 h-4 stroke-[2.2]" />}
              />

              <Button
                type="submit"
                variant="warning"
                size="md"
                loading={savingPassword}
                className="mt-2"
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Update Password
              </Button>
            </form>

            <p className="text-[11px] font-bold text-black/55">
              Changing your password signs out other devices the next time they
              refresh. Your current session stays active here.
            </p>
          </Card>

          <Card className="p-5 bg-[#F7FBF3]">
            <h3 className="text-xs font-black uppercase text-black mb-2">
              Access Summary
            </h3>
            <ul className="text-[11px] font-bold text-black/70 space-y-1.5 list-disc pl-4">
              <li>
                {user?.role === 'management'
                  ? 'Full campus access: every department, timetable, user and export.'
                  : user?.role === 'hod'
                    ? 'Department-scoped access: your classes, faculty and schedules.'
                    : user?.role === 'teacher'
                      ? 'Read access to your class schedule plus free-faculty lookup.'
                      : 'Read access to your published class schedule and exports.'}
              </li>
              <li>Sessions are stored in encrypted Supabase cookies.</li>
              <li>Contact Management to change your role or department.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
