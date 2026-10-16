'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { useStore } from '@/store/useStore';
import { MOCK_USERS, MOCK_NOTIFICATIONS } from '@/lib/data/mockData';
import { Loader } from '@/components/ui/Loader';
import { readDemoSession, writeDemoSession } from '@/lib/utils';
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
    // Restore the demo persona from the cookie, or default to the Dean persona
    // so reviewers can explore every role without a real sign-in.
    if (!user) {
      const stored = readDemoSession<User>();
      if (stored) {
        setUser(stored);
      } else {
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
