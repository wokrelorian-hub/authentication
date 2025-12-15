'use client';

import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Form, 
  Stack, 
  InlineLoading, 
  InlineNotification 
} from '@carbon/react';
import { 
  ArrowRight, 
  Locked, 
  Email, 
  Phone, 
  FingerprintRecognition
} from '@carbon/icons-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStytch } from '@stytch/nextjs';
import GoogleIcon from './GoogleIcon';

interface StytchError {
  error_type: string;
  message: string;
}

interface NotificationState {
  kind: 'error' | 'info' | 'success' | 'warning';
  title: string;
  subtitle: string;
}

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

export default function LoginForm() {
  const router = useRouter();
  const stytch = useStytch();

  // --- STATE ---
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState(''); 
  const [userName, setUserName] = useState(''); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [methodId, setMethodId] = useState('');
  
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const [step, setStep] = useState<'identify' | 'name_input' | 'channel_selection' | 'whatsapp_input' | 'otp' | 'create_password' | 'login'>('identify');
  const [loading, setLoading] = useState(false);
  
  const oneTapAttempted = useRef(false);

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
    if (notification) setNotification(null);
  };

  // --- GOOGLE ONE TAP ---
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

  // --- HANDLERS ---
  const handleGoogleLogin = () => {
    stytch.oauth.google.start({
      login_redirect_url: 'http://localhost:3000/authenticate',
      signup_redirect_url: 'http://localhost:3000/authenticate',
    });
  };

  const handlePasskeyLogin = async () => {
    setLoading(true);
    setNotification(null);
    try {
      await stytch.webauthn.authenticate({ session_duration_minutes: 60 });
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setLoading(false);
      setNotification({
        kind: 'error',
        title: 'Biometric Login Failed',
        subtitle: 'We could not verify your identity. Please try another method.'
      });
    }
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    if (!isValidEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);

    try {
      const checkRes = await fetch('/api/check-user', {
        method: 'POST', body: JSON.stringify({ email }), headers: { 'Content-Type': 'application/json' }
      });
      const checkData = await checkRes.json();
      setLoading(false);

      if (checkData.exists) {
        setUserName(checkData.name || ''); 
        setStep('login'); 
      } else {
        setStep('name_input');
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setNotification({
        kind: 'error',
        title: 'Connection Error',
        subtitle: 'Unable to reach the server. Please check your internet connection.'
      });
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrors({ fullName: 'Name is required' });
      return;
    }
    setStep('channel_selection');
  };

  const handleSendEmailOTP = async () => {
    setLoading(true);
    try {
      const resp = await stytch.otps.email.loginOrCreate(email, { expiration_minutes: 5 });
      setMethodId(resp.method_id);
      setStep('otp');
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setNotification({
        kind: 'error',
        title: 'Email Delivery Failed',
        subtitle: 'We could not send the code. Please verify your email address.'
      });
    }
  };

  const handleSendWhatsAppOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setErrors({ phone: 'Phone number is required' });
      return;
    }
    setLoading(true);
    try {
      const resp = await stytch.otps.whatsapp.loginOrCreate(phoneNumber, { expiration_minutes: 5 });
      setMethodId(resp.method_id);
      setStep('otp');
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setNotification({
        kind: 'error',
        title: 'WhatsApp Delivery Failed',
        subtitle: 'Check the number format (e.g., +1234567890) and try again.'
      });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setErrors({ otp: 'Verification code is required' });
      return;
    }
    setLoading(true);
    try {
      // 1. Verify OTP with Stytch (logs the user in)
      await stytch.otps.authenticate(otpCode, methodId, {
        session_duration_minutes: 60
      });
      
      // 2. STOP! Don't save yet. Go to password creation.
      setLoading(false);
      setStep('create_password');

    } catch (err) {
      console.error(err);
      setLoading(false);
      setNotification({
        kind: 'error',
        title: 'Invalid Code',
        subtitle: 'The code you entered is incorrect or expired. Please try again.'
      });
    }
  };

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
        setErrors({ password: 'Password is required' });
        return;
    }
    setLoading(true);
    try {
      const strength = await stytch.passwords.strengthCheck({ email, password });
      if (!strength.valid_password) {
        setLoading(false);
        setErrors({ password: "Weak password: " + strength.feedback?.warning });
        return;
      }
      
      // 3. Set the Password (attach to the current session)
      const resp = await stytch.passwords.resetBySession({ password, session_duration_minutes: 60 });
      
      // 4. NOW Save the user to Oracle (Registration Complete)
      await fetch('/api/save-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email, 
          userID: resp.user.user_id,
          fullName: fullName // Save the name we asked for earlier!
        })
      });

      router.push('/dashboard'); 
    } catch (err) {
      console.error(err);
      setLoading(false);
      setNotification({
        kind: 'error',
        title: 'Error Setting Password',
        subtitle: 'Something went wrong. Please try a different password.'
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
        setErrors({ password: 'Password is required' });
        return;
    }
    setLoading(true);
    try {
      await stytch.passwords.authenticate({ email, password, session_duration_minutes: 60 });
      router.push('/dashboard');
    } catch (err: unknown) {
      setLoading(false);
      console.error(err);
      
      if (typeof err === 'object' && err !== null && 'error_type' in err && (err as StytchError).error_type === 'reset_password') {
        setNotification({
          kind: 'warning',
          title: 'Password Reset Required',
          subtitle: 'For your security, please reset your password.'
        });
      } else {
        setNotification({
          kind: 'error',
          title: 'Login Failed',
          subtitle: 'Incorrect email or password. Please check your credentials.'
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (step === 'identify') handleContinue(e);
    else if (step === 'name_input') handleNameSubmit(e);
    else if (step === 'whatsapp_input') handleSendWhatsAppOTP(e);
    else if (step === 'otp') handleVerifyOtp(e);
    else if (step === 'create_password') handleCreatePassword(e);
    else if (step === 'login') handleLogin(e);
  };

  // --- RENDER HELPERS ---

  const renderHeader = () => {
    let title = 'Log in';
    
    if (step === 'login') {
      if (userName) {
        const firstName = userName.split(' ')[0]; 
        title = `Welcome back, ${firstName}!`;
      } else {
        title = 'Welcome back!';
      }
    }

    if (step === 'name_input') title = 'Create your account';
    if (step === 'channel_selection') title = 'Choose method';
    if (step === 'otp') title = 'Verification';
    if (step === 'create_password') title = 'Create password';
    
    const isBigHeader = step === 'login' || step === 'identify';

    return (
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: isBigHeader ? '3rem' : '2rem', 
          fontWeight: isBigHeader ? 600 : 400,     
          fontFamily: isBigHeader ? "'IBM Plex Sans', sans-serif" : 'inherit', 
          color: '#161616', 
          margin: 0,
          lineHeight: '1.2'
        }}>
          {title}
        </h1>
        
        {step === 'identify' && (
          <p style={{ 
            marginTop: '1rem', 
            color: '#525252', 
            fontSize: '1.125rem', 
            fontWeight: isBigHeader ? 500 : 400,
            fontFamily: "'IBM Plex Sans', sans-serif"
          }}>
            Or get started with a new account.
          </p>
        )}
      </div>
    );
  };

  const renderAlternativeLogins = () => (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
        <span style={{ padding: '0 1rem', color: '#525252', fontSize: '0.875rem' }}>or</span>
        <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
      </div>
      
      <Stack gap={5}>
        <Button 
          kind="ghost" 
          size="xl" 
          style={{ width: '100%', border: '1px solid #8d8d8d', color: '#161616' }}
          onClick={handleGoogleLogin}
          renderIcon={GoogleIcon}
        >
          Continue with Google
        </Button>
        <Button 
          kind="ghost" 
          size="xl" 
          style={{ width: '100%', border: '1px solid #8d8d8d', color: '#161616' }}
          onClick={handlePasskeyLogin}
          renderIcon={FingerprintRecognition}
        >
          Sign in with Passkey
        </Button>
      </Stack>
    </div>
  );

  return (
    <div style={{ width: '100%' }}>
      {notification && (
        <div style={{ marginBottom: '2rem' }}>
          <InlineNotification
            kind={notification.kind}
            title={notification.title}
            subtitle={notification.subtitle}
            onClose={() => setNotification(null)}
            lowContrast={true}
          />
        </div>
      )}

      {renderHeader()}

      {/* CHANNEL SELECTION */}
      {step === 'channel_selection' ? (
        <Stack gap={5}>
          <p style={{marginBottom: '1rem', fontSize: '1rem'}}>
            How would you like to receive your code?
          </p>
          <Button 
            kind="tertiary" 
            renderIcon={Email} 
            size="xl" 
            style={{ width: '100%' }} 
            onClick={handleSendEmailOTP}
          >
            Email
          </Button>
          <Button 
            kind="tertiary" 
            renderIcon={Phone} 
            size="xl" 
            style={{ width: '100%' }} 
            onClick={() => setStep('whatsapp_input')}
          >
            WhatsApp
          </Button>
          <Button 
            kind="ghost" 
            size="md"
            style={{ marginTop: '1rem' }}
            onClick={() => setStep('identify')}
          >
            Back to login
          </Button>
        </Stack>
      ) : (
        /* FORM AREA */
        <Form onSubmit={handleSubmit}>
           <Stack gap={6}>
             
             {step === 'identify' && (
               <TextInput 
                 id="email" 
                 labelText="Email address"
                 placeholder="name@example.com" 
                 size="xl" 
                 value={email} 
                 invalid={!!errors.email}
                 invalidText={errors.email}
                 onChange={(e) => {
                   setEmail(e.target.value);
                   clearError('email');
                 }}
                 autoFocus
               />
             )}

             {step === 'name_input' && (
               <TextInput 
                 id="fullname" 
                 labelText="Full Name"
                 placeholder="e.g. John Doe" 
                 size="xl"
                 value={fullName} 
                 invalid={!!errors.fullName}
                 invalidText={errors.fullName}
                 onChange={(e) => {
                   setFullName(e.target.value);
                   clearError('fullName');
                 }}
                 autoFocus
               />
             )}

             {step === 'whatsapp_input' && (
               <TextInput 
                 id="phone" 
                 labelText="WhatsApp number"
                 placeholder="+1234567890" 
                 size="xl"
                 value={phoneNumber} 
                 invalid={!!errors.phone}
                 invalidText={errors.phone}
                 onChange={(e) => {
                   setPhoneNumber(e.target.value);
                   clearError('phone');
                 }}
                 autoFocus
               />
             )}

             {step === 'otp' && (
               <TextInput 
                 id="otp" 
                 labelText="Verification code"
                 placeholder="123456" 
                 size="xl"
                 value={otpCode} 
                 invalid={!!errors.otp}
                 invalidText={errors.otp}
                 onChange={(e) => {
                   setOtpCode(e.target.value);
                   clearError('otp');
                 }}
                 autoFocus
               />
             )}

             {(step === 'login' || step === 'create_password') && (
               <PasswordInput 
                 id="password" 
                 labelText={step === 'create_password' ? "Create a password" : "Password"} 
                 size="lg"
                 value={password} 
                 invalid={!!errors.password}
                 invalidText={errors.password}
                 onChange={(e) => {
                   setPassword(e.target.value);
                   clearError('password');
                 }}
                 autoFocus
               />
             )}

             {/* 2. MAIN ACTION BUTTON */}
             {loading ? (
                <div style={{ width: '100%', height: '64px', display: 'flex', alignItems: 'center' }}>
                  <InlineLoading description="Processing..." />
                </div>
             ) : (
               <Button 
                  renderIcon={step === 'otp' ? Locked : ArrowRight} 
                  type="submit" 
                  size="xl" 
                  style={{ width: '100%' }}
                  disabled={loading}
               >
                 {step === 'identify' ? 'Continue' : 
                  step === 'name_input' ? 'Next' :
                  step === 'whatsapp_input' ? 'Send code' :
                  step === 'otp' ? 'Verify' : 
                  step === 'login' ? 'Sign in' : 'Set password'}
               </Button>
             )}

             {/* 3. CONTEXTUAL LINKS */}
             {(step === 'whatsapp_input' || step === 'name_input') && (
               <Button kind="ghost" onClick={() => setStep('identify')}>Back</Button>
             )}
             
             {step === 'login' && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                 <Button kind="ghost" onClick={() => alert("Forgot Password functionality coming soon!")}>Forgot password?</Button>
                 <Button kind="ghost" onClick={() => setStep('identify')}>Back</Button>
               </div>
             )}
           </Stack>
        </Form>
      )}

      {/* 4. ALTERNATIVE LOGINS (Only on first screen) */}
      {step === 'identify' && renderAlternativeLogins()}
    </div>
  );
}