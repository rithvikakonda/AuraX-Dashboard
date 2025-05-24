import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  images: {
    domains: ["localhost"], // Allow images from localhost
  },
};

export default nextConfig;
