import { NextResponse } from 'next/server';
import * as stytch from 'stytch';

const client = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID || '',
  secret: process.env.STYTCH_SECRET || '',
  env: stytch.envs.test,
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    console.log(`DEBUG: Sending verification OTP to: ${email}`);

    // 1. Create (or Login) the user using Email OTP
    // This creates the user *without* a password first.
    const otpResp = await client.otps.email.loginOrCreate({
      email: email,
    });

    console.log('OTP Sent. Email ID:', otpResp.email_id);

    return NextResponse.json({ 
      success: true, 
      next_step: 'verify_otp', 
      method_id: otpResp.email_id, // We need this for Step 2
      user_id: otpResp.user_id 
    });

  } catch (error: unknown) {
    console.error('Signup OTP Error:', error);
    let errorMessage = 'Failed to send code';
    if (typeof error === 'object' && error !== null && 'error_message' in error) {
      errorMessage = (error as { error_message: string }).error_message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}