/** @type {import('next').NextConfig} */
const nextConfig = {
  // v0.6.4 Optimizations for SPA mode

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Output configuration for standalone server
  output: 'standalone',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,

  // Compression and optimization
  compress: true,
  swcMinify: true,

  // Power optimizations
  poweredByHeader: false,

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Experimental features for performance
  experimental: {
    optimizeCss: false,
    optimizePackageImports: [
      'lucide-react',
      '@tanstack/react-query',
      'zustand'
    ],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    NEXT_PUBLIC_WS_BASE_URL: process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:8000',
  },
  // Headers for security and performance
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
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;