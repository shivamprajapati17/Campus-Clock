import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const isProtected = request.nextUrl.pathname.startsWith('/dashboard');

  if (isProtected) {
    const demoCookie = request.cookies.get('campus_clock_demo_user');
    // If no demo session, we allow client-side layout to handle or redirect
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
