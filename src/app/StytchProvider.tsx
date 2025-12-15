'use client';

import { StytchProvider } from '@stytch/nextjs';
import { createStytchUIClient } from '@stytch/nextjs/ui';

// We initialize the Stytch UI Client here
// REPLACE with your "public-token-test-..."
const stytch = createStytchUIClient('public-token-test-9c25ceb5-0cc3-49a4-9544-c543a932837a');

export default function StytchProviderWrapper({ children }: { children: React.ReactNode }) {
  return <StytchProvider stytch={stytch}>{children}</StytchProvider>;
}