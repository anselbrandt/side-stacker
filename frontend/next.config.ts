import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["air.anselbrandt.net"],
  output: 'export',
  distDir: 'dist',
};

export default nextConfig;
