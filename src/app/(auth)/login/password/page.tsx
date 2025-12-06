"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { SiteHeader } from "@/components/site-header";
import { Spinner } from "@/components/ui/spinner";
import { authenticatePasswordAction } from "@/features/auth/actions";

function PasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "user@example.com";
  
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validation Check
    if (!password) {
        setError("Your password is required.");
        return;
    }
    
    setIsLoading(true);
    const result = await authenticatePasswordAction(email, password);

    if (result.success) {
      router.push("/"); // Success -> Dashboard
    } else {
      setError(result.error || "Invalid password.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sans">
      
      {/* header */}
      <SiteHeader />

      <div className="absolute top-0 left-0 w-full h-[520px] bg-linear-to-b from-black/90 via-black/60 to-black z-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 pt-28 md:pt-36">
        <div className="w-full max-w-[540px]">
          <div className="bg-transparent px-0">
            <h1 className="text-[36px] md:text-4xl font-extrabold text-center text-white mb-4">
              Enter your password
            </h1>

            {/* Email pill with Change */}
            <div className="mx-auto max-w-[420px]">
              <div className="flex items-center justify-between bg-neutral-800/40 border border-neutral-700 rounded-md p-3 mb-4">
                <div className="text-sm text-neutral-200 break-words">{email}</div>
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="ml-4 text-sm text-neutral-200 bg-neutral-900/30 border border-neutral-700 px-3 py-1 rounded-sm hover:bg-neutral-900/50"
                >
                  Change
                </button>
              </div>

              {/* Form card */}
              <form onSubmit={handleSubmit} className="bg-black/60 border border-neutral-800 p-6 rounded-md">
                <div className="mb-4">
                  <PasswordInput
                    id="password"
                    name="password"
                    label="Password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    errorMessage={error}
                    disabled={isLoading}
                    className="bg-neutral-900 border border-neutral-700 text-white h-12 px-4 rounded-sm"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full font-bold text-base h-12 rounded-sm bg-[#E50914] hover:bg-[#f6121d] transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner size="md" color="white" /> : "Sign In"}
                </Button>

                {/* divider with or */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-neutral-700" />
                  <div className="text-sm text-neutral-500 uppercase tracking-wider">or</div>
                  <div className="flex-1 h-px bg-neutral-700" />
                </div>

                <Button
                  type="button"
                  className="w-full bg-neutral-700 text-white h-12 rounded-sm font-medium"
                >
                  Use Sign-in Code
                </Button>
              </form>

              {/* get help */}
              <div className="mt-6 text-sm text-neutral-300 flex items-center gap-2">
                <button className="inline-flex items-center gap-2 text-neutral-300 hover:underline">
                  <span>Get Help</span>
                  <span className="inline-block"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap in Suspense because we use useSearchParams
export default function PasswordPage() {
  return (
    <Suspense fallback={<div className="bg-black min-h-screen" />}>
      <PasswordContent />
    </Suspense>
  );
}