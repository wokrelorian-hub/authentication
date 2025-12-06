"use client";

import { HeroUIProvider } from "@heroui/react";
import { FpjsProvider } from "@fingerprintjs/fingerprintjs-pro-react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      {/* Wrap everything in Fingerprint Provider */}
      <FpjsProvider
        loadOptions={{
          apiKey: process.env.NEXT_PUBLIC_FINGERPRINT_KEY || "",
          // "eu" region is strictly for Europe compliance. 
          // If you are global/US, you can remove the region or set it to "us".
          region: "us" 
        }}
      >
        {children}
      </FpjsProvider>
    </HeroUIProvider>
  );
}