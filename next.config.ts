import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  // Keep a dev server from colliding with `next build` or `next start` when both
  // are used for the submission preview at the same time.
  distDir: process.env.NODE_ENV === "development" ? process.env.VESTRA_DEV_DIST_DIR || ".next-dev" : ".next",
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.prestocks.com", pathname: "/logos/**" },
      { protocol: "https", hostname: "solana.com", pathname: "/src/img/branding/solanaLogoMark.svg" },
      { protocol: "https", hostname: "www.google.com", pathname: "/s2/favicons" },
    ],
  },
};

export default nextConfig;
