import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only ignore specific known issues, not all errors
  eslint: {
    ignoreDuringBuilds: false, // Let's see actual linting issues
    dirs: ['src'], // Only lint src directory
  },
  typescript: {
    ignoreBuildErrors: false, // Let's see actual TypeScript issues
  },
  
  // Webpack customizations - much more targeted
  webpack: (config, { isServer }) => {
    // Only add fallbacks for client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        // Keep crypto available for client-side (needed for auth-utils)
        // crypto: 'crypto-browserify', // If needed
      };
    }

    return config;
  },

  // Image optimization settings
  images: {
    domains: ['localhost'],
    unoptimized: true, // Simplified for development
  },
};

export default nextConfig;
