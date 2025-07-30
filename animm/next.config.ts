import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all hostnames
      },
      {
        protocol: 'http',
        hostname: '**', // Allow all hostnames
      },
    ],
    unoptimized: true, // Disable Next.js image optimization for external images
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
