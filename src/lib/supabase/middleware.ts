// ─────────────────────────────────────────────────────────────
// Campus Clock – Supabase Middleware Helper
//
// Refreshes the Supabase auth session on every matched request and
// guards /dashboard. Access is granted only by a real Supabase session;
// the client-readable demo cookie is UI state, never an authorisation
// token. When Supabase is unconfigured (a bare local preview) we never
// block, so the app stays explorable without credentials.
// ─────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './client';

export async function updateSession(request: NextRequest) {
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

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

    if (!user && isProtectedRoute) {
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
