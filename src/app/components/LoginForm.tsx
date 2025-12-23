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
  FingerprintRecognition,
  ArrowLeft
} from '@carbon/icons-react';
import { useState, useEffect, useRef, ComponentProps } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStytch, useStytchUser } from '@stytch/nextjs';
import { motion, AnimatePresence } from 'framer-motion'; 
import GoogleIcon from './GoogleIcon';

// --- CUSTOM COMPONENTS ---
const BoldArrowLeft = (props: ComponentProps<typeof ArrowLeft>) => (
  <ArrowLeft 
    {...props} 
    style={{ stroke: 'currentColor', strokeWidth: '1px', ...props.style }} 
  />
);

// --- TYPES ---
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
  const searchParams = useSearchParams(); 
  const stytch = useStytch();
  
  // 2. GET CURRENT USER
  const { user, isInitialized } = useStytchUser();

  // --- STATE ---
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState(''); 
  const [userName, setUserName] = useState(''); 
  
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [methodId, setMethodId] = useState('');
  const [userId, setUserId] = useState(''); 
  
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const [step, setStep] = useState<'identify' | 'name_input' | 'otp' | 'create_password' | 'login' | 'forgot_password'>('identify');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [resetToken, setResetToken] = useState<string | null>(null);
  
  const tokenProcessed = useRef(false);
  const oneTapAttempted = useRef(false);
  const googleCheckDone = useRef(false);

  // --- 1. DETECT MAGIC LINK & GOOGLE LOGIN ---
  useEffect(() => {
    // Wait for Stytch SDK to load
    if (!isInitialized) return;

    // A. Handle Magic Link Token
    const token = searchParams.get('token');
    if (token && !tokenProcessed.current) {
      console.log("Token detected:", token);
      tokenProcessed.current = true; 
      setTimeout(() => {
        setResetToken(token);
        setStep('create_password'); 
        setNotification({
          kind: 'info',
          title: 'Create New Password',
          subtitle: 'Please enter your new password below.'
        });
      }, 0);
      return;
    }

    // B. INTELLIGENT GOOGLE CHECK (FIXED LINTER ERROR)
    if (user && !googleCheckDone.current) {
        googleCheckDone.current = true;
        
        // FIX: Wrap in setTimeout to avoid "setState in effect" warning
        setTimeout(() => {
            setLoading(true);
            const userEmail = user.emails[0]?.email || '';
            
            fetch('/api/check-user', {
                method: 'POST', 
                body: JSON.stringify({ email: userEmail }), 
                headers: { 'Content-Type': 'application/json' }
            })
            .then(res => res.json())
            .then(data => {
                setLoading(false);
                if (data.exists) {
                    router.push('/dashboard');
                } else {
                    console.log("New Google User detected. Skipping OTP.");
                    setEmail(userEmail);
                    setUserId(user.user_id);
                    setStep('name_input'); 
                }
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
        }, 0);
    }
  }, [searchParams, user, isInitialized, router]);

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
    if (notification) setNotification(null);
  };

  // --- GOOGLE ONE TAP ---
  useEffect(() => {
    if (step === 'identify' && !oneTapAttempted.current && !resetToken && !user) {
      oneTapAttempted.current = true;
      stytch.oauth.googleOneTap.start({
        login_redirect_url: 'http://localhost:3000/authenticate',
        signup_redirect_url: 'http://localhost:3000/authenticate',
      }).catch((err) => {
        console.log("One Tap skipped:", err);
      });
    }
  }, [stytch, step, resetToken, user]);

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
      setLoading(false);
      setSuccess(true);
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

  const handleIdentify = async (e: React.FormEvent) => {
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

      if (checkData.exists) {
        setLoading(false);
        setUserName(checkData.name || ''); 
        setStep('login'); 
      } else {
        try {
            const resp = await stytch.otps.email.loginOrCreate(email, { expiration_minutes: 5 });
            setMethodId(resp.method_id);
            setLoading(false);
            setStep('otp'); 
        } catch (otpErr) {
            console.error(otpErr);
            setLoading(false);
            setNotification({
                kind: 'error',
                title: 'Email Delivery Failed',
                subtitle: 'We could not send the code. Please verify your email address.'
            });
        }
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setErrors({ otp: 'Verification code is required' });
      return;
    }
    setLoading(true);
    try {
      const resp = await stytch.otps.authenticate(otpCode, methodId, {
        session_duration_minutes: 60
      });
      setUserId(resp.user.user_id);
      setLoading(false);
      setStep('name_input');
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

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrors({ fullName: 'Name is required' });
      return;
    }
    setStep('create_password');
  };

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setErrors({ password: 'Password is required' }); return; }
    
    setLoading(true);
    setSuccess(false);

    try {
      const emailForCheck = email || undefined;
      const strength = await stytch.passwords.strengthCheck({ email: emailForCheck, password });
      if (!strength.valid_password) {
        setLoading(false);
        setErrors({ password: "Weak password: " + strength.feedback?.warning });
        return;
      }
      
      let currentUserId = userId;
      let finalEmail = email;

      if (resetToken) {
         const resp = await stytch.passwords.resetByEmail({ token: resetToken, password, session_duration_minutes: 60 });
         currentUserId = resp.user.user_id;
         finalEmail = resp.user.emails[0].email; 
      } else {
         const resp = await stytch.passwords.resetBySession({ password, session_duration_minutes: 60 });
         currentUserId = resp.user.user_id;
         if (!finalEmail && user) finalEmail = user.emails[0].email;
      }
      
      await fetch('/api/save-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: finalEmail, userID: currentUserId, fullName })
      });

      setLoading(false);
      setSuccess(true); 

    } catch (err) {
      console.error(err);
      setLoading(false);
      setSuccess(false);
      setNotification({ kind: 'error', title: 'Error', subtitle: 'Something went wrong.' });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
        setErrors({ password: 'Password is required' });
        return;
    }
    
    setLoading(true);
    setSuccess(false); 

    try {
      await stytch.passwords.authenticate({ email, password, session_duration_minutes: 60 });
      setLoading(false);
      setSuccess(true); 
    } catch (err: unknown) {
      setLoading(false);
      setSuccess(false);
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    if (!isValidEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    const domain = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    setLoading(true);
    try {
      await stytch.passwords.resetByEmailStart({
        email: email,
        login_redirect_url: `${domain}/`, 
        reset_password_redirect_url: `${domain}/`,
      });
      setLoading(false);
      setNotification({
        kind: 'success',
        title: 'Reset Link Sent',
        subtitle: `Check your inbox at ${email}. Click the link to reset your password.`
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
      setNotification({
        kind: 'error',
        title: 'Error Sending Email',
        subtitle: 'We could not send the reset link. Please try again later.'
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (step === 'identify') handleIdentify(e);
    else if (step === 'otp') handleVerifyOtp(e);
    else if (step === 'name_input') handleNameSubmit(e);
    else if (step === 'create_password') handleCreatePassword(e);
    else if (step === 'login') handleLogin(e);
    else if (step === 'forgot_password') handleForgotPassword(e); 
  };

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

    if (step === 'otp') title = 'Verification';
    if (step === 'name_input') title = 'Create your account';
    if (step === 'create_password') title = 'Create password';
    if (step === 'forgot_password') title = 'Reset password'; 
    
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
          size="lg" 
          style={{ width: '100%', maxWidth: '100%', border: '1px solid #8d8d8d', color: '#161616' }}
          onClick={handleGoogleLogin}
          renderIcon={GoogleIcon}
        >
          Continue with Google
        </Button>
        <Button 
          kind="ghost" 
          size="lg" 
          style={{ width: '100%', maxWidth: '100%', border: '1px solid #8d8d8d', color: '#161616' }}
          onClick={handlePasskeyLogin}
          renderIcon={FingerprintRecognition}
        >
          Sign in with Passkey
        </Button>
      </Stack>
    </div>
  );

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{
              duration: 0.24, // Carbon "Moderate-02"
              ease: [0.2, 0, 0.38, 0.9] // Carbon "Standard Productive"
            }}
            style={{ marginBottom: '2rem' }}
          >
            <InlineNotification
              kind={notification.kind}
              title={notification.title}
              subtitle={notification.subtitle}
              onClose={() => setNotification(null)}
              lowContrast={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {renderHeader()}

      <Form onSubmit={handleSubmit}>
          <Stack gap={6}>
            
            {(step === 'identify' || step === 'forgot_password') && (
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
                style={{ width: '100%', maxWidth: '100%' }}
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
                style={{ width: '100%', maxWidth: '100%' }}
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
                style={{ width: '100%', maxWidth: '100%' }}
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
                style={{ width: '100%', maxWidth: '100%' }}
                autoFocus
              />
            )}

          {/* MAIN ACTION BUTTON AREA */}
          {loading || success ? (
            <div style={{ 
              width: '100%', 
              height: '3rem', 
              display: 'flex', 
              alignItems: 'center',
              border: '1px solid #e0e0e0',
              paddingLeft: '1rem'
            }}>
              <InlineLoading
                style={{ marginLeft: 0 }}
                description={success ? 'Success!' : 'Processing...'}
                status={success ? 'finished' : 'active'}
                onSuccess={() => router.push('/dashboard')} 
              />
            </div>
          ) : (
            <Button 
              renderIcon={step === 'otp' ? Locked : ArrowRight} 
              type="submit" 
              size="lg" 
              style={{ width: '100%', maxWidth: 'none' }}
            >
              {step === 'identify' ? 'Continue' : 
               step === 'otp' ? 'Verify' :
               step === 'name_input' ? 'Next' :
               step === 'login' ? 'Sign in' : 
               step === 'forgot_password' ? 'Send reset email' : 'Finish & Sign in'}
            </Button>
          )}

            {/* CONTEXTUAL LINKS */}
            {(step === 'otp') && (
              <Button 
                kind="ghost" 
                hasIconOnly
                renderIcon={BoldArrowLeft}
                iconDescription="Back"
                tooltipPosition="right"
                onClick={() => setStep('identify')}
              />
            )}
            
            {step === 'login' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <Button kind="ghost" onClick={() => setStep('forgot_password')}>Forgot password?</Button>
                <Button 
                  kind="ghost" 
                  hasIconOnly
                  renderIcon={BoldArrowLeft}
                  iconDescription="Back"
                  tooltipPosition="right"
                  onClick={() => setStep('identify')}
                />
              </div>
            )}

            {step === 'forgot_password' && (
              <Button 
                kind="ghost" 
                hasIconOnly
                renderIcon={BoldArrowLeft}
                iconDescription="Back"
                tooltipPosition="right"
                onClick={() => setStep('login')}
              />
            )}

          </Stack>
      </Form>

      {step === 'identify' && renderAlternativeLogins()}
    </div>
  );
}