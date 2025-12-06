"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createPasswordAction } from "@/features/auth/actions";

export default function SetupPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await createPasswordAction(password);

    if (result.success) {
      alert("Account Created! Redirecting to Dashboard...");
      router.push("/"); // FINAL DESTINATION
    } else {
      alert(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white text-black">
      {/* Netflix 'Setup' pages are usually white, not black */}
      
      <Card className="w-full max-w-[440px] border-none shadow-none p-0">
        <CardHeader className="px-0 pb-2">
          <CardDescription className="text-neutral-600 uppercase text-xs font-bold tracking-wider mb-1">
            Step 3 of 3
          </CardDescription>
          <CardTitle className="text-3xl font-bold text-neutral-800">Create a password to start your membership</CardTitle>
          <CardDescription className="text-lg text-neutral-600 mt-2">
            Just a few more steps and you&apos;re done!
            <br />
            We hate paperwork, too.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-0 grid gap-4">
          <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
            <Input
              type="password"
              placeholder="Add a password"
              minLength={8}
              className="h-14 border-neutral-400 text-black placeholder:text-neutral-500 rounded-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button 
              type="submit" 
              className="w-full h-16 mt-2 bg-red-600 text-2xl font-medium hover:bg-red-700 text-white rounded-sm"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Next"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}