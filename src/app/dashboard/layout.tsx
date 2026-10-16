'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { useStore } from '@/store/useStore';
import { MOCK_USERS, MOCK_NOTIFICATIONS } from '@/lib/data/mockData';
import { Loader } from '@/components/ui/Loader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setUser, notifications, setNotifications } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // If no user in state, check demo cookie or default to Dean/Management for demo review
    if (!user) {
      const match = document.cookie.match(/campus_clock_demo_user=([^;]+)/);
      if (match && match[1]) {
        try {
          const parsed = JSON.parse(decodeURIComponent(match[1]));
          setUser(parsed);
        } catch {
          setUser(MOCK_USERS[0]); // default to management demo
        }
      } else {
        // Set default demo user
        setUser(MOCK_USERS[0]);
        document.cookie = `campus_clock_demo_user=${encodeURIComponent(
          JSON.stringify(MOCK_USERS[0])
        )}; path=/; max-age=604800`;
      }
    }

    if (notifications.length === 0) {
      setNotifications(MOCK_NOTIFICATIONS);
    }

    setMounted(true);
  }, [user, setUser, notifications.length, setNotifications]);

  if (!mounted) {
    return <Loader fullScreen text="Booting Campus Clock..." />;
  }

  return (
    <div className="flex min-h-screen bg-[#FDF6EC]">
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
