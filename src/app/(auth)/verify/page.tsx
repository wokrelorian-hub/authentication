"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { verifyOtpAction, sendOtpAction } from "@/features/auth/actions";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const email = searchParams.get("email");
  const [methodId, setMethodId] = useState(searchParams.get("methodId")); 
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    setMethodId(searchParams.get("methodId"));
  }, [searchParams]);

  const handleVerify = async () => {
    if (!methodId) {
      alert("Error: Missing verification ID. Please try signing up again.");
      return;
    }

    setIsLoading(true);
    const result = await verifyOtpAction(code, methodId);

    if (result.success) {
      // SUCCESS: Redirect to Setup Password
      router.push("/setup/password"); 
    } else {
      alert("Error: " + result.error);
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    const result = await sendOtpAction(email);
    if (result.success && result.methodId) {
      setMethodId(result.methodId);
      alert("New code sent!");
    } else {
      alert("Failed to resend code.");
    }
    setIsResending(false);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black bg-opacity-95">
      <Card className="w-full max-w-[440px] border-none bg-transparent text-white shadow-none sm:p-0">
        <CardHeader className="px-0 pb-2">
          <CardDescription className="text-neutral-400 uppercase text-xs font-bold tracking-wider mb-1">
            Step 2 of 3
          </CardDescription>
          <CardTitle className="text-3xl font-bold">Verify your email</CardTitle>
          <CardDescription className="text-lg text-neutral-300">
            We sent a code to <span className="font-bold">{email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 flex flex-col gap-6">
          <div className="flex justify-center py-4">
             <InputOTP maxLength={6} value={code} onChange={(value) => setCode(value)}>
              <InputOTPGroup className="gap-2">
                {[0,1,2,3,4,5].map((idx) => (
                  <InputOTPSlot key={idx} index={idx} className="h-12 w-10 border-neutral-600 bg-neutral-900 text-white text-xl" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button onClick={handleVerify} className="w-full h-12 bg-red-600 text-xl font-medium hover:bg-red-700 text-white rounded-sm" disabled={isLoading || code.length < 6}>
            {isLoading ? "Verifying..." : "Verify Code"}
          </Button>
          <button onClick={handleResend} disabled={isResending} className="text-neutral-400 text-sm hover:underline hover:text-white transition-colors disabled:opacity-50">
            {isResending ? "Sending..." : "Didn't receive a code? Resend"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}