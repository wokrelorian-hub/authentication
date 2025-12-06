import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("stytch_session")?.value;
  const path = request.nextUrl.pathname;

  // IMPROVEMENT: Add "/monitoring" to public paths so Sentry events can get through
  const isPublicPath = 
    path.startsWith("/login") || 
    path.startsWith("/signup") || 
    path.startsWith("/verify") ||
    path.startsWith("/monitoring"); // <--- ADD THIS LINE

  if (isPublicPath && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isPublicPath && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};