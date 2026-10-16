'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import {
  Menu,
  Bell,
  Sparkles,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, notifications, toggleSidebar, markRead } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);

  // Generate page title from pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Campus Overview';
    if (pathname.includes('/generate')) return 'AI Timetable Generator';
    if (pathname.includes('/editor')) return 'Interactive Timetable Editor';
    if (pathname.includes('/timetable')) return 'Department Timetables';
    if (pathname.includes('/master')) return 'Executive Master View';
    if (pathname.includes('/faculty')) return 'Faculty Slot Finder';
    if (pathname.includes('/chat')) return 'Live Campus Chat';
    if (pathname.includes('/exports')) return 'Export & Print Center';
    if (pathname.includes('/users')) return 'User & Role Directory';
    if (pathname.includes('/profile')) return 'My Account Settings';
    return 'Campus Clock';
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b-3 border-black px-4 md:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl border-2 border-black bg-[#FFD93D] text-black nb-shadow-sm md:hidden cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div>
          <h2 className="text-base md:text-xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>{getPageTitle()}</span>
          </h2>
        </div>
      </div>

      {/* Right: Quick Actions, Notifications & Avatar */}
      <div className="flex items-center gap-3">
        {/* Generate shortcut for HOD/Management */}
        {(user?.role === 'hod' || user?.role === 'management') && (
          <Link
            href="/dashboard/generate"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black bg-[#2DD4BF] text-black text-xs font-black nb-shadow-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform"
          >
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Generate</span>
          </Link>
        )}

        {/* Notifications dropdown trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl border-2 border-black bg-white text-black nb-shadow-sm hover:bg-[#FFFBEB] cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5 stroke-[2.2]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF5D5D] border-2 border-black text-white text-[10px] font-black flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FDF6EC] rounded-2xl border-3 border-black nb-shadow p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b-2 border-black mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-black">
                  Notifications ({unreadCount} new)
                </span>
                <span className="text-[10px] font-bold text-black/60">
                  Campus Clock Updates
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs font-bold text-black/50 text-center py-4">
                    No notifications right now.
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markRead(notif.id)}
                      className={`p-2.5 rounded-xl border-2 border-black transition-all cursor-pointer ${
                        notif.read ? 'bg-white/80 opacity-70' : 'bg-[#FFD93D]/30 nb-shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-black leading-tight">
                          {notif.message}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[#FF5D5D] shrink-0 mt-1" />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/10 text-[10px] font-bold text-black/60">
                        <span>{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {notif.link && (
                          <Link href={notif.link} className="flex items-center gap-0.5 text-black hover:underline font-black">
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Avatar */}
        <Link href="/dashboard/profile" className="flex items-center gap-2 pl-2">
          <Avatar
            name={user?.name || 'User'}
            role={user?.role || 'student'}
            size="sm"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-black text-black leading-none truncate max-w-[120px]">
              {user?.name || 'Guest User'}
            </p>
            <Badge color={user?.role || 'student'} size="sm" className="mt-0.5 scale-90 -ml-1">
              {user?.role || 'student'}
            </Badge>
          </div>
        </Link>
      </div>
    </header>
  );
}
