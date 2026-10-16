'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Toggle } from '@/components/ui/Toggle';
import { Progress } from '@/components/ui/Progress';
import { MOCK_USERS } from '@/lib/data/mockData';
import type { User, UserRole } from '@/lib/types';
import {
  User as UserIcon,
  Shield,
  Key,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LogOut,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, clearUser } = useStore();

  const [passwordSaved, setPasswordSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [clashWarnings, setClashWarnings] = useState(true);
  const [compactGrid, setCompactGrid] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setPasswordSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  const handleQuickSwitch = (persona: User) => {
    setUser(persona);
    document.cookie = `campus_clock_demo_user=${encodeURIComponent(
      JSON.stringify(persona)
    )}; path=/; max-age=604800`;
  };

  const handleSignOut = () => {
    document.cookie = 'campus_clock_demo_user=; path=/; max-age=0';
    clearUser();
    router.push('/login');
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
            My Account & Persona
          </h1>
          <p className="text-xs md:text-sm font-bold text-black/70">
            Manage your credentials and switch testing personas in 1-click.
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
        {/* Left: Account Overview Card */}
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
            <p className="text-xs font-bold text-black/60 mt-0.5">
              {user?.email}
            </p>

            <div className="mt-4 inline-block">
              <Badge color={user?.role || 'student'} size="md">
                System Role: {user?.role || 'student'}
              </Badge>
            </div>

            <div className="mt-6 pt-5 border-t-2 border-black/10 text-left space-y-2 text-xs font-bold text-black/80">
              <div className="flex items-center justify-between py-1 border-b border-black/10">
                <span>Account ID</span>
                <span className="font-mono text-[11px] font-black">{user?.id || 'usr-1'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-black/10">
                <span>Faculty Code</span>
                <span className="font-black text-black">
                  {user?.faculty_initial || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Department</span>
                <span className="font-black text-black">Computer Engineering</span>
              </div>
            </div>
          </Card>

          {/* Quick Persona Switcher for Evaluators */}
          <Card className="p-5 bg-[#FFF9F1]">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-[#FF6B70]" />
              <h3 className="text-xs font-black uppercase text-black">
                Switch Active Testing Persona
              </h3>
            </div>
            <p className="text-xs font-bold text-black/70 mb-4">
              Test how UI navigation and permissions change dynamically across all 4 roles:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {MOCK_USERS.map((persona) => {
                const isActive = user?.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => handleQuickSwitch(persona)}
                    className={`p-2.5 rounded-xl border-2 border-black text-left font-black text-xs uppercase transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'bg-[#FFE66D] nb-shadow-sm -translate-y-0.5'
                        : 'bg-white hover:bg-[#FFF5EB]'
                    }`}
                  >
                    <span className="text-[10px] opacity-75">{persona.role}</span>
                    <span className="truncate mt-1">{persona.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Preferences — reusable Toggle + Progress components */}
          <Card className="p-5 bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <h3 className="text-xs font-black uppercase text-black">
                Workspace Preferences
              </h3>
              <span className="nb-star" aria-hidden="true" />
            </div>

            <Progress
              label="Profile Completeness"
              value={82}
              showValue
              color="#42D1C3"
            />

            <div className="space-y-3 pt-1">
              <Toggle
                label="Email Alerts"
                hint="Publish & schedule notifications"
                checked={emailAlerts}
                onChange={setEmailAlerts}
              />
              <Toggle
                label="Clash Warnings"
                hint="Highlight conflicts in the editor"
                checked={clashWarnings}
                onChange={setClashWarnings}
              />
              <Toggle
                label="Compact Grid"
                hint="Denser timetable cells"
                checked={compactGrid}
                onChange={setCompactGrid}
              />
            </div>
          </Card>
        </div>

        {/* Right: Security & Password Update */}
        <div className="lg:col-span-7">
          <Card className="p-6 bg-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-black" />
                <h3 className="text-base font-black uppercase text-black">
                  Change Password
                </h3>
              </div>
              <span className="text-[11px] font-bold text-black/60">
                BCrypt Cost 12 Security
              </span>
            </div>

            {passwordSaved && (
              <div className="p-3 rounded-xl border-2 border-green-600 bg-green-50 text-xs font-bold text-green-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Password updated successfully!</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Input
                label="New Password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
              />

              <Button
                type="submit"
                variant="warning"
                size="md"
                className="mt-2"
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Update Password
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

