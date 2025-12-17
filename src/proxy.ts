import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // 1. Check for the Stytch Session Cookie (Created automatically by the SDK)
  const stytchSession = request.cookies.get('stytch_session')?.value;

  const { pathname } = request.nextUrl;

  // 2. PROTECTED ROUTES: If user is NOT logged in, block them from Dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!stytchSession) {
      // No ticket? Go back to Login
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 3. PUBLIC ROUTES: If user IS logged in, block them from Login Page
  // (This fixes the issue you noticed!)
  if (pathname === '/') {
    if (stytchSession) {
      // Already have a ticket? Go to Dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Apply this rule to Dashboard and the Home (Login) page
export const config = {
  matcher: ['/', '/dashboard/:path*'],
};