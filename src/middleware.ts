import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Refreshes the Supabase auth session and guards /dashboard while still
  // allowing the built-in demo persona cookie.
  return updateSession(request);
}

export const config = {
  // Run on pages only — skip API routes, Next internals and static files.
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
