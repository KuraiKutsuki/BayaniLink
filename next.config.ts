import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ['192.168.254.106', '192.168.254.103', '10.94.78.1'],
};

export default nextConfig;
