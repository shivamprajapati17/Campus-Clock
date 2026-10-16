'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Edit3,
  Layers,
  Users,
  MessageSquare,
  FileDown,
  UserCheck,
  User as UserIcon,
  LogOut,
  Clock,
  X,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearUser, sidebarOpen, toggleSidebar } = useStore();

  const handleLogout = () => {
    // Clear demo cookies and zustand
    document.cookie = 'campus_clock_demo_user=; path=/; max-age=0';
    clearUser();
    router.push('/login');
  };

  const role = user?.role || 'student';

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5 stroke-[2.2]" />,
      roles: ['management', 'hod', 'teacher', 'student'],
    },
    {
      label: 'Timetables',
      href: '/dashboard/timetable',
      icon: <Calendar className="w-5 h-5 stroke-[2.2]" />,
      roles: ['management', 'hod', 'teacher', 'student'],
    },
    {
      label: 'Auto Generator',
      href: '/dashboard/generate',
      icon: <Sparkles className="w-5 h-5 stroke-[2.2] text-[#FF5D5D]" />,
      roles: ['management', 'hod'],
      badge: '0-Clash',
    },
    {
      label: 'Live Editor',
      href: '/dashboard/editor/tt-se-a-pub',
      icon: <Edit3 className="w-5 h-5 stroke-[2.2]" />,
      roles: ['management', 'hod'],
    },
    {
      label: 'Master View',
      href: '/dashboard/master',
      icon: <Layers className="w-5 h-5 stroke-[2.2]" />,
      roles: ['management'],
      badge: 'All Depts',
    },
    {
      label: 'Free Faculty',
      href: '/dashboard/faculty',
      icon: <UserCheck className="w-5 h-5 stroke-[2.2]" />,
      roles: ['management', 'hod', 'teacher'],
    },
    {
      label: 'Campus Chat',
      href: '/dashboard/chat',
      icon: <MessageSquare className="w-5 h-5 stroke-[2.2]" />,
      roles: ['management', 'hod', 'teacher', 'student'],
    },
    {
      label: 'Exports & PDF',
      href: '/dashboard/exports',
      icon: <FileDown className="w-5 h-5 stroke-[2.2]" />,
      roles: ['management', 'hod', 'teacher', 'student'],
    },
    {
      label: 'Manage Users',
      href: '/dashboard/users',
      icon: <Users className="w-5 h-5 stroke-[2.2]" />,
      roles: ['management'],
    },
    {
      label: 'My Profile',
      href: '/dashboard/profile',
      icon: <UserIcon className="w-5 h-5 stroke-[2.2]" />,
      roles: ['management', 'hod', 'teacher', 'student'],
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r-3 border-black flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0',
          sidebarOpen ? 'translate-x-0 shadow-2xl md:shadow-none' : '-translate-x-full'
        )}
      >
        {/* Top: Brand Header */}
        <div>
          <div className="p-5 border-b-3 border-black bg-[#FFD93D] flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-black border-2 border-white flex items-center justify-center text-[#FFD93D] shadow-md">
                <Clock className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="font-black text-lg tracking-tight uppercase text-black leading-tight">
                  Campus Clock
                </h1>
                <span className="text-[10px] font-black uppercase tracking-widest text-black/75">
                  SaaS Timetabler
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg border-2 border-black bg-white md:hidden text-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User badge preview */}
          <div className="p-3 bg-[#FDF6EC] border-b-2 border-black/30 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg border-2 border-black bg-white flex items-center justify-center font-black text-xs text-black">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-black text-black truncate">
                  {user?.name || 'Guest User'}
                </p>
              </div>
            </div>
            <Badge color={role} size="sm">
              {role}
            </Badge>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-250px)]">
            {visibleItems.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wide border-2 transition-all select-none',
                    isActive
                      ? 'bg-[#FFD93D] text-black border-black nb-shadow-sm translate-x-1'
                      : 'bg-transparent text-black/80 border-transparent hover:bg-[#FFFBEB] hover:border-black/20 hover:text-black'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(isActive ? 'text-black' : 'text-black/70')}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-black text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Logout */}
        <div className="p-4 border-t-3 border-black bg-[#FDF6EC]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-black bg-[#FF5D5D] text-white font-black text-xs uppercase tracking-wider nb-shadow-sm hover:bg-[#ff4242] transition-transform active:translate-y-0.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4 stroke-[2.5]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

