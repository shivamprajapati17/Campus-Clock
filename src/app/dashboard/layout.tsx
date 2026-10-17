'use client';

import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { useStore } from '@/store/useStore';
import { useMasterData } from '@/store/useMasterData';
import { useTimetableData } from '@/store/useTimetableData';
import { MOCK_USERS, MOCK_NOTIFICATIONS } from '@/lib/data/mockData';
import { Loader } from '@/components/ui/Loader';
import { readDemoSession, writeDemoSession } from '@/lib/utils';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { User } from '@/lib/types';

/**
 * Client-detection via useSyncExternalStore instead of a `mounted` flag set
 * inside an effect — the server snapshot is false, the client snapshot is true,
 * so we render the loader during SSR/hydration without triggering cascading
 * renders. See https://react.dev/reference/react/useSyncExternalStore
 */
const subscribeToNothing = () => () => {};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setUser, notifications, setNotifications } = useStore();

  const isClient = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  );

  // Notifications belong to one account, so they are loaded once per sign-in
  // rather than shared across every role.
  const notificationsFor = useRef<string | null>(null);

  useEffect(() => {
    // Pick up any department / division edits saved on this device before the
    // portal renders, so counts and dropdowns show the operator's own data.
    useMasterData.getState().hydrate();
    useTimetableData.getState().hydrate();

    // Restore the persona this browser already signed in as.
    if (!user) {
      const stored = readDemoSession<User>();
      if (stored) {
        setUser(stored);
      } else if (isSupabaseConfigured()) {
        // The persona cookie can be cleared while the real session survives
        // (or set on another tab). Rebuild the profile from Supabase rather
        // than showing "Guest" over a valid session.
        createClient()
          .auth.getUser()
          .then(({ data }) => {
            const authUser = data.user;
            if (!authUser) return;
            const meta = (authUser.user_metadata ?? {}) as Record<string, unknown>;
            const restored: User = {
              id: authUser.id,
              name: (meta.name as string) || authUser.email?.split('@')[0] || 'Campus User',
              email: authUser.email || '',
              role: (meta.role as User['role']) || 'student',
              department_id: (meta.department_id as string) ?? null,
              division_id: (meta.division_id as string) ?? null,
              faculty_initial: (meta.faculty_initial as string) ?? null,
              department_code: (meta.department_code as string) ?? null,
              must_change_password: false,
              created_at: authUser.created_at,
            };
            setUser(restored);
            writeDemoSession(restored);
          })
          .catch(() => {
            // Offline: stay on the loader rather than inventing a persona.
          });
      } else {
        // Only when no Supabase project is configured (a bare local preview) do
        // we fall back to the Dean persona, so the portal stays explorable.
        // With real auth configured this must never run: re-creating a persona
        // here would silently sign a user straight back in after they log out.
        setUser(MOCK_USERS[0]);
        writeDemoSession(MOCK_USERS[0]);
      }
    }

    if (user && notificationsFor.current !== user.id) {
      notificationsFor.current = user.id;
      setNotifications(
        MOCK_NOTIFICATIONS.filter(
          (n) =>
            n.user_id === user.id ||
            (user.role === 'management' && n.type === 'system')
        )
      );
    }
  }, [user, setUser, notifications.length, setNotifications]);

  if (!isClient) {
    return <Loader fullScreen text="Booting Campus Clock..." />;
  }

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Desktop & Mobile Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Navbar />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
