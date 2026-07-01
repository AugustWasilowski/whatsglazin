import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server build for a small Docker image on Fly.
  output: "standalone",
  // Allow photo uploads through the createPiece server action (default is 1MB).
  experimental: {
    serverActions: { bodySizeLimit: "20mb" },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "znlqvdyutuohqvriffum.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
