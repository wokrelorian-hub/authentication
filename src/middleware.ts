import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Get the session cookie
  const session = request.cookies.get("stytch_session")?.value;
  
  // 2. Get the current path user is trying to visit
  const path = request.nextUrl.pathname;

  // 3. Define which paths are "Public" (anyone can visit)
  // We use startsWith to cover /login, /login/password, etc.
  const isPublicPath = 
    path.startsWith("/login") || 
    path.startsWith("/signup") || 
    path.startsWith("/verify");

  // SCENARIO A: User is logged in, but tries to visit Login/Signup
  // Action: Redirect them to Home (Why login again?)
  if (isPublicPath && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // SCENARIO B: User is NOT logged in, but tries to visit a Protected Page (Home, Setup)
  // Action: Redirect them to Login
  if (!isPublicPath && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Configuration: Which paths should the middleware run on?
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files like images/css)
     * - _next/image (image optimization files)
     * - favicon.ico (browser icon)
     * - any file with an extension (like .svg, .png)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};