import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR?.trim() || ".next",
  output: "standalone",
  outputFileTracingRoot: path.resolve(process.cwd(), "../.."),
  // Runtime data and local env files are never release artifacts.
  outputFileTracingExcludes: {
    "*": ["**/.data/**", "**/.env*"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  turbopack: {},
};

export default nextConfig;
