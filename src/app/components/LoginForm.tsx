'use client';

import { TextInput, Button, Form, Stack, InlineLoading } from '@carbon/react';
import { ArrowRight, Locked, Email, Phone, FingerprintRecognition } from '@carbon/icons-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStytch } from '@stytch/nextjs';
import GoogleIcon from './GoogleIcon';

// Define the shape of a Stytch Error to fix the "any" warning
interface StytchError {
  error_type: string;
  message: string;
}

export default function LoginForm() {
  const router = useRouter();
  const stytch = useStytch();

  // --- STATE MANAGEMENT ---
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [methodId, setMethodId] = useState('');
  
  // Navigation Steps
  const [step, setStep] = useState<'identify' | 'channel_selection' | 'whatsapp_input' | 'otp' | 'create_password' | 'login'>('identify');
  const [loading, setLoading] = useState(false);
  
  // Ref to prevent double-firing Google One Tap
  const oneTapAttempted = useRef(false);

  // --- GOOGLE ONE TAP (Auto-Trigger) ---
  useEffect(() => {
    if (step === 'identify' && !oneTapAttempted.current) {
      oneTapAttempted.current = true;
      stytch.oauth.googleOneTap.start({
        login_redirect_url: 'http://localhost:3000/authenticate',
        signup_redirect_url: 'http://localhost:3000/authenticate',
      }).catch((err) => {
        console.log("One Tap skipped:", err);
      });
    }
  }, [stytch, step]);

  // Helper: Safe Error Handling
  const handleError = (err: unknown, defaultMsg: string) => {
    setLoading(false);
    const msg = err instanceof Error ? err.message : defaultMsg;
    alert(msg);
  };

  // --- HANDLER FUNCTIONS ---

  const handleGoogleLogin = () => {
    stytch.oauth.google.start({
      login_redirect_url: 'http://localhost:3000/authenticate',
      signup_redirect_url: 'http://localhost:3000/authenticate',
    });
  };

  const handlePasskeyLogin = async () => {
    setLoading(true);
    try {
      await stytch.webauthn.authenticate({ session_duration_minutes: 60 });
      router.push('/dashboard');
    } catch (err) {
      handleError(err, "Passkey login failed.");
    }
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. CHECK ORACLE DB
      const checkRes = await fetch('/api/check-user', {
        method: 'POST', body: JSON.stringify({ email }), headers: { 'Content-Type': 'application/json' }
      });
      const checkData = await checkRes.json();
      setLoading(false);

      if (checkData.exists) {
        setStep('login'); // User exists in Oracle -> Ask for Password
      } else {
        // New User -> Send Signup Email Code
        const signupRes = await fetch('/api/signup', {
          method: 'POST', body: JSON.stringify({ email }), headers: { 'Content-Type': 'application/json' }
        });
        const signupData = await signupRes.json();
        
        if (signupData.success) {
          setMethodId(signupData.method_id);
          setStep('otp');
        } else {
          alert("Error: " + (signupData.error || 'Signup failed'));
        }
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Connection Error");
    }
  };

  const handleSendEmailOTP = async () => {
    if (!email) {
      alert("Please enter your email first.");
      setStep('identify');
      return;
    }
    setLoading(true);
    try {
      const resp = await stytch.otps.email.loginOrCreate(email, { expiration_minutes: 5 });
      setMethodId(resp.method_id);
      setStep('otp');
      alert('Code sent to your email!');
    } catch (err) {
      handleError(err, "Failed to send code");
    }
  };

  const handleSendWhatsAppOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await stytch.otps.whatsapp.loginOrCreate(phoneNumber, { expiration_minutes: 5 });
      setMethodId(resp.method_id);
      setStep('otp');
      alert('Code sent to WhatsApp!');
    } catch (err) {
      handleError(err, "Failed to send WhatsApp code");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await stytch.otps.authenticate(otpCode, methodId, {
        session_duration_minutes: 60
      });
      
      // 2. SAVE USER TO ORACLE (The Magic Step)
      await fetch('/api/save-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email, 
          userID: resp.user_id 
        })
      });

      router.push('/dashboard'); 
    } catch (err) {
      handleError(err, "Invalid code");
    }
  };

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const strength = await stytch.passwords.strengthCheck({ email, password });
      if (!strength.valid_password) {
        setLoading(false);
        alert("Password weak: " + strength.feedback?.warning);
        return;
      }
      const resp = await stytch.passwords.resetBySession({ password, session_duration_minutes: 60 });
      
      // 3. SAVE USER TO ORACLE
      await fetch('/api/save-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email, 
          userID: resp.user.user_id 
        })
      });

      router.push('/dashboard'); 
    } catch (err) {
      handleError(err, "Error setting password");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await stytch.passwords.authenticate({ email, password, session_duration_minutes: 60 });
      router.push('/dashboard');
    } catch (err: unknown) {
      setLoading(false);
      
      // FIX: Check error type safely without using 'any'
      if (
        typeof err === 'object' && 
        err !== null && 
        'error_type' in err && 
        (err as StytchError).error_type === 'reset_password'
      ) {
        alert("Please reset your password.");
      } else {
        handleError(err, "Login failed");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (step === 'identify') handleContinue(e);
    else if (step === 'whatsapp_input') handleSendWhatsAppOTP(e);
    else if (step === 'otp') handleVerifyOtp(e);
    else if (step === 'create_password') handleCreatePassword(e);
    else if (step === 'login') handleLogin(e);
  };

  // --- RENDER UI ---
  return (
    <div style={{ width: '100%', maxWidth: '400px' }}>
      <Stack gap={7}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '400', marginBottom: '0.5rem', color: '#161616' }}>
            {step === 'identify' ? 'Sign In' : 
             step === 'channel_selection' ? 'Choose Method' :
             step === 'otp' ? 'Enter Code' : 'Secure Access'}
          </h2>
        </div>

        {/* STEP 1: INITIAL LOGIN SCREEN */}
        {step === 'identify' && (
          <>
            <Button 
              kind="tertiary" 
              onClick={handleGoogleLogin} 
              size="xl" 
              style={{ width: '100%' }} 
              renderIcon={GoogleIcon}
            >
              Continue with Google
            </Button>
            <Button 
              kind="ghost" 
              onClick={handlePasskeyLogin} 
              size="xl" 
              style={{ width: '100%', marginTop: '0.5rem' }} 
              renderIcon={FingerprintRecognition}
            >
              Sign in with FaceID / TouchID
            </Button>
          </>
        )}

        {/* CHANNEL SELECTION SCREEN */}
        {step === 'channel_selection' ? (
          <Stack gap={5}>
            <p style={{marginBottom: '1rem'}}>How would you like to receive your code?</p>
            <Button kind="tertiary" renderIcon={Email} size="xl" style={{ width: '100%' }} onClick={handleSendEmailOTP}>
              Email
            </Button>
            <Button kind="tertiary" renderIcon={Phone} size="xl" style={{ width: '100%' }} onClick={() => setStep('whatsapp_input')}>
              WhatsApp
            </Button>
            <Button kind="ghost" onClick={() => setStep('identify')}>Back to Password Login</Button>
          </Stack>
        ) : (
          /* FORM AREA FOR INPUTS */
          <Form onSubmit={handleSubmit}>
             <Stack gap={7}>
               {step === 'identify' && (
                 <TextInput id="email" labelText="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
               )}

               {step === 'whatsapp_input' && (
                 <TextInput id="phone" labelText="WhatsApp (e.g. +1...)" placeholder="+1234567890" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
               )}

               {step === 'otp' && (
                 <TextInput id="otp" labelText="Code" placeholder="123456" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
               )}

               {(step === 'login' || step === 'create_password') && (
                 <TextInput id="password" type="password" labelText={step === 'create_password' ? "Create a Password" : "Password"} value={password} onChange={(e) => setPassword(e.target.value)} />
               )}

               {loading ? <InlineLoading description="Processing..." /> : (
                 <Button 
                    renderIcon={step === 'otp' ? Locked : ArrowRight} 
                    type="submit" 
                    size="xl" 
                    style={{ width: '100%' }}
                 >
                   {step === 'identify' ? 'Continue' : 
                    step === 'whatsapp_input' ? 'Send Code' :
                    step === 'otp' ? 'Verify' : 
                    step === 'login' ? 'Sign In' : 'Set Password'}
                 </Button>
               )}

               {step === 'identify' && (
                 <Button kind="ghost" size="md" onClick={() => setStep('channel_selection')}>
                   Use a Login Code instead
                 </Button>
               )}
               {step === 'whatsapp_input' && (
                 <Button kind="ghost" onClick={() => setStep('channel_selection')}>Back</Button>
               )}
             </Stack>
          </Form>
        )}
      </Stack>
    </div>
  );
}