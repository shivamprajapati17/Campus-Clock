// ─────────────────────────────────────────────────────────────
// Campus Clock – Root Next.js Middleware
// ─────────────────────────────────────────────────────────────
//
// Runs on every matched request to:
//   1. Refresh the Supabase auth session (token rotation)
//   2. Redirect unauthenticated users away from /dashboard/*
// ─────────────────────────────────────────────────────────────

import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

/**
 * Only run the middleware on routes that actually need auth protection
 * or session refresh. Static assets, images, and the favicon are excluded.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *   - _next/static  (static files)
     *   - _next/image   (image optimisation)
     *   - favicon.ico   (favicon)
     *   - public assets (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
