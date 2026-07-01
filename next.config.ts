import type { NextConfig } from "next";

// Derive the Supabase storage host from the public URL so a project-ref change
// doesn't silently break photo rendering. Falls back to the known host if the
// env isn't present at build time.
const FALLBACK_SUPABASE_HOST = "znlqvdyutuohqvriffum.supabase.co";
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname || FALLBACK_SUPABASE_HOST;
  } catch {
    return FALLBACK_SUPABASE_HOST;
  }
})();

// Baseline security headers applied to every route.
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Emit a self-contained server build for a small Docker image on Fly.
  output: "standalone",
  // Allow photo uploads through the createPiece server action (default is 1MB).
  experimental: {
    serverActions: { bodySizeLimit: "20mb" },
  },
  images: {
    // Next 16 requires an explicit qualities allowlist (default rendering is 75).
    qualities: [75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
