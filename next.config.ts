import type { NextConfig } from "next";

// Bundle analyzer for performance optimization
import withBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzerInstance = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Only ignore specific known issues, not all errors
  eslint: {
    ignoreDuringBuilds: false, // Let's see actual linting issues
    dirs: ['src'], // Only lint src directory
  },
  typescript: {
    ignoreBuildErrors: false, // Let's see actual TypeScript issues
  },
  
  experimental: {
    // Enable server actions for nonce support
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  
  // Webpack customizations - minimal fallbacks for Magic.link compatibility
  webpack: (config, { isServer }) => {
    // Only add fallbacks for client-side builds to prevent Node.js modules in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        // Magic.link admin SDK dependencies that are Node.js only
        encoding: false,
        bufferutil: false,
        'utf-8-validate': false,
      };
    }

    return config;
  },

  // Image optimization settings
  images: {
    domains: ['localhost'],
    unoptimized: true, // Simplified for development
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Security headers that don't require nonce (middleware handles CSP with nonce)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzerInstance(nextConfig);
