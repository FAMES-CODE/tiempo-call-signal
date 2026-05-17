import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // proxy.ts buffers bodies; default 10MB breaks large call-sheet photo uploads
    proxyClientMaxBodySize: "25mb",
  },
  async rewrites() {
    return [
      {
        source: "/:lng(en|fr|ar)/uploads/:path*",
        destination: "/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
