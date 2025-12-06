import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/stytch";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // 1. Get the token from the URL
  const token = searchParams.get("token");
  const tokenType = searchParams.get("stytch_token_type");

  if (!token || tokenType !== "oauth") {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  try {
    // 2. Exchange the token for a Session
    const response = await client.oauth.authenticate({
      token: token,
      session_duration_minutes: 60 * 24 * 30, // 30 Days
    });

    // 3. Set the Session Cookie
    const cookieStore = await cookies();
    cookieStore.set("stytch_session", response.session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    // 4. Redirect to Dashboard
    return NextResponse.redirect(new URL("/", request.url));
    
  } catch (error) {
    console.error("OAuth Error:", error);
    return NextResponse.redirect(new URL("/login?error=oauth_error", request.url));
  }
}