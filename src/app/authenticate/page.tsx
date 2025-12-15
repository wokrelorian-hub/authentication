'use client';

import { useEffect } from 'react';
import { useStytch, useStytchSession } from '@stytch/nextjs';
import { useRouter } from 'next/navigation';
import { InlineLoading } from '@carbon/react';

export default function AuthenticatePage() {
  const stytch = useStytch();
  const { session } = useStytchSession();
  const router = useRouter();

  useEffect(() => {
    // If we are already logged in, go to dashboard
    if (session) {
      router.replace('/dashboard');
      return;
    }

    // Get the token from the URL
    const token = new URLSearchParams(window.location.search).get('token');
    const tokenType = new URLSearchParams(window.location.search).get('stytch_token_type');

    if (token && tokenType === 'oauth') {
      // Exchange the token for a session
      stytch.oauth.authenticate(token, {
        session_duration_minutes: 60,
      })
      .then(() => {
        router.replace('/dashboard');
      })
      .catch((err) => {
        console.error("OAuth Error:", err);
        alert("Login failed. Please try again.");
        router.replace('/');
      });
    } else {
      // If no token, go home
      router.replace('/');
    }
  }, [stytch, session, router]);

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <InlineLoading description="Finishing secure login..." />
    </div>
  );
}