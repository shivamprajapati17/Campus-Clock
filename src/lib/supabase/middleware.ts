// ─────────────────────────────────────────────────────────────
// Campus Clock – Supabase Middleware Helper
//
// Refreshes the Supabase auth session on every matched request and
// guards /dashboard. Two access paths are supported:
//   1. A real Supabase session (when the project is configured).
//   2. An explicit demo persona cookie (the built-in reviewer flow).
// When Supabase is unconfigured or unreachable we never block, so the
// demo always keeps working.
// ─────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './client';

const DEMO_COOKIE = 'campus_clock_demo_user';

export async function updateSession(request: NextRequest) {
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const hasDemoSession = Boolean(request.cookies.get(DEMO_COOKIE));

  // Demo mode: Supabase is not configured, so never block access.
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // A real session OR an explicit demo persona both grant access.
    if (!user && !hasDemoSession && isProtectedRoute) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      // Remember where the user was headed so sign-in returns them there.
      loginUrl.searchParams.set(
        'next',
        request.nextUrl.pathname + request.nextUrl.search
      );
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // Never lock users out because Supabase was temporarily unreachable.
    return NextResponse.next({ request });
  }

  return supabaseResponse;
}
