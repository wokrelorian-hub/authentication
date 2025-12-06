"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { Spinner } from "@/components/ui/spinner";
import { Icon } from "@/components/ui/icon"; 
import { GoogleButton } from "@/components/auth/social-button"; // NEW IMPORT
import { checkEmailAction, getGoogleUrlAction } from "@/features/auth/actions"; // UPDATED IMPORT
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";
import { motion, AnimatePresence } from "framer-motion";

// --- ANIMATED HELP COMPONENT ---
function GetHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pt-1">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-1 text-[#ffffff] hover:underline text-[16px] font-medium transition-colors"
      >
        <span>Get Help</span>
        <span className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
            <Icon name="expand_more" size={20} />
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 pt-3 pl-1">
              <Link href="/login/help" className="text-[#ffffff] hover:underline text-[14px] underline">
                Forgot email address?
              </Link>
              <Link href="#" className="text-[#ffffff] hover:underline text-[14px] underline">
                Learn more about sign-in
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- MAIN PAGE ---
export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: fingerprintData } = useVisitorData();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleBlur = () => {
    if (!email.trim()) {
      setEmailError("Please enter a valid email address.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!email.trim()) {
        setEmailError("Please enter a valid email address.");
        return;
    }

    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const visitorId = fingerprintData?.visitorId || "unknown";
    formData.append("visitorId", visitorId);

    const result = await checkEmailAction(formData);

    if (result.error) {
      setEmailError(result.error); 
      setIsLoading(false);
      return;
    }

    if (result.userExists) {
      router.push(`/login/password?email=${encodeURIComponent(result.email as string)}`);
    } else {
      router.push(`/signup?email=${encodeURIComponent(result.email as string)}`);
    }
  };

  // --- NEW: GOOGLE LOGIN HANDLER ---
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const result = await getGoogleUrlAction();
    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      // In production, you might want a toast here instead of alert
      console.error(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sans">
      
      <SiteHeader />

      <div className="absolute top-0 left-0 w-full h-[500px] bg-linear-to-b from-black/80 via-black/50 to-black z-0 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 pt-32 md:pt-40">
        
        <div className="w-full max-w-[440px] space-y-5 bg-transparent">
            
            <div className="text-left space-y-1">
                <h1 className="text-[32px] font-extrabold leading-tight text-white">
                    Enter your info to sign in
                </h1>
                <p className="text-[18px] font-normal text-[#B3B3B3]">
                    Or get started with a new account.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="relative group">
                    <Input 
                        id="email"
                        name="email" 
                        type="email" 
                        label="Email address" 
                        required
                        
                        value={email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        errorMessage={emailError}

                        disabled={isLoading}
                        className="bg-transparent h-14 px-4 rounded-sm text-white focus:ring-0" 
                    />
                </div>
                
                <Button 
                    type="submit" 
                    className="w-full font-bold text-base h-12 rounded-sm mt-4 bg-[#E50914] hover:bg-[#f6121d] transition-all duration-200"
                    disabled={isLoading}
                >
                    {isLoading ? <Spinner size="md" color="white" /> : "Continue"}
                </Button>
            </form>

            {/* ANIMATED GET HELP SECTION */}
            <GetHelp />

            {/* --- NEW: GOOGLE INTEGRATION START --- */}
            <div className="pt-2 space-y-4">
                {/* Subtle Divider */}
                <div className="flex items-center gap-3">
                    <div className="h-px bg-[#333] flex-1"></div>
                    <span className="text-[#b3b3b3] text-xs font-medium uppercase">OR</span>
                    <div className="h-px bg-[#333] flex-1"></div>
                </div>

                {/* Google Button */}
                <GoogleButton onClick={handleGoogleLogin} disabled={isLoading}>
                    Sign in with Google
                </GoogleButton>
            </div>
            {/* --- NEW: GOOGLE INTEGRATION END --- */}

            <div className="text-[#8c8c8c] text-[13px] pt-4 leading-snug">
                This page is protected by Google reCAPTCHA to ensure you&apos;re not a bot. 
                <span className="text-blue-500 hover:underline cursor-pointer ml-1">Learn more.</span>
            </div>

        </div>
      </div>
    </div>
  );
}