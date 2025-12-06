"use client"; // Needed for the interactive click state

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { SiteHeader } from "@/components/site-header";
import { GoogleButton } from "@/components/auth/social-button";
import { Spinner } from "@/components/ui/spinner"; 

export default function TestLab() {
  // State to simulate the loading effect
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulateLogin = () => {
    setIsLoading(true);
    // Reset after 3 seconds so you can test it again
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#121212] text-white overflow-hidden overflow-y-auto">
      
      <SiteHeader />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 gap-12 py-24">
        
        {/* ------------------------------------------- */}
        {/* TEST 1: INTERACTIVE LOGIN CARD */}
        {/* ------------------------------------------- */}
        <div className="w-full max-w-md bg-black/40 backdrop-blur-sm p-8 rounded-xl space-y-6 shadow-2xl border border-neutral-800">
            <div className="text-center space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Sign In</h1>
                <p className="text-neutral-400">Click the button below to test the spinner.</p>
            </div>

            <div className="pt-2">
                <GoogleButton>Sign up with Google</GoogleButton>
            </div>

            <div className="flex items-center gap-3">
                <div className="h-px bg-neutral-700 flex-1"></div>
                <span className="text-neutral-400 font-bold text-xs uppercase tracking-wider">or</span>
                <div className="h-px bg-neutral-700 flex-1"></div>
            </div>

            <div className="space-y-5">
                <Input type="email" label="Email address" />
                <PasswordInput label="Password" />

                {/* THE CINEMATIC BUTTON */}
                <Button 
                    className="w-full font-bold text-lg" 
                    onClick={handleSimulateLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        /* STATE A: LOADING 
                           - Only the spinner shows (Text removed)
                           - Centered automatically by Flexbox
                           - Color: White (to contrast with Red button)
                           - Size: md (Balanced for 56px height)
                        */
                        <Spinner size="md" color="white" />
                    ) : (
                        /* STATE B: IDLE */
                        "Continue"
                    )}
                </Button>
            </div>
        </div>


        {/* ------------------------------------------- */}
        {/* TEST 2: SPINNER GALLERY */}
        {/* ------------------------------------------- */}
        <div className="w-full max-w-md space-y-4">
            <h2 className="text-neutral-500 text-xs font-bold uppercase tracking-widest text-center">
                Spinner Balance Check
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-black/40 p-6 rounded-lg border border-neutral-800 flex flex-col items-center justify-center gap-3">
                    <Spinner size="sm" color="danger" />
                    <span className="text-xs text-neutral-500">Small</span>
                </div>

                <div className="bg-black/40 p-6 rounded-lg border border-neutral-800 flex flex-col items-center justify-center gap-3">
                    <Spinner size="md" color="white" />
                    <span className="text-xs text-neutral-500">Medium</span>
                </div>

                <div className="bg-black/40 p-6 rounded-lg border border-neutral-800 flex flex-col items-center justify-center gap-3">
                    <Spinner size="lg" color="warning" />
                    <span className="text-xs text-neutral-500">Large</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}