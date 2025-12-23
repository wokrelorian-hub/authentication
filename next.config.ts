import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* We don't need the sassOptions anymore */
};

export default withSentryConfig(nextConfig, {
  org: "sentry",
  project: "tubovideo",
  sentryUrl: "http://sentry.tubovideo.com:9000/",

  // --- ADD THESE TWO LINES TO FIX THE BUILD ERROR ---
  sourcemaps: {
    disable: true, // Tells Sentry NOT to upload maps during build
  },
  authToken: process.env.SENTRY_AUTH_TOKEN, 
  // --------------------------------------------------

  silent: !process.env.CI,
  widenClientFileUpload: true,

  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  }
});