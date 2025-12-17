'use client';

import { Button, Grid, Column, InlineLoading, Tag } from '@carbon/react';
import { Logout, FingerprintRecognition, CheckmarkFilled } from '@carbon/icons-react';
import { useStytch, useStytchUser } from '@stytch/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const stytch = useStytch();
  const router = useRouter();
  const { user, isInitialized } = useStytchUser();
  const [registering, setRegistering] = useState(false);

  // Security Guard
  useEffect(() => {
    if (isInitialized && !user) {
      router.replace('/');
    }
  }, [user, isInitialized, router]);

  // --- FIX: GRACEFUL LOGOUT ---
  const handleLogout = async () => {
    try {
      await stytch.session.revoke();
    } catch { 
      // FIX: Removed '(err)' here. 
      // We don't need the error object, we just want to catch the failure.
      console.log("User was already logged out on server.");
    } finally {
      router.replace('/');
    }
  };

  // Register Passkey
  const handleRegisterPasskey = async () => {
    setRegistering(true);
    try {
      await stytch.webauthn.register();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      console.error(err);
      alert(msg);
    } finally {
      setRegistering(false);
    }
  };

  if (!isInitialized) return null;

  const hasPasskey = user?.webauthn_registrations && user.webauthn_registrations.length > 0;

  return (
    <div style={{ padding: '2rem', height: '100vh', background: '#f4f4f4' }}>
      <Grid>
        <Column lg={16} md={8} sm={4}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Dashboard</h1>
            <Button kind="danger" renderIcon={Logout} onClick={handleLogout}>Sign Out</Button>
          </div>

          {/* Main Card */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Welcome Back!</h2>
            <p style={{ fontSize: '1rem', color: '#525252', marginBottom: '2rem' }}>
              You are logged in as: <strong>{user?.emails[0]?.email || 'User'}</strong>
            </p>
            
            <hr style={{ margin: '2rem 0', border: '0', borderTop: '1px solid #e0e0e0' }} />

            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Security Settings</h3>

            {/* CONDITIONAL UI */}
            {hasPasskey ? (
              <Tag type="green" renderIcon={CheckmarkFilled} size="md">
                Biometric Login is Active
              </Tag>
            ) : (
              <>
                <p style={{ marginBottom: '1.5rem', color: '#525252' }}>
                  Enable <strong>FaceID / TouchID</strong> to sign in instantly next time.
                </p>

                {registering ? (
                  <InlineLoading description="Follow browser prompt..." />
                ) : (
                  <Button 
                    kind="tertiary" 
                    renderIcon={FingerprintRecognition} 
                    onClick={handleRegisterPasskey}
                  >
                    Enable FaceID / TouchID
                  </Button>
                )}
              </>
            )}

          </div>
        </Column>
      </Grid>
    </div>
  );
}