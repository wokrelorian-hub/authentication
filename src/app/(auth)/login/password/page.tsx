"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { SiteHeader } from "@/components/site-header";
import { Spinner } from "@/components/ui/spinner";
import { authenticatePasswordAction } from "@/features/auth/actions";
import { EmailDisplay } from "@/components/auth/email-display";
// 1. Import Tracking Tools
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";
import * as Sentry from "@sentry/nextjs";

function PasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // 2. Identify the User (Device Fingerprinting)
  const { data: fingerprintData } = useVisitorData();
  
  const email = searchParams.get("email");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 3. EFFECT: Tag Sentry with User Info immediately when page loads
  useEffect(() => {
    if (fingerprintData?.visitorId && email) {
      Sentry.setUser({ 
        email: email, 
        id: fingerprintData.visitorId // Maps Session to Physical Device
      });
    }
  }, [fingerprintData, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // --- SCENARIO A: HUMAN ERROR / BOT BEHAVIOR (Empty Password) ---
    if (!password) {
        const visitorId = fingerprintData?.visitorId || "unknown_device";
        
        // ADVANCED TRACKING:
        // Log this as a warning level event, not a crash.
        // We tag it so you can filter by "Serial Offenders" in your dashboard.
        Sentry.captureMessage("Security: Login Attempt with Empty Password", { 
          level: "warning",
          tags: {
            security_event: "empty_password",
            visitor_id: visitorId,
            target_email: email || "unknown",
          },
          extra: {
            timestamp: new Date().toISOString(),
            confidence: fingerprintData?.confidence?.score // Bot confidence score
          }
        });
        
        setError("Your password is required.");
        return;
    }
    
    if (!email) {
        router.push("/login");
        return;
    }
    
    setIsLoading(true);
    const result = await authenticatePasswordAction(email, password);

    if (result.success) {
      router.refresh();
      router.push("/"); 
    } else {
      // --- SCENARIO B: AUTHENTICATION FAILURE (Wrong Password) ---
      // We log this to track brute-force attacks on specific accounts
      Sentry.captureMessage("Security: Failed Login Action", {
        level: "info",
        tags: {
            reason: "invalid_credentials",
            email: email
        }
      });

      setError(result.error || "Incorrect password. Please try again.");
      setIsLoading(false);
    }
  };

  if (!email && typeof window !== "undefined") {
      router.replace("/login");
      return null; 
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sans">
      <SiteHeader />
      <div className="absolute top-0 left-0 w-full h-[500px] bg-linear-to-b from-black/80 via-black/50 to-black z-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 pt-32 md:pt-40">
        <div className="w-full max-w-[440px] space-y-6">
            <div className="text-left">
                <h1 className="text-[32px] font-extrabold text-white mb-6">
                    Enter your password
                </h1>
                <EmailDisplay email={email || ""} />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="relative group mb-6"> 
                  <PasswordInput
                    id="password"
                    name="password"
                    label="Password"
                    value={password}
                    onChange={(e) => { 
                        setPassword(e.target.value); 
                        if (error) setError(""); 
                    }}
                    errorMessage={error}
                    disabled={isLoading}
                    autoFocus
                    className="bg-transparent h-14 px-4 rounded-sm text-white focus:ring-0"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full font-bold text-base h-12 rounded-[4px] bg-[#E50914] hover:bg-[#f6121d] transition-all duration-200"
                >
                  {isLoading ? <Spinner size="md" color="white" /> : "Sign In"}
                </Button>

                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-[#737373]" />
                  <div className="text-sm font-bold text-[#b3b3b3] uppercase">or</div>
                  <div className="flex-1 h-px bg-[#737373]" />
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full h-12 rounded-[4px] bg-[#ffffff1a] hover:bg-[#ffffff2a] text-white font-medium text-[16px]"
                >
                  Use Sign-in Code
                </Button>

                <div className="flex justify-center mt-6">
                    <button type="button" className="text-white hover:underline text-[16px]">
                        Forgot password?
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}

export default function PasswordPage() {
  return (
    <Suspense fallback={<div className="bg-black min-h-screen" />}>
      <PasswordContent />
    </Suspense>
  );
}