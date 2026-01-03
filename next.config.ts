import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Add your config options here */
  experimental: {
    // Example valid option
    // serverActions: true,
  },
  // Place turbopack config at the top-level (not under `experimental`)
  // to avoid "Unrecognized key(s) in object: 'turbopack' at \"experimental\"".
  turbopack: {
    root: './'
  }
};

export default nextConfig;