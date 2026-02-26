import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cbu01.alicdn.com",
      },
      {
        protocol: "https",
        hostname: "*.cjdropshipping.com",
      },
      {
        protocol: "https",
        hostname: "cc-west-usa.oss-us-west-1.aliyuncs.com",
      },
      // Additional CJ CDN domains
      {
        protocol: "https",
        hostname: "*.alicdn.com",
      },
      {
        protocol: "https",
        hostname: "*.aliyuncs.com",
      },
      {
        protocol: "http",
        hostname: "cbu01.alicdn.com",
      },
    ],
  },
};

export default nextConfig;
