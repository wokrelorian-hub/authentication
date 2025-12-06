"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";
// NEW: Import the server action
import { sendOtpAction } from "@/features/auth/actions";

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "No email provided";
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);
    
    // 1. Call the Server Action
    const result = await sendOtpAction(email);

    if (result.success) {
      // 2. Redirect to Verify Page (we pass the methodId so we know what to verify)
      router.push(`/verify?email=${encodeURIComponent(email)}&methodId=${result.methodId}`);
    } else {
      alert("Error: " + result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black bg-opacity-95">
      <Card className="w-full max-w-[440px] border-none bg-transparent text-white shadow-none sm:p-0">
        <CardHeader className="px-0 pb-2">
          <CardDescription className="text-neutral-400 uppercase text-xs font-bold tracking-wider mb-1">
            Step 1 of 3
          </CardDescription>
          <CardTitle className="text-3xl font-bold">Review to continue</CardTitle>
          <CardDescription className="text-lg text-neutral-300">
            Looks like you are new here! Let&apos;s set up your account.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-0 grid gap-4">
          <div className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-700 rounded text-neutral-300">
            <span className="font-medium">{email}</span>
            <Link href="/login" className="text-blue-500 hover:underline text-sm font-bold">
              Change
            </Link>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="relative flex items-center">
                <input 
                    type="checkbox" 
                    id="offers" 
                    className="peer h-6 w-6 appearance-none border border-neutral-500 bg-transparent checked:bg-white checked:border-white focus:ring-0"
                />
                <Icon 
                    name="check" 
                    className="absolute left-0.5 top-0.5 hidden h-5 w-5 text-black peer-checked:block pointer-events-none" 
                    size={20}
                />
            </div>
            <label htmlFor="offers" className="text-neutral-400 text-sm select-none cursor-pointer">
              Please do not email me Netflix special offers.
            </label>
          </div>

          <Button 
            onClick={handleContinue}
            className="w-full h-12 mt-4 bg-red-600 text-xl font-medium hover:bg-red-700 text-white rounded-sm"
            disabled={isLoading}
          >
            {isLoading ? "Sending Code..." : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}