// ─────────────────────────────────────────────────────────────
// Campus Clock – Supabase Middleware Helper
// ─────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './client';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // If Supabase credentials are not yet configured, allow demo access via mock cookies
  if (!isSupabaseConfigured()) {
    const demoUser = request.cookies.get('campus_clock_demo_user');
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

    if (!demoUser && isProtectedRoute) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
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
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

    if (!user && isProtectedRoute) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // If Supabase request fails, check demo cookie fallback
    const demoUser = request.cookies.get('campus_clock_demo_user');
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

    if (!demoUser && isProtectedRoute) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      return NextResponse.redirect(loginUrl);
    }
  }

  return supabaseResponse;
}
