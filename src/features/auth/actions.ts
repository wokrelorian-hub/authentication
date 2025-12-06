"use server";

import client from "@/lib/stytch";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as bcrypt from "bcryptjs";
import { validateEmailSecurity } from "./validation";

// 1. Check Email
export async function checkEmailAction(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required" };

  const securityCheck = await validateEmailSecurity(email);
  if (!securityCheck.valid) {
    return { error: securityCheck.error };
  }

  try {
    const response = await client.users.search({
      cursor: undefined,
      limit: 1,
      query: {
        operator: "AND",
        operands: [{ filter_name: "email_address", filter_value: [email] }],
      },
    });
    return { userExists: response.results.length > 0, email };
  } catch {
    return { error: "Failed to verify email" };
  }
}

// 2. Send OTP
export async function sendOtpAction(email: string) {
  try {
    const response = await client.otps.email.loginOrCreate({ email });
    return { success: true, methodId: response.email_id };
  } catch {
    return { success: false, error: "Failed to send code" };
  }
}

// 3. Verify OTP
export async function verifyOtpAction(code: string, methodId: string) {
  try {
    const response = await client.otps.authenticate({
      method_id: methodId,
      code: code,
      session_duration_minutes: 60 * 24 * 30,
    });
    const cookieStore = await cookies();
    cookieStore.set("stytch_session", response.session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return { success: true };
  } catch {
    return { success: false, error: "Invalid code" };
  }
}

// 4. Authenticate Password
export async function authenticatePasswordAction(email: string, password: string) {
  try {
    const response = await client.passwords.authenticate({
      email,
      password,
      session_duration_minutes: 60 * 24 * 30,
    });
    const cookieStore = await cookies();
    cookieStore.set("stytch_session", response.session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return { success: true };
  } catch {
    return { success: false, error: "Incorrect password" };
  }
}

// 5. Create Password
export async function createPasswordAction(password: string) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("stytch_session")?.value;
  if (!sessionToken) return { success: false, error: "Unauthorized" };

  try {
    const sessionAuth = await client.sessions.authenticate({ session_token: sessionToken });
    const email = sessionAuth.user.emails[0].email;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await client.passwords.migrate({
      email: email,
      hash: hashedPassword,
      hash_type: "bcrypt",
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create password" };
  }
}

// 6. Logout
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("stytch_session");
  redirect("/login");
}

// 7. Get Google URL
export async function getGoogleUrlAction() {
  try {
    const publicToken = process.env.STYTCH_PUBLIC_TOKEN;
    const host = process.env.STYTCH_PROJECT_ENV === "live" ? "api.stytch.com" : "test.stytch.com";
    const redirectUrl = process.env.NEXT_PUBLIC_APP_URL + "/api/auth/callback";
    
    const queryParams = new URLSearchParams({
      public_token: publicToken as string,
      login_redirect_url: redirectUrl,
      signup_redirect_url: redirectUrl,
    });

    return { success: true, url: `https://${host}/v1/public/oauth/google/start?${queryParams.toString()}` };
  } catch {
    return { success: false, error: "Failed to start Google Auth" };
  }
}