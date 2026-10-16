'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import type { UserRole } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export interface ProtectedRouteProps {
  roles: UserRole[];
  children: React.ReactNode;
}

export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const { user } = useStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-md text-center p-8 bg-white">
          <div className="w-16 h-16 rounded-2xl bg-[#FF5D5D] border-3 border-black nb-shadow flex items-center justify-center mx-auto mb-4 text-white">
            <ShieldAlert className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black uppercase text-black mb-2">
            Authentication Required
          </h2>
          <p className="text-sm font-bold text-black/70 mb-6">
            Please log in with your campus credentials to access this portal.
          </p>
          <Link href="/login">
            <Button variant="warning" className="w-full">
              Go to Login
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!roles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-md text-center p-8 bg-[#FFF5F5] border-3 border-black">
          <div className="w-16 h-16 rounded-2xl bg-[#FF5D5D] border-3 border-black nb-shadow flex items-center justify-center mx-auto mb-4 text-white">
            <ShieldAlert className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black uppercase text-black mb-2">
            Access Denied
          </h2>
          <p className="text-sm font-bold text-black/70 mb-1">
            Your role (<span className="uppercase text-[#FF5D5D] font-black">{user.role}</span>) does not have permission to view this section.
          </p>
          <p className="text-xs text-black/60 mb-6">
            Required roles: {roles.join(', ')}
          </p>
          <Link href="/dashboard">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

