'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { useStore } from '@/store/useStore';
import { useMasterData } from '@/store/useMasterData';
import { MOCK_USERS, MOCK_NOTIFICATIONS } from '@/lib/data/mockData';
import { Loader } from '@/components/ui/Loader';
import { readDemoSession, writeDemoSession } from '@/lib/utils';
import { isSupabaseConfigured } from '@/lib/supabase/client';
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

  useEffect(() => {
    // Pick up any department / division edits saved on this device before the
    // portal renders, so counts and dropdowns show the operator's own data.
    useMasterData.getState().hydrate();

    // Restore the persona this browser already signed in as.
    if (!user) {
      const stored = readDemoSession<User>();
      if (stored) {
        setUser(stored);
      } else if (!isSupabaseConfigured()) {
        // Only when no Supabase project is configured (a bare local preview) do
        // we fall back to the Dean persona, so the portal stays explorable.
        // With real auth configured this must never run: re-creating a persona
        // here would silently sign a user straight back in after they log out.
        setUser(MOCK_USERS[0]);
        writeDemoSession(MOCK_USERS[0]);
      }
    }

    if (notifications.length === 0) {
      setNotifications(MOCK_NOTIFICATIONS);
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
