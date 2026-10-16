'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  MessageSquare,
  FileDown,
} from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Home',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5 stroke-[2.2]" />,
    },
    {
      label: 'Schedule',
      href: '/dashboard/timetable',
      icon: <Calendar className="w-5 h-5 stroke-[2.2]" />,
    },
    {
      label: 'Generate',
      href: '/dashboard/generate',
      icon: <Sparkles className="w-5 h-5 stroke-[2.2]" />,
    },
    {
      label: 'Chat',
      href: '/dashboard/chat',
      icon: <MessageSquare className="w-5 h-5 stroke-[2.2]" />,
    },
    {
      label: 'Export',
      href: '/dashboard/exports',
      icon: <FileDown className="w-5 h-5 stroke-[2.2]" />,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-3 border-black px-2 py-1.5 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const isActive =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all',
              isActive
                ? 'bg-[#FFD93D] text-black border-2 border-black nb-shadow-sm font-black'
                : 'text-black/70 hover:text-black font-bold'
            )}
          >
            {item.icon}
            <span className="text-[10px] mt-0.5 tracking-tight uppercase">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

